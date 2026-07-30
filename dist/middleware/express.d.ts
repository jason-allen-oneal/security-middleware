import type { Request, Response, NextFunction } from "express";
import type { SecurityOptions } from "../types.js";
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
export declare function securityMiddleware(userOpts?: SecurityOptions): (req: Request, res: Response, next: NextFunction) => void;
