import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { analyzeHeaders } from "../checks/headers.js";
import { analyzeCors } from "../checks/cors.js";
import type { SecurityOptions, Issue } from "../types.js";
import { defaultLogger } from "../logger.js";
import { onceAsync } from "../utils/once.js";
import { addIssues, getIssues } from "../state.js";

export function withSecurity(handler: NextApiHandler, userOpts: SecurityOptions = {}) {
  const opts: SecurityOptions = {
    enabled: true,
    environment: process.env.NODE_ENV === "production" ? "prod" : "dev",
    checks: { headers: true, cors: true, ...(userOpts.checks || {}) },
    audit: { cacheMs: 300000, ...userOpts.audit },
    cors: { trustedOrigins: [], allowlistWildcardInDev: false, ...(userOpts.cors || {}) },
    logger: userOpts.logger || defaultLogger,
  };

  // Run npm audit once at boot
  if (opts.audit?.npm && opts.environment !== "prod") {
    const runAuditOnce = onceAsync(async () => {
      // Use dynamic path to prevent webpack from bundling this module
      const modulePath = "../checks/npm" + "Audit.js";
      const { runNpmAudit } = await import(/* webpackIgnore: true */ modulePath);
      return runNpmAudit(opts);
    });
    void runAuditOnce().then((issues) => {
      addIssues(issues);
      issues.forEach(opts.logger!);
    });
  }

  return async function (req: NextApiRequest, res: NextApiResponse) {
    // Special endpoint for overlay
    if (req.url?.startsWith("/api/__security")) {
      res.status(200).json({ issues: getIssues() });
      return;
    }

    if (opts.enabled === false) return handler(req, res);

    // Wrap res.end to inspect final headers
    const originalEnd = res.end.bind(res);
    res.end = ((...args: any[]) => {
      try {
        const headers = Object.fromEntries(
          Object.entries(res.getHeaders()).map(([k, v]) => [
            k,
            Array.isArray(v) ? v.join(", ") : (v ?? "").toString(),
          ])
        );

        const headerIssues: Issue[] = opts.checks?.headers ? analyzeHeaders(headers) : [];
        const corsIssues: Issue[] = opts.checks?.cors ? analyzeCors(headers, opts) : [];

        const all = [...headerIssues, ...corsIssues];
        if (all.length) addIssues(all);
        all.forEach(opts.logger!);
      } catch (err) {
        opts.logger!({
          id: "middleware.error",
          title: "Security middleware error",
          description: String(err),
          severity: "info",
        });
      }
      // @ts-ignore
      return originalEnd(...args);
    }) as any;

    return handler(req, res);
  };
}
