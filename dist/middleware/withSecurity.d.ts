import type { SecurityOptions } from "../types.js";
interface ApiResponseLike {
    end: (...args: any[]) => any;
    getHeaders: () => Record<string, string | number | string[] | undefined>;
}
type ApiHandlerLike<Request, Response extends ApiResponseLike> = (req: Request, res: Response) => unknown | Promise<unknown>;
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
export declare function withSecurity<Request, Response extends ApiResponseLike>(handler: ApiHandlerLike<Request, Response>, userOpts?: SecurityOptions): (req: Request, res: Response) => Promise<unknown>;
export {};
