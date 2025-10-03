import type { Request, Response, NextFunction } from "express";
import { analyzeHeaders } from "../checks/headers.js";
import { analyzeCors } from "../checks/cors.js";
import { defaultLogger } from "../logger.js";
import type { SecurityOptions, Issue } from "../types.js";
import { runNpmAudit } from "../checks/npmAudit.js";
import { onceAsync } from "../utils/once.js";
import { addIssues, getIssues } from "../state.js";

export function securityMiddleware(userOpts: SecurityOptions = {}) {
  const opts: SecurityOptions = {
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

  // Run npm audit once
  if (opts.audit?.npm === true && opts.environment !== "prod") {
    const runAuditOnce = onceAsync(() => runNpmAudit(opts));
    void runAuditOnce().then((issues) => {
      addIssues(issues);
      issues.forEach(opts.logger!);
    });
  }

  return function (req: Request, res: Response, next: NextFunction) {
    // Overlay JSON endpoint
    if (req.path === "/__security") {
      res.json({ issues: getIssues() });
      return;
    }

    if (opts.enabled === false) return next();

    const originalEnd = res.end;
    res.end = function (chunk?: any, encoding?: any, cb?: any) {
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
          addIssues(issues);
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

      // @ts-ignore
      return originalEnd.call(this, chunk, encoding, cb);
    } as any;

    next();
  };
}
