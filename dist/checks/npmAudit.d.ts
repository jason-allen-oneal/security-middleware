import type { Issue, SecurityOptions } from "../types.js";
/**
 * Runs npm audit to check for known vulnerabilities in dependencies.
 * Results are cached based on the cacheMs option to avoid redundant scans.
 *
 * @param opts - Security middleware options containing audit configuration
 * @returns Array of issues representing audit findings or errors
 */
export declare function runNpmAudit(opts: SecurityOptions): Promise<Issue[]>;
