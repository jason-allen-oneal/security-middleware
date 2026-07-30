import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { analyzeHeaders } from "../dist/checks/headers.js";

describe("security-middleware smoke", () => {
  test("analyzeHeaders returns an issues array", () => {
    const issues = analyzeHeaders({
      "content-security-policy": "default-src 'self'",
      "x-frame-options": "DENY",
    });
    assert.ok(Array.isArray(issues));
  });
});
