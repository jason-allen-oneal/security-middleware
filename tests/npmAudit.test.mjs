import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { parseNpmAuditJson, runNpmAudit } from "../dist/checks/npmAudit.js";

const vulnerableAudit = JSON.stringify({
  auditReportVersion: 2,
  vulnerabilities: { example: { severity: "critical" } },
  metadata: {
    vulnerabilities: {
      info: 0,
      low: 1,
      moderate: 2,
      high: 3,
      critical: 1,
      total: 7,
    },
  },
});

describe("npm audit parsing", () => {
  test("rejects valid JSON that is not an npm audit report", () => {
    assert.throws(() => parseNpmAuditJson("{}"), /Invalid npm audit report/);
    assert.throws(
      () => parseNpmAuditJson('{"metadata":{"vulnerabilities":{}}}'),
      /Invalid npm audit report/
    );
  });

  test("maps a clean modern audit to info", () => {
    const clean = JSON.stringify({
      metadata: {
        vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 },
      },
    });
    const [issue] = parseNpmAuditJson(clean);
    assert.equal(issue.id, "npm.audit.clean");
    assert.equal(issue.severity, "info");
  });

  test("maps low/moderate-only findings to a warning", () => {
    const moderate = JSON.stringify({
      metadata: {
        vulnerabilities: { info: 0, low: 1, moderate: 2, high: 0, critical: 0, total: 3 },
      },
    });
    assert.equal(parseNpmAuditJson(moderate)[0].severity, "warn");
  });

  test("maps modern high/critical audit findings to an error", () => {
    const [issue] = parseNpmAuditJson(vulnerableAudit);
    assert.equal(issue.id, "npm.audit.findings");
    assert.equal(issue.severity, "error");
    assert.equal(issue.title, "npm audit found 7 vulnerability(ies)");
    assert.deepEqual(issue.meta.summary, {
      info: 0,
      low: 1,
      moderate: 2,
      high: 3,
      critical: 1,
      total: 7,
    });
  });

  test("parses vulnerable JSON from npm's expected nonzero exit", async () => {
    const error = Object.assign(new Error("npm audit exited 1"), {
      code: 1,
      stdout: vulnerableAudit,
    });
    const [issue] = await runNpmAudit(
      { audit: { cacheMs: 0 } },
      async () => Promise.reject(error)
    );
    assert.equal(issue.id, "npm.audit.findings");
    assert.equal(issue.severity, "error");
  });

  test("does not expose raw process errors when audit JSON is malformed", async () => {
    const error = Object.assign(new Error("sensitive raw command output"), {
      code: 2,
      stdout: "not-json",
    });
    const result = await runNpmAudit(
      { audit: { cacheMs: 0 } },
      async () => Promise.reject(error)
    );
    assert.equal(result[0].id, "npm.audit.error");
    assert.equal(result[0].severity, "warn");
    assert.equal(result[0].description, "npm audit failed before producing valid JSON.");
    assert.ok(!JSON.stringify(result).includes("sensitive raw command output"));
  });

  test("treats structured registry errors as audit failures, not clean results", async () => {
    const error = Object.assign(new Error("audit unavailable"), {
      code: 1,
      stdout: JSON.stringify({ error: { code: "ENOAUDIT", summary: "not supported" } }),
    });
    const result = await runNpmAudit(
      { audit: { cacheMs: 0 } },
      async () => Promise.reject(error)
    );
    assert.equal(result[0].id, "npm.audit.error");
    assert.equal(result[0].severity, "warn");
  });

  test("coalesces concurrent audit executions", async () => {
    let calls = 0;
    let release;
    const pending = new Promise((resolve) => {
      release = resolve;
    });
    const executor = async () => {
      calls += 1;
      return pending;
    };
    const first = runNpmAudit({ audit: { cacheMs: 0 } }, executor);
    const second = runNpmAudit({ audit: { cacheMs: 0 } }, executor);
    release({
      stdout: JSON.stringify({
        metadata: {
          vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 },
        },
      }),
    });
    const results = await Promise.all([first, second]);
    assert.equal(results.length, 2);
    assert.equal(calls, 1);
  });
});
