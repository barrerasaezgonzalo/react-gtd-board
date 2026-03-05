"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";
import { Note, NotesContextType } from "@/types";
import { useAuth } from "./AuthContext";
import {
  applyDeleteNote,
  applyEditNoteContent,
  applyTogglePinned,
} from "./notesContext.helpers";

export const NotesContext = createContext<NotesContextType | undefined>(
  undefined,
);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    if (!userId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("gtd_notes")
        .select("*")
        .eq("user_id", userId)
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: true });

      if (error) throw error;

      setNotes(data ?? []);
    } catch (err) {
      console.error("Fetch notes error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  async function addNote() {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("gtd_notes")
        .insert({
          content: "",
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) return;

      setNotes((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      console.error("Add note error:", err);
    }
  }

  async function editNote(id: string, content: string) {
    const previous = notes;

    setNotes((prev) => applyEditNoteContent(prev, id, content));

    const { error } = await supabase
      .from("gtd_notes")
      .update({ content })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Edit note error:", error);
      setNotes(previous);
    }
  }

  async function togglePinned(id: string) {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    const nextPinned = !note.pinned;
    setNotes((prev) => applyTogglePinned(prev, id).notes);

    const { error } = await supabase
      .from("gtd_notes")
      .update({ pinned: nextPinned })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Toggle pinned error:", error);

      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, pinned: note.pinned } : n)),
      );
    }
  }

  async function deleteNote(id: string) {
    const previous = notes;

    setNotes((prev) => applyDeleteNote(prev, id));

    const { error } = await supabase
      .from("gtd_notes")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Delete note error:", error);
      setNotes(previous);
    }
  }

  return (
    <NotesContext.Provider
      value={{
        notes,
        loading,
        addNote,
        editNote,
        deleteNote,
        togglePinned,
        refreshNotes: fetchNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes must be used within NotesProvider");
  }
  return context;
}
