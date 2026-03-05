import test from "node:test";
import assert from "node:assert/strict";
import type { Action } from "../types.ts";
import {
  buildCaptureInsertPayload,
  hasDueDateValue,
  normalizeFetchedActions,
  shouldBlockMoveToNextActions,
} from "./actionContext.helpers.ts";

function buildAction(overrides: Partial<Action>): Action {
  return {
    id: "a1",
    title: "Test",
    due_date: null,
    status: "backLog",
    text: "",
    urgent: false,
    ...overrides,
  };
}

test("normalizeFetchedActions defaults missing context to home", () => {
  const result = normalizeFetchedActions([
    buildAction({ id: "1", context: undefined }),
    buildAction({ id: "2", context: "work" }),
  ]);

  assert.equal(result[0].context, "home");
  assert.equal(result[1].context, "work");
});

test("hasDueDateValue validates empty/non-empty values", () => {
  assert.equal(hasDueDateValue(""), false);
  assert.equal(hasDueDateValue("   "), false);
  assert.equal(hasDueDateValue("2026-03-05"), true);
  assert.equal(hasDueDateValue(null), false);
  assert.equal(hasDueDateValue(undefined), false);
});

test("shouldBlockMoveToNextActions blocks only when nextActions has no due date", () => {
  assert.equal(
    shouldBlockMoveToNextActions({
      updates: { status: "nextActions", due_date: "" },
      currentAction: buildAction({ status: "backLog", due_date: null }),
    }),
    true,
  );

  assert.equal(
    shouldBlockMoveToNextActions({
      updates: { status: "nextActions" },
      currentAction: buildAction({ status: "backLog", due_date: "2026-03-05" }),
    }),
    false,
  );

  assert.equal(
    shouldBlockMoveToNextActions({
      updates: { status: "waiting", due_date: "" },
      currentAction: buildAction({ status: "backLog", due_date: null }),
    }),
    false,
  );
});

test("shouldBlockMoveToNextActions handles inherited status from current action", () => {
  assert.equal(
    shouldBlockMoveToNextActions({
      updates: {},
      currentAction: buildAction({ status: "nextActions", due_date: null }),
    }),
    true,
  );

  assert.equal(
    shouldBlockMoveToNextActions({
      updates: { due_date: "2026-03-07" },
      currentAction: buildAction({ status: "nextActions", due_date: null }),
    }),
    false,
  );
});

test("buildCaptureInsertPayload trims title and sets defaults", () => {
  const payload = buildCaptureInsertPayload("  My capture  ", "user-1");
  assert.deepEqual(payload, {
    title: "My capture",
    status: "backLog",
    context: "home",
    urgent: false,
    user_id: "user-1",
  });
});
