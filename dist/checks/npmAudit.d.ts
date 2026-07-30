import type { Issue, SecurityOptions } from "../types.js";
type AuditExecutor = () => Promise<{
    stdout: string;
}>;
/** Parse modern or legacy npm audit JSON into middleware issues. */
export declare function parseNpmAuditJson(stdout: string): Issue[];
/**
 * Runs npm audit to check for known vulnerabilities in dependencies.
 * Results are cached based on the cacheMs option to avoid redundant scans.
 *
 * @param opts - Security middleware options containing audit configuration
 * @returns Array of issues representing audit findings or errors
 */
export declare function runNpmAudit(opts: SecurityOptions, executor?: AuditExecutor): Promise<Issue[]>;
export {};
