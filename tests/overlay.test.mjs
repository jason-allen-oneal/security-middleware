import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { test } from "node:test";

test("overlay waits for document.body before mounting", async () => {
  const source = await readFile(
    new URL("../overlay/security-overlay.js", import.meta.url),
    "utf8"
  );
  let onReady;
  let mounted = 0;
  const document = {
    body: null,
    currentScript: { getAttribute: () => "/__security" },
    addEventListener(event, callback, options) {
      assert.equal(event, "DOMContentLoaded");
      assert.equal(options.once, true);
      onReady = callback;
    },
    createElement() {
      return {
        style: {},
        appendChild() {},
        textContent: "",
        innerText: "",
      };
    },
  };

  runInNewContext(source, {
    document,
    fetch: async () => ({ ok: true, json: async () => ({ issues: [] }) }),
    setInterval() {},
    String,
  });

  assert.equal(mounted, 0);
  assert.equal(typeof onReady, "function");
  document.body = {
    appendChild: () => {
      mounted += 1;
    },
  };
  onReady();
  assert.equal(mounted, 1);
});
