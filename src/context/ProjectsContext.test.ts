import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeProjectName,
  normalizeProjectUpdates,
} from "./projectsContext.helpers.ts";

test("normalizeProjectName trims surrounding whitespace", () => {
  assert.equal(normalizeProjectName("  Project X  "), "Project X");
});

test("normalizeProjectUpdates returns null for empty payloads", () => {
  assert.equal(normalizeProjectUpdates({}), null);
  assert.equal(normalizeProjectUpdates({ color: "   " }), null);
});

test("normalizeProjectUpdates blocks blank name", () => {
  assert.equal(
    normalizeProjectUpdates({
      name: "   ",
      color: "#ffffff",
    }),
    null,
  );
});

test("normalizeProjectUpdates trims name and keeps valid color", () => {
  assert.deepEqual(
    normalizeProjectUpdates({
      name: "  New title  ",
      color: "#38bdf8",
    }),
    {
      name: "New title",
      color: "#38bdf8",
    },
  );
});

test("normalizeProjectUpdates accepts color-only updates", () => {
  assert.deepEqual(
    normalizeProjectUpdates({
      color: "#f97316",
    }),
    {
      color: "#f97316",
    },
  );
});
