export type Severity = 'info' | 'warn' | 'error';

export interface Issue {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  docsUrl?: string;
  meta?: Record<string, unknown>;
}

export interface SecurityOptions {
  enabled?: boolean;
  environment?: 'dev' | 'staging' | 'prod';
  checks?: {
    headers?: boolean;
    cors?: boolean;
  };
  audit?: {
    npm?: boolean;      // run npm audit once on boot in dev/staging
    cacheMs?: number;   // cache audit result for this long
  };
  cors?: {
    trustedOrigins?: string[];
    allowlistWildcardInDev?: boolean;
  };
  logger?: (issue: Issue) => void;
}
