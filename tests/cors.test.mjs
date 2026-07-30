import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { analyzeCors } from "../dist/checks/cors.js";

describe("browser-safe CORS analysis", () => {
  test("does not require a process global", () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, "process");
    let issues;

    try {
      Object.defineProperty(globalThis, "process", {
        value: undefined,
        configurable: true,
      });
      issues = analyzeCors(
        { "access-control-allow-origin": "*" },
        { cors: { allowlistWildcardInDev: true } }
      );
    } finally {
      if (descriptor) Object.defineProperty(globalThis, "process", descriptor);
    }

    assert.equal(issues.length, 1);
    assert.equal(issues[0].id, "cors.origin.wildcard");
    assert.equal(issues[0].severity, "warn");
  });
});
