import test from "node:test";
import assert from "node:assert/strict";
import type { Action } from "../types.ts";
import { actionMatchesQuery, sortActions } from "./utils.ts";

function buildAction(overrides: Partial<Action>): Action {
  return {
    id: "1",
    title: "Task",
    due_date: "2099-01-01T10:00:00",
    status: "nextActions",
    text: "",
    urgent: false,
    ...overrides,
  };
}

test("sortActions uses due-date tie-break when priorities are equal", () => {
  const later = buildAction({ id: "later", due_date: "2099-01-03T10:00:00" });
  const earlier = buildAction({ id: "earlier", due_date: "2099-01-02T10:00:00" });

  const sorted = sortActions([later, earlier]);
  assert.deepEqual(
    sorted.map((item) => item.id),
    ["earlier", "later"],
  );
});

test("sortActions prioritizes urgent first, then overdue, then upcoming", () => {
  const urgent = buildAction({ id: "urgent", urgent: true, due_date: null });
  const overdue = buildAction({ id: "overdue", due_date: "2000-01-01T09:00:00" });
  const upcoming = buildAction({ id: "upcoming", due_date: "2099-01-01T09:00:00" });

  const sorted = sortActions([upcoming, overdue, urgent]);
  assert.deepEqual(
    sorted.map((item) => item.id),
    ["urgent", "overdue", "upcoming"],
  );
});

test("actionMatchesQuery returns true for empty query and matches text/file_urls", () => {
  const action = buildAction({
    title: "Inbox",
    text: "Review quarterly notes",
    file_urls: "report-q1.pdf",
  });

  assert.equal(actionMatchesQuery(action, "   "), true);
  assert.equal(actionMatchesQuery(action, "quarterly"), true);
  assert.equal(actionMatchesQuery(action, "q1.pdf"), true);
  assert.equal(actionMatchesQuery(action, "missing"), false);
});

test("actionMatchesQuery matches title when text and files do not match", () => {
  const action = buildAction({
    title: "Plan roadmap",
    text: "",
    file_urls: "",
  });

  assert.equal(actionMatchesQuery(action, "roadmap"), true);
});

test("actionMatchesQuery handles undefined text/file_urls without throwing", () => {
  const action = {
    ...buildAction({ title: "Inbox" }),
    text: undefined,
    file_urls: undefined,
  } as unknown as Action;

  assert.equal(actionMatchesQuery(action, "inbox"), true);
  assert.equal(actionMatchesQuery(action, "not-found"), false);
});
