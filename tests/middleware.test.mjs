import assert from "node:assert/strict";
import { describe, test } from "node:test";
import express from "express";
import request from "supertest";
import { securityMiddleware, withSecurity } from "../dist/index.js";

const createApp = (options) => {
  const app = express();
  app.use(securityMiddleware(options));
  app.get("/probe", (_req, res) => res.json({ ok: true }));
  return app;
};

describe("security middleware configuration", () => {
  test("enabled:false suppresses collection and the issue endpoint", async () => {
    const logged = [];
    const app = createApp({
      enabled: false,
      environment: "dev",
      issueEndpoint: { enabled: true },
      logger: ({ id }) => logged.push(id),
    });

    await request(app).get("/probe").expect(200);
    await request(app).get("/__security").expect(404);
    assert.deepEqual(logged, []);
  });

  test("explicit prod environment overrides development NODE_ENV for exposure", async () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    try {
      const app = createApp({
        environment: "prod",
        issueEndpoint: { enabled: true },
        logger: () => undefined,
      });
      await request(app).get("/__security").expect(404);
    } finally {
      if (previous === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = previous;
    }
  });

  test("does not expose the issue endpoint in staging", async () => {
    const app = createApp({
      environment: "staging",
      issueEndpoint: { enabled: true },
      logger: () => undefined,
    });
    await request(app).get("/__security").expect(404);
  });

  test("supports an explicit custom endpoint path in dev", async () => {
    const app = createApp({
      environment: "dev",
      issueEndpoint: { enabled: true, path: "/security-findings" },
      logger: () => undefined,
    });
    await request(app).get("/__security").expect(404);
    await request(app).get("/security-findings").expect(200);
  });

  test("exposes bounded findings only for an explicitly enabled dev endpoint", async () => {
    const app = createApp({
      environment: "dev",
      issueEndpoint: { enabled: true },
      logger: () => undefined,
    });
    for (let index = 0; index < 250; index += 1) {
      await request(app).get("/probe").expect(200);
    }
    const response = await request(app).get("/__security").expect(200);
    assert.deepEqual(
      response.body.issues.map(({ id }) => id),
      [
        "hdr.hsts.missing",
        "hdr.csp.missing",
        "hdr.xfo.missing",
        "hdr.xcto.missing",
        "hdr.referrer-policy.missing",
      ]
    );
  });

  test("isolates findings between middleware instances", async () => {
    const first = createApp({
      environment: "dev",
      issueEndpoint: { enabled: true },
      logger: () => undefined,
    });
    const second = createApp({
      environment: "dev",
      issueEndpoint: { enabled: true },
      logger: () => undefined,
    });
    await request(first).get("/probe").expect(200);
    assert.equal((await request(first).get("/__security")).body.issues.length, 5);
    assert.deepEqual((await request(second).get("/__security")).body.issues, []);
  });

  test("enabled:false bypasses the API wrapper without collecting", async () => {
    const logged = [];
    let calls = 0;
    const wrapped = withSecurity(
      async () => {
        calls += 1;
      },
      {
        enabled: false,
        environment: "dev",
        audit: { npm: true },
        logger: ({ id }) => logged.push(id),
      }
    );
    await wrapped({}, {});
    assert.equal(calls, 1);
    assert.deepEqual(logged, []);
  });
});
