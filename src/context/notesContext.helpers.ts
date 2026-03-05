import type { Note } from "@/types";

export function applyEditNoteContent(notes: Note[], id: string, content: string) {
  return notes.map((note) => (note.id === id ? { ...note, content } : note));
}

export function applyTogglePinned(notes: Note[], id: string) {
  const note = notes.find((item) => item.id === id);
  if (!note) return { notes, toggled: null as boolean | null };

  const toggled = !note.pinned;
  return {
    notes: notes.map((item) =>
      item.id === id ? { ...item, pinned: toggled } : item,
    ),
    toggled,
  };
}

export function applyDeleteNote(notes: Note[], id: string) {
  return notes.filter((note) => note.id !== id);
}
