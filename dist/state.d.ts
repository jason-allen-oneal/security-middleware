import type { Issue } from "./types.js";
/**
 * Add new security issues to the global issue collection.
 *
 * @param newIssues - Array of issues to add
 */
export declare function addIssues(newIssues: Issue[]): void;
/**
 * Retrieve all collected security issues, deduplicated by ID.
 * When multiple instances of the same issue are reported, only the first occurrence is returned.
 *
 * @returns Array of unique security issues
 */
export declare function getIssues(): Issue[];
/**
 * Clear all collected security issues from memory.
 */
export declare function clearIssues(): void;
