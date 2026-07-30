import type { Request, Response, NextFunction } from "express";
import { analyzeHeaders } from "../checks/headers.js";
import { analyzeCors } from "../checks/cors.js";
import { defaultLogger } from "../logger.js";
import type { SecurityOptions, Issue } from "../types.js";
import { onceAsync } from "../utils/once.js";
import { addIssues as addLegacyIssues, createIssueStore } from "../state.js";

/**
 * Creates Express middleware for runtime security analysis.
 * 
 * This middleware intercepts HTTP responses to analyze security headers and CORS configuration.
 * It can also run npm audit on startup to detect vulnerable dependencies.
 * 
 * The middleware can expose an explicit development-only `/__security` endpoint
 * that returns the instance's collected issues as JSON for browser overlay scripts.
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
export function securityMiddleware(userOpts: SecurityOptions = {}) {
  const opts: SecurityOptions = {
    enabled: userOpts.enabled ?? true,
    environment: userOpts.environment ?? (process.env.NODE_ENV === "production" ? "prod" : "dev"),
    checks: { headers: true, cors: true, ...(userOpts.checks || {}) },
    audit: {
      cacheMs: 300000,
      ...userOpts.audit,
    },
    state: { maxIssues: 100, maxAgeMs: 60 * 60_000, ...(userOpts.state || {}) },
    issueEndpoint: { enabled: false, path: "/__security", ...(userOpts.issueEndpoint || {}) },
    cors: { trustedOrigins: [], allowlistWildcardInDev: false, ...(userOpts.cors || {}) },
    logger: userOpts.logger || defaultLogger,
  };
  const issueStore = createIssueStore(opts.state);

  if (opts.enabled !== false && opts.audit?.npm === true && opts.environment !== "prod") {
    const runAuditOnce = onceAsync(async () => {
      const modulePath = "../checks/npm" + "Audit.js";
      const { runNpmAudit } = await import(/* webpackIgnore: true */ modulePath);
      return runNpmAudit(opts);
    });
    void runAuditOnce().then((issues) => {
      issueStore.addIssues(issues);
      addLegacyIssues(issues);
      issues.forEach(opts.logger!);
    });
  }

  return function (req: Request, res: Response, next: NextFunction) {
    const exposesIssues =
      opts.enabled !== false &&
      opts.environment === "dev" &&
      opts.issueEndpoint?.enabled === true;

    if (exposesIssues && req.path === opts.issueEndpoint?.path) {
      res.json({ issues: issueStore.getIssues() });
      return;
    }

    if (opts.enabled === false) return next();

    const originalEnd = res.end;
    res.end = function (this: typeof res, chunk?: any, encoding?: any, cb?: any) {
      try {
        const headers = res.getHeaders();
        const issues: Issue[] = [];

        if (opts.checks?.headers) {
          issues.push(...analyzeHeaders(headers as any));
        }
        if (opts.checks?.cors) {
          issues.push(...analyzeCors(headers as any, opts));
        }

        if (issues.length) {
          issueStore.addIssues(issues);
          addLegacyIssues(issues);
        }

        for (const issue of issues) opts.logger!(issue);
      } catch (err) {
        opts.logger!({
          id: "middleware.error",
          title: "Security middleware error",
          description: String(err),
          severity: "info",
        });
      }

      return originalEnd.call(this, chunk, encoding, cb);
    } as any;

    next();
  };
}
