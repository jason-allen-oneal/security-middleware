import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  analyzeHeaders,
  analyzeCors,
  addIssues,
} from "@bluedot/security-middleware/browser";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Convert Fetch API Headers -> plain object
  const headers: Record<string, string> = {};
  res.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const issues = [
    ...analyzeHeaders(headers),
    ...analyzeCors(headers, { cors: { trustedOrigins: [] } }),
  ];

  if (issues.length) {
    addIssues(issues);
  }

  return res;
}
