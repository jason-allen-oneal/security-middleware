/**
 * Node.js-specific exports for security middleware.
 * 
 * This module provides Node.js-only functionality that requires access to Node.js APIs
 * such as child_process for running npm audit.
 * 
 * @module security-middleware/node
 */

export { runNpmAudit } from "./checks/npmAudit.js";
