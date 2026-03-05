import test from "node:test";
import assert from "node:assert/strict";
import type { Note } from "../types.ts";
import {
  applyDeleteNote,
  applyEditNoteContent,
  applyTogglePinned,
} from "./notesContext.helpers.ts";

const notes: Note[] = [
  { id: "1", content: "A", pinned: false },
  { id: "2", content: "B", pinned: true },
];

test("applyEditNoteContent updates only the target note", () => {
  const result = applyEditNoteContent(notes, "1", "Updated");
  assert.deepEqual(result, [
    { id: "1", content: "Updated", pinned: false },
    { id: "2", content: "B", pinned: true },
  ]);
});

test("applyTogglePinned toggles target note and returns next state", () => {
  const result = applyTogglePinned(notes, "2");
  assert.equal(result.toggled, false);
  assert.deepEqual(result.notes, [
    { id: "1", content: "A", pinned: false },
    { id: "2", content: "B", pinned: false },
  ]);
});

test("applyTogglePinned returns unchanged list when id is missing", () => {
  const result = applyTogglePinned(notes, "missing");
  assert.equal(result.toggled, null);
  assert.equal(result.notes, notes);
});

test("applyDeleteNote removes the target note", () => {
  const result = applyDeleteNote(notes, "1");
  assert.deepEqual(result, [{ id: "2", content: "B", pinned: true }]);
});
