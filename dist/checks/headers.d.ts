import type { Issue } from "../types.js";
/**
 * Analyzes HTTP response headers for missing security headers.
 *
 * Checks for the presence of important security headers including:
 * - Strict-Transport-Security (HSTS)
 * - Content-Security-Policy (CSP)
 * - X-Frame-Options
 * - X-Content-Type-Options
 * - Referrer-Policy
 *
 * @param headers - Response headers to analyze
 * @returns Array of issues for any missing security headers
 */
export declare function analyzeHeaders(headers: Record<string, string | number | string[] | undefined>): Issue[];
