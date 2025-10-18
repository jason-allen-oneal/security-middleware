/**
 * Browser-safe exports for security middleware.
 *
 * This module provides browser-compatible functionality that doesn't depend on Node.js APIs.
 * Safe to use in edge runtime environments like Vercel Edge Functions or Cloudflare Workers.
 *
 * @module security-middleware/browser
 */
export { analyzeHeaders } from "./checks/headers.js";
export { analyzeCors } from "./checks/cors.js";
export { getIssues, addIssues, clearIssues } from "./state.js";
//# sourceMappingURL=index.browser.js.map