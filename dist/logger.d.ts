import { Issue } from "./types.js";
/**
 * Default console logger for security issues.
 * Formats and colorizes output based on severity level.
 *
 * @param issue - The security issue to log
 */
export declare const defaultLogger: (issue: Issue) => void;
