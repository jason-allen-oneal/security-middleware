import type { Request, Response, NextFunction } from "express";
import type { SecurityOptions } from "../types.js";
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
export declare function securityMiddleware(userOpts?: SecurityOptions): (req: Request, res: Response, next: NextFunction) => void;
