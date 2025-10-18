/**
 * Severity levels for security issues.
 */
export type Severity = 'info' | 'warn' | 'error';

/**
 * Represents a detected security issue.
 */
export interface Issue {
  /** Unique identifier for the issue type */
  id: string;
  /** Human-readable title of the issue */
  title: string;
  /** Detailed description of the issue */
  description: string;
  /** Severity level of the issue */
  severity: Severity;
  /** Optional URL to documentation about the issue */
  docsUrl?: string;
  /** Optional metadata about the issue */
  meta?: Record<string, unknown>;
}

/**
 * Configuration options for the security middleware.
 */
export interface SecurityOptions {
  /** Whether the middleware is enabled. Default: true */
  enabled?: boolean;
  /** Environment the application is running in. Default: inferred from NODE_ENV */
  environment?: 'dev' | 'staging' | 'prod';
  /** Configuration for which security checks to run */
  checks?: {
    /** Check HTTP security headers. Default: true */
    headers?: boolean;
    /** Check CORS configuration. Default: true */
    cors?: boolean;
  };
  /** Configuration for dependency auditing */
  audit?: {
    /** Run npm audit once on boot in dev/staging environments */
    npm?: boolean;
    /** Cache audit results for this many milliseconds. Default: 300000 (5 minutes) */
    cacheMs?: number;
  };
  /** CORS configuration options */
  cors?: {
    /** List of trusted origins to allow */
    trustedOrigins?: string[];
    /** Allow wildcard (*) origins in development environment */
    allowlistWildcardInDev?: boolean;
  };
  /** Custom logger function for handling detected issues */
  logger?: (issue: Issue) => void;
}
