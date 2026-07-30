"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.withSecurity = withSecurity;
const headers_js_1 = require("../checks/headers.js");
const cors_js_1 = require("../checks/cors.js");
const logger_js_1 = require("../logger.js");
const once_js_1 = require("../utils/once.js");
const state_js_1 = require("../state.js");
/**
 * Higher-order function that wraps Next.js API route handlers with security analysis.
 *
 * This wrapper intercepts API responses to analyze security headers and CORS configuration.
 * It can also run npm audit on startup to detect vulnerable dependencies.
 *
 * @param handler - The Next.js API route handler to wrap
 * @param userOpts - Configuration options for the security middleware
 * @returns Wrapped API handler with security analysis
 *
 * @example
 * ```ts
 * import type { NextApiRequest, NextApiResponse } from "next";
 * import { withSecurity } from "@bluedot/security-middleware";
 *
 * function handler(req: NextApiRequest, res: NextApiResponse) {
 *   res.status(200).json({ ok: true });
 * }
 *
 * export default withSecurity(handler, {
 *   environment: "dev",
 *   audit: { npm: true },
 * });
 * ```
 */
function withSecurity(handler, userOpts = {}) {
    const opts = {
        enabled: userOpts.enabled ?? true,
        environment: userOpts.environment ?? (process.env.NODE_ENV === "production" ? "prod" : "dev"),
        checks: { headers: true, cors: true, ...(userOpts.checks || {}) },
        audit: { cacheMs: 300000, ...userOpts.audit },
        state: { maxIssues: 100, maxAgeMs: 60 * 60_000, ...(userOpts.state || {}) },
        cors: { trustedOrigins: [], allowlistWildcardInDev: false, ...(userOpts.cors || {}) },
        logger: userOpts.logger || logger_js_1.defaultLogger,
    };
    const issueStore = (0, state_js_1.createIssueStore)(opts.state);
    if (opts.enabled !== false && opts.audit?.npm && opts.environment !== "prod") {
        const runAuditOnce = (0, once_js_1.onceAsync)(async () => {
            const modulePath = "../checks/npm" + "Audit.js";
            const { runNpmAudit } = await Promise.resolve(`${modulePath}`).then(s => __importStar(require(s)));
            return runNpmAudit(opts);
        });
        void runAuditOnce().then((issues) => {
            issueStore.addIssues(issues);
            (0, state_js_1.addIssues)(issues);
            issues.forEach(opts.logger);
        });
    }
    return async function (req, res) {
        if (opts.enabled === false)
            return handler(req, res);
        const originalEnd = res.end.bind(res);
        res.end = ((...args) => {
            try {
                const headers = Object.fromEntries(Object.entries(res.getHeaders()).map(([k, v]) => [
                    k,
                    Array.isArray(v) ? v.join(", ") : (v ?? "").toString(),
                ]));
                const headerIssues = opts.checks?.headers ? (0, headers_js_1.analyzeHeaders)(headers) : [];
                const corsIssues = opts.checks?.cors ? (0, cors_js_1.analyzeCors)(headers, opts) : [];
                const all = [...headerIssues, ...corsIssues];
                if (all.length) {
                    issueStore.addIssues(all);
                    (0, state_js_1.addIssues)(all);
                }
                all.forEach(opts.logger);
            }
            catch (err) {
                opts.logger({
                    id: "middleware.error",
                    title: "Security middleware error",
                    description: String(err),
                    severity: "info",
                });
            }
            return originalEnd(...args);
        });
        return handler(req, res);
    };
}
//# sourceMappingURL=withSecurity.js.map