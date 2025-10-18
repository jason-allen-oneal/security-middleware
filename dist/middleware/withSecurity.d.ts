import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import type { SecurityOptions } from "../types.js";
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
export declare function withSecurity(handler: NextApiHandler, userOpts?: SecurityOptions): (req: NextApiRequest, res: NextApiResponse) => Promise<unknown>;
