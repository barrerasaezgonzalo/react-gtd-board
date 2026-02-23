"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";
import { Note } from "@/types";
import { useAuth } from "./AuthContext";

type NotesContextType = {
  notes: Note[];
  loading: boolean;
  addNote: () => Promise<Note | undefined>;
  editNote: (id: string, content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePinned: (id: string) => Promise<void>;
  refreshNotes: () => Promise<void>;
};

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

    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, content } : n)));

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

    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: nextPinned } : n)),
    );

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

    setNotes((prev) => prev.filter((n) => n.id !== id));

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
