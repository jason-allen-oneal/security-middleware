import type { Issue } from "./types.js";

/**
 * In-memory store for collected security issues.
 * This allows aggregating issues across multiple requests and retrieving them via the overlay endpoint.
 */
let issues: Issue[] = [];

/**
 * Add new security issues to the global issue collection.
 * 
 * @param newIssues - Array of issues to add
 */
export function addIssues(newIssues: Issue[]) {
  issues.push(...newIssues);
}

/**
 * Retrieve all collected security issues, deduplicated by ID.
 * When multiple instances of the same issue are reported, only the first occurrence is returned.
 * 
 * @returns Array of unique security issues
 */
export function getIssues(): Issue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    if (seen.has(issue.id)) {
      return false;
    }
    seen.add(issue.id);
    return true;
  });
}

/**
 * Clear all collected security issues from memory.
 */
export function clearIssues() {
  issues = [];
}
