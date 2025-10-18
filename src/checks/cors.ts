import type { Issue, SecurityOptions } from "../types.js";

/**
 * Analyzes CORS headers for potential security misconfigurations.
 * 
 * Checks for:
 * - Wildcard (*) origins that could expose APIs to unauthorized access
 * - Origins not in the trusted origins list
 * - Exposure of unsafe HTTP methods (PUT, DELETE, PATCH)
 * 
 * @param headers - Response headers to analyze
 * @param opts - Security middleware options including CORS configuration
 * @returns Array of issues for any CORS misconfigurations
 */
export function analyzeCors(
  headers: Record<string, string | number | string[] | undefined>,
  opts: SecurityOptions
): Issue[] {
  const h = Object.fromEntries(
    Object.entries(headers).map(([k,v]) => [k.toLowerCase(), Array.isArray(v) ? v.join(', ') : (v ?? '').toString()])
  );

  const issues: Issue[] = [];
  const allowOrigin = h['access-control-allow-origin'];
  const allowMethods = (h['access-control-allow-methods'] || '').toUpperCase();

  if (allowOrigin === '*') {
    const allowWildcard = opts.cors?.allowlistWildcardInDev && (opts.environment === 'dev' || process.env.NODE_ENV === 'development');
    if (!allowWildcard) {
      issues.push({
        id: 'cors.origin.wildcard',
        title: 'CORS allows wildcard origin (*)',
        description: 'Wildcard origins are unsafe for authenticated APIs. Restrict to explicit origins.',
        severity: 'warn',
        docsUrl: 'https://developer.mozilla.org/docs/Web/HTTP/CORS'
      });
    }
  } else if (allowOrigin && opts.cors?.trustedOrigins?.length) {
    const trusted = opts.cors.trustedOrigins.map(o => o.toLowerCase());
    if (!trusted.includes(allowOrigin.toLowerCase())) {
      issues.push({
        id: 'cors.origin.untrusted',
        title: 'CORS allows an origin not in trusted list',
        description: `Origin ${allowOrigin} is not in trustedOrigins.`,
        severity: 'warn'
      });
    }
  }

  if (allowMethods && /PUT|DELETE|PATCH/i.test(allowMethods)) {
    issues.push({
      id: 'cors.methods.unsafe',
      title: 'CORS exposes unsafe methods broadly',
      description: `Allowed methods: ${allowMethods}. Consider narrowing in dev/staging.`,
      severity: 'info'
    });
  }

  return issues;
}
