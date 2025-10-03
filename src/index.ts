// index.ts
// Middleware
export { securityMiddleware } from "./middleware/express.js";
export { withSecurity } from "./middleware/withSecurity.js";

// Types
export type { SecurityOptions, Issue } from "./types.js";

// Analyzers (safe)
export { analyzeHeaders } from "./checks/headers.js";
export { analyzeCors } from "./checks/cors.js";

// State (safe)
export { getIssues, addIssues, clearIssues } from "./state.js";
