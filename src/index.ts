/**
 * @bluedot/security-middleware
 * 
 * Drop-in security linting middleware for Node.js and Next.js development and staging environments.
 * Provides runtime security checks for HTTP headers, CORS policies, and dependency vulnerabilities.
 * 
 * @module security-middleware
 */

export { securityMiddleware } from "./middleware/express.js";
export { withSecurity } from "./middleware/withSecurity.js";

export type { SecurityOptions, Issue } from "./types.js";

export { analyzeHeaders } from "./checks/headers.js";
export { analyzeCors } from "./checks/cors.js";

export { getIssues, addIssues, clearIssues } from "./state.js";
