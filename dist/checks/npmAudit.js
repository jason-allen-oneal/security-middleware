import { exec } from "node:child_process";
import { promisify } from "node:util";
const pexec = promisify(exec);
/**
 * Cache for npm audit results to avoid repeated expensive operations.
 */
let cache = null;
/**
 * Runs npm audit to check for known vulnerabilities in dependencies.
 * Results are cached based on the cacheMs option to avoid redundant scans.
 *
 * @param opts - Security middleware options containing audit configuration
 * @returns Array of issues representing audit findings or errors
 */
export async function runNpmAudit(opts) {
    const cacheMs = opts.audit?.cacheMs ?? 5 * 60_000;
    if (cache && Date.now() - cache.at < cacheMs)
        return cache.issues;
    try {
        const { stdout } = await pexec("npm audit --json", { timeout: 25000 });
        const data = JSON.parse(stdout);
        const issues = [];
        const total = data.total || 0;
        if (total > 0) {
            issues.push({
                id: "npm.audit.findings",
                title: `npm audit found ${total} vulnerability(ies)`,
                description: "Run `npm audit fix` where possible or review vulnerable packages.",
                severity: "warn",
                meta: { summary: data.metadata || undefined },
            });
        }
        else {
            issues.push({
                id: "npm.audit.clean",
                title: "npm audit: no known vulnerabilities",
                description: "Dependency scan is clean.",
                severity: "info",
            });
        }
        cache = { at: Date.now(), issues };
        return issues;
    }
    catch (err) {
        return [
            {
                id: "npm.audit.error",
                title: "npm audit could not run",
                description: String(err?.message || err),
                severity: "info",
            },
        ];
    }
}
//# sourceMappingURL=npmAudit.js.map