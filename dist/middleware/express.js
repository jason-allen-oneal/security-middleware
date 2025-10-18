import { analyzeHeaders } from "../checks/headers.js";
import { analyzeCors } from "../checks/cors.js";
import { defaultLogger } from "../logger.js";
import { onceAsync } from "../utils/once.js";
import { addIssues, getIssues } from "../state.js";
/**
 * Creates Express middleware for runtime security analysis.
 *
 * This middleware intercepts HTTP responses to analyze security headers and CORS configuration.
 * It can also run npm audit on startup to detect vulnerable dependencies.
 *
 * The middleware provides a special `/__security` endpoint that returns all collected issues
 * as JSON, which can be consumed by browser overlay scripts.
 *
 * @param userOpts - Configuration options for the security middleware
 * @returns Express middleware function
 *
 * @example
 * ```ts
 * import express from "express";
 * import { securityMiddleware } from "@bluedot/security-middleware";
 *
 * const app = express();
 *
 * app.use(securityMiddleware({
 *   environment: "dev",
 *   audit: { npm: true },
 * }));
 *
 * app.listen(3000);
 * ```
 */
export function securityMiddleware(userOpts = {}) {
    const opts = {
        enabled: true,
        environment: process.env.NODE_ENV === "production" ? "prod" : "dev",
        checks: { headers: true, cors: true, ...(userOpts.checks || {}) },
        audit: {
            cacheMs: 300000,
            ...userOpts.audit,
        },
        cors: { trustedOrigins: [], allowlistWildcardInDev: false, ...(userOpts.cors || {}) },
        logger: userOpts.logger || defaultLogger,
    };
    if (opts.audit?.npm === true && opts.environment !== "prod") {
        const runAuditOnce = onceAsync(async () => {
            const modulePath = "../checks/npm" + "Audit.js";
            const { runNpmAudit } = await import(/* webpackIgnore: true */ modulePath);
            return runNpmAudit(opts);
        });
        void runAuditOnce().then((issues) => {
            addIssues(issues);
            issues.forEach(opts.logger);
        });
    }
    return function (req, res, next) {
        if (req.path === "/__security") {
            res.json({ issues: getIssues() });
            return;
        }
        if (opts.enabled === false)
            return next();
        const originalEnd = res.end;
        res.end = function (chunk, encoding, cb) {
            try {
                const headers = res.getHeaders();
                const issues = [];
                if (opts.checks?.headers) {
                    issues.push(...analyzeHeaders(headers));
                }
                if (opts.checks?.cors) {
                    issues.push(...analyzeCors(headers, opts));
                }
                if (issues.length) {
                    addIssues(issues);
                }
                for (const issue of issues)
                    opts.logger(issue);
            }
            catch (err) {
                opts.logger({
                    id: "middleware.error",
                    title: "Security middleware error",
                    description: String(err),
                    severity: "info",
                });
            }
            return originalEnd.call(this, chunk, encoding, cb);
        };
        next();
    };
}
//# sourceMappingURL=express.js.map