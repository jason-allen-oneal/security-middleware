import type { Issue } from "../types.js";

const DOCS = {
  hsts: "https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html",
  csp: "https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html",
  xfo: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options",
  xcto: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options",
  refpol: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy"
};

export function analyzeHeaders(headers: Record<string, string | number | string[] | undefined>): Issue[] {
  const h = Object.fromEntries(
    Object.entries(headers).map(([k,v]) => [k.toLowerCase(), Array.isArray(v) ? v.join(', ') : (v ?? '').toString()])
  );

  const issues: Issue[] = [];

  if (!h['strict-transport-security']) {
    issues.push({
      id: 'hdr.hsts.missing',
      title: 'HSTS header missing',
      description: 'Add Strict-Transport-Security in production to enforce HTTPS and prevent downgrade attacks.',
      severity: 'warn',
      docsUrl: DOCS.hsts
    });
  }

  if (!h['content-security-policy']) {
    issues.push({
      id: 'hdr.csp.missing',
      title: 'CSP header missing',
      description: 'Content-Security-Policy helps mitigate XSS and data injection. Define a minimal policy even in staging.',
      severity: 'warn',
      docsUrl: DOCS.csp
    });
  }

  if (!h['x-frame-options']) {
    issues.push({
      id: 'hdr.xfo.missing',
      title: 'X-Frame-Options missing',
      description: 'Prevents clickjacking. Use SAMEORIGIN or DENY where appropriate.',
      severity: 'warn',
      docsUrl: DOCS.xfo
    });
  }

  if (!h['x-content-type-options']) {
    issues.push({
      id: 'hdr.xcto.missing',
      title: 'X-Content-Type-Options missing',
      description: 'Prevents MIME type sniffing. Use X-Content-Type-Options: nosniff.',
      severity: 'warn',
      docsUrl: DOCS.xcto
    });
  }

  if (!h['referrer-policy']) {
    issues.push({
      id: 'hdr.referrer-policy.missing',
      title: 'Referrer-Policy missing',
      description: 'Controls how much referrer information should be included with requests.',
      severity: 'info',
      docsUrl: DOCS.refpol
    });
  }

  return issues;
}
