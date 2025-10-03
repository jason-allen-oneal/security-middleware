// index.browser.ts - Browser/Edge-safe exports
// Analyzers (safe)
export { analyzeHeaders } from "./checks/headers.js";
export { analyzeCors } from "./checks/cors.js";

// State (safe)
export { getIssues, addIssues, clearIssues } from "./state.js";

// Types
export type { SecurityOptions, Issue } from "./types.js";
