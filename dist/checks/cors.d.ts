import type { Issue, SecurityOptions } from "../types.js";
/**
 * Analyzes CORS headers for potential security misconfigurations.
 *
 * Checks for:
 * - Wildcard (*) origins that could expose APIs to unauthorized access
 * - Origins not in the trusted origins list
 * - Exposure of unsafe HTTP methods (PUT, DELETE, PATCH)
 *
 * @param headers - Response headers to analyze
 * @param opts - Security middleware options including CORS configuration
 * @returns Array of issues for any CORS misconfigurations
 */
export declare function analyzeCors(headers: Record<string, string | number | string[] | undefined>, opts: SecurityOptions): Issue[];
