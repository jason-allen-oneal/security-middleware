import type { Issue } from "./types.js";

let issues: Issue[] = [];

export function addIssues(newIssues: Issue[]) {
  issues.push(...newIssues);
}

export function getIssues(): Issue[] {
  return issues;
}

export function clearIssues() {
  issues = [];
}
