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
/**
 * Create a bounded issue store. Issues are deduplicated by ID on write, expire
 * by age, and are evicted oldest-first when the count limit is reached.
 */
export declare function createIssueStore(options?: IssueStoreOptions): IssueStore;
export declare function addIssues(newIssues: Issue[]): void;
export declare function getIssues(): Issue[];
export declare function clearIssues(): void;
