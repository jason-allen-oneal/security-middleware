import type { Issue } from "./types.js";

let issues: Issue[] = [];

export function addIssues(newIssues: Issue[]) {
  issues.push(...newIssues);
}

export function getIssues(): Issue[] {
  // Deduplicate issues by ID, keeping the first occurrence
  const seen = new Set<string>();
  return issues.filter((issue) => {
    if (seen.has(issue.id)) {
      return false;
    }
    seen.add(issue.id);
    return true;
  });
}

export function clearIssues() {
  issues = [];
}
