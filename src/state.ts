import type { Issue } from "./types.js";

export interface IssueStoreOptions {
  maxIssues?: number;
  maxAgeMs?: number;
  now?: () => number;
}

export interface IssueStore {
  addIssues(newIssues: Issue[]): void;
  getIssues(): Issue[];
  clearIssues(): void;
}

const DEFAULT_MAX_ISSUES = 100;
const DEFAULT_MAX_AGE_MS = 60 * 60_000;

function positiveInteger(value: number | undefined, fallback: number): number {
  return Number.isSafeInteger(value) && value! > 0 ? value! : fallback;
}

/**
 * Create a bounded issue store. Issues are deduplicated by ID on write, expire
 * by age, and are evicted oldest-first when the count limit is reached.
 */
export function createIssueStore(options: IssueStoreOptions = {}): IssueStore {
  const maxIssues = positiveInteger(options.maxIssues, DEFAULT_MAX_ISSUES);
  const maxAgeMs = positiveInteger(options.maxAgeMs, DEFAULT_MAX_AGE_MS);
  const now = options.now ?? Date.now;
  const issues = new Map<string, { issue: Issue; updatedAt: number }>();

  const prune = (at: number) => {
    for (const [id, entry] of issues) {
      if (at - entry.updatedAt >= maxAgeMs) issues.delete(id);
    }

    while (issues.size > maxIssues) {
      const oldestId = issues.keys().next().value as string | undefined;
      if (oldestId === undefined) break;
      issues.delete(oldestId);
    }
  };

  return {
    addIssues(newIssues) {
      const at = now();
      prune(at);
      for (const issue of newIssues) {
        const existing = issues.get(issue.id);
        if (existing) {
          // Preserve first-reported evidence and ordering while refreshing age.
          existing.updatedAt = at;
        } else {
          while (issues.size >= maxIssues) {
            const oldestId = issues.keys().next().value as string | undefined;
            if (oldestId === undefined) break;
            issues.delete(oldestId);
          }
          issues.set(issue.id, { issue, updatedAt: at });
        }
      }
    },
    getIssues() {
      prune(now());
      return Array.from(issues.values(), ({ issue }) => issue);
    },
    clearIssues() {
      issues.clear();
    },
  };
}

// Backwards-compatible default store for callers that use the state helpers
// directly. Middleware factories use their own stores for application isolation.
const defaultStore = createIssueStore();

export function addIssues(newIssues: Issue[]) {
  defaultStore.addIssues(newIssues);
}

export function getIssues(): Issue[] {
  return defaultStore.getIssues();
}

export function clearIssues() {
  defaultStore.clearIssues();
}
