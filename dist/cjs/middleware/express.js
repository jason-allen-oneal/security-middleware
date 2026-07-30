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
exports.securityMiddleware = securityMiddleware;
const headers_js_1 = require("../checks/headers.js");
const cors_js_1 = require("../checks/cors.js");
const logger_js_1 = require("../logger.js");
const once_js_1 = require("../utils/once.js");
const state_js_1 = require("../state.js");
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
function securityMiddleware(userOpts = {}) {
    const opts = {
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
        logger: userOpts.logger || logger_js_1.defaultLogger,
    };
    const issueStore = (0, state_js_1.createIssueStore)(opts.state);
    if (opts.enabled !== false && opts.audit?.npm === true && opts.environment !== "prod") {
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
    return function (req, res, next) {
        const exposesIssues = opts.enabled !== false &&
            opts.environment === "dev" &&
            opts.issueEndpoint?.enabled === true;
        if (exposesIssues && req.path === opts.issueEndpoint?.path) {
            res.json({ issues: issueStore.getIssues() });
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
                    issues.push(...(0, headers_js_1.analyzeHeaders)(headers));
                }
                if (opts.checks?.cors) {
                    issues.push(...(0, cors_js_1.analyzeCors)(headers, opts));
                }
                if (issues.length) {
                    issueStore.addIssues(issues);
                    (0, state_js_1.addIssues)(issues);
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