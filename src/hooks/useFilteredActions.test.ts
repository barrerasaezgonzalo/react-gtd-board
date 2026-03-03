import test from "node:test";
import assert from "node:assert/strict";
import type { Action } from "../types";
import {
  filterByStatus,
  filterNextActionsByContext,
  getActionsByStatus,
} from "./useFilteredActions";

const sampleActions: Action[] = [
  {
    id: "1",
    title: "home next",
    due_date: "2099-01-02T10:00:00",
    status: "nextActions",
    context: "home",
    text: "",
    urgent: false,
  },
  {
    id: "2",
    title: "work next urgent",
    due_date: "2099-01-03T10:00:00",
    status: "nextActions",
    context: "work",
    text: "",
    urgent: true,
  },
  {
    id: "3",
    title: "waiting",
    due_date: "2099-01-01T10:00:00",
    status: "waiting",
    context: "work",
    text: "",
    urgent: false,
  },
];

test("filterByStatus returns only matching status", () => {
  const waiting = filterByStatus(sampleActions, "waiting");
  assert.equal(waiting.length, 1);
  assert.equal(waiting[0].id, "3");
});

test("filterNextActionsByContext handles all and home correctly", () => {
  const all = filterNextActionsByContext(sampleActions, "all");
  const homeOnly = filterNextActionsByContext(sampleActions, "home");

  assert.deepEqual(all.map((a) => a.id).sort(), ["1", "2"]);
  assert.deepEqual(
    homeOnly.map((a) => a.id),
    ["1"],
  );
});

test("getActionsByStatus with sort keeps urgent first", () => {
  const sorted = getActionsByStatus(sampleActions, "nextActions", true);
  assert.equal(sorted[0].id, "2");
});
