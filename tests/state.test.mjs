import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { addIssues, clearIssues, createIssueStore, getIssues } from "../dist/state.js";

const issue = (id) => ({ id, title: id, description: id, severity: "warn" });

describe("bounded issue state", () => {
  test("deduplicates on write and evicts the oldest unique issue", () => {
    const store = createIssueStore({ maxIssues: 2 });
    store.addIssues([issue("a"), issue("b"), issue("a"), issue("c")]);
    assert.deepEqual(store.getIssues().map(({ id }) => id), ["b", "c"]);
  });

  test("expires issues by age", () => {
    let now = 0;
    const store = createIssueStore({ maxAgeMs: 100, now: () => now });
    store.addIssues([issue("old")]);
    now = 99;
    assert.equal(store.getIssues().length, 1);
    now = 100;
    assert.deepEqual(store.getIssues(), []);
  });

  test("retains a bounded number of unique issues under sustained writes", () => {
    const store = createIssueStore({ maxIssues: 25 });
    for (let index = 0; index < 50_000; index += 1) {
      store.addIssues([issue(`issue-${index % 100}`)]);
    }
    assert.equal(store.getIssues().length, 25);
  });

  test("keeps the legacy singleton API bounded and first-occurrence compatible", () => {
    clearIssues();
    addIssues([issue("same")]);
    addIssues([{ ...issue("same"), title: "replacement" }]);
    assert.equal(getIssues()[0].title, "same");

    clearIssues();
    for (let index = 0; index < 150; index += 1) {
      addIssues([issue(`legacy-${index}`)]);
    }
    assert.equal(getIssues().length, 100);
    clearIssues();
    assert.deepEqual(getIssues(), []);
  });
});
