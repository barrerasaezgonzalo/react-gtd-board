"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bookmark, StickyNote, Trash, X } from "lucide-react";
import { Rect } from "@/types";
import { ConfirmModal } from "../ui/ConfirmModal";
import { EmptyState } from "../ui/EmptyState";
import { useNotes } from "@/context/NotesContext";
import { Loading } from "../ui/Loading";

export function Notes() {
  const { notes, editNote, deleteNote, addNote, togglePinned, loading } =
    useNotes();
  const [selected, setSelected] = useState<string | null>(null);
  const [originRect, setOriginRect] = useState<Rect | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const modalRef = useRef<HTMLDivElement | null>(null);
  const selectedNote = notes.find((n) => n.id === selected);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const sortedNotes = useMemo(() => {
    return notes
      .filter((n) =>
        n.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [notes, searchQuery]);

  function handleEdit(id: string, value: string) {
    editNote(id, value);
  }

  function handleTogglePinned() {
    if (!selected) return;
    togglePinned(selected);
  }

  function handleDelete() {
    if (!selected) return;
    deleteNote(selected);
    closeNote();
    setItemToDelete(null);
  }

  function hasEmptyNote() {
    return notes.filter((n) => n.content.trim() === "");
  }

  async function handleAddNote() {
    if (hasEmptyNote().length > 0) {
      const emptyNote = hasEmptyNote()[0];
      const elEmptyNote = refs.current[emptyNote?.id];
      if (elEmptyNote) {
        const originalBorderColor = elEmptyNote.style.borderColor;
        elEmptyNote.style.borderColor = "#ef4444";
        setTimeout(() => {
          elEmptyNote.style.borderColor = originalBorderColor;
        }, 1000);
      }
      return;
    }
    const newNote = await addNote();
    if (!newNote) return;
    setTimeout(() => openNote(newNote.id), 0);
  }

  function openNote(id: string) {
    const el = refs.current[id];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setOriginRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
    setSelected(id);
  }

  const closeNote = useCallback(() => {
    if (!modalRef.current || !originRect) {
      setSelected(null);
      return;
    }

    const modal = modalRef.current;
    modal.style.top = `${originRect.top}px`;
    modal.style.left = `${originRect.left}px`;
    modal.style.width = `${originRect.width}px`;
    modal.style.height = `${originRect.height}px`;
    modal.style.transform = "translate(0,0)";
    modal.style.borderRadius = "0.5rem";

    setIsOpen(false);

    setTimeout(() => {
      setSelected(null);
      setOriginRect(null);
    }, 300);
  }, [originRect, setSelected, setIsOpen, setOriginRect]);

  useEffect(() => {
    if (!modalRef.current || !originRect) return;
    const modal = modalRef.current;
    requestAnimationFrame(() => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        modal.style.top = "0px";
        modal.style.left = "0px";
        modal.style.width = "100%";
        modal.style.height = "100%";
        modal.style.transform = "translate(0,0)";
        modal.style.borderRadius = "0rem";
      } else {
        modal.style.top = "50%";
        modal.style.left = "50%";
        modal.style.width = "720px";
        modal.style.height = "520px";
        modal.style.transform = "translate(-50%, -50%)";
        modal.style.borderRadius = "1rem";
      }
      setIsOpen(true);
    });
  }, [originRect]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeNote();
    }
    if (selected) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, closeNote]);

  if (loading) return <Loading />;
  return (
    <div className="relative">
      <div
        className={`max-w-4xl mx-auto space-y-6 transition-opacity duration-300 ${
          selected ? "opacity-20 pointer-events-none" : ""
        }`}
      >
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/50">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <StickyNote size={16} className="text-blue-400" />
            Notes
          </h2>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-200 focus:outline-none focus:border-blue-500/50 transition w-35 md:w-64"
            />
            <button
              onClick={handleAddNote}
              className="text-xs px-3 py-1.5 rounded-lg cursor-pointer transition border border-2 border-blue-600 hover:bg-blue-900 text-white whitespace-nowrap"
            >
              New note
            </button>
          </div>
        </div>

        {(sortedNotes.length === 0 || loading) && <EmptyState />}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sortedNotes.map((note) => (
            <div
              key={note.id}
              ref={(el) => {
                if (el) refs.current[note.id] = el;
              }}
              onClick={() => openNote(note.id)}
              className={`min-h-40 rounded-lg border ${note.pinned ? "border-yellow-400" : "border-zinc-700"} bg-zinc-900 cursor-pointer hover:border-zinc-500 transition-all duration-200 p-4 text-sm text-zinc-300 whitespace-pre-wrap line-clamp-6`}
            >
              {note.content}
            </div>
          ))}
        </div>
      </div>

      {selected && originRect && selectedNote && (
        <>
          <div
            onClick={closeNote}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          <div
            ref={modalRef}
            style={{
              position: "fixed",
              top: originRect.top,
              left: originRect.left,
              width: originRect.width,
              height: originRect.height,
              transition:
                "all 300ms cubic-bezier(0.4, 0, 0.2, 1), border-radius 200ms",
              boxSizing: "border-box",
            }}
            className={`z-50 bg-zinc-900 ${selectedNote?.pinned ? "border border-yellow-400" : "border border-zinc-700"}  shadow-2xl overflow-hidden`}
          >
            <div
              className={`h-full flex flex-col transition-opacity duration-200 ${
                isOpen ? "opacity-100 delay-150" : "opacity-0 "
              }`}
            >
              <div className="h-12 flex items-center justify-between px-4 border-b border-zinc-800">
                <button
                  onClick={closeNote}
                  className="p-1 rounded hover:bg-zinc-800 transition"
                >
                  <X size={20} />
                </button>

                <div className={`flex items-center gap-4 `}>
                  <Bookmark
                    size={18}
                    onClick={handleTogglePinned}
                    className={`cursor-pointer transition ${
                      selectedNote?.pinned ? "text-yellow-400" : "text-zinc-500"
                    }`}
                  />
                  <Trash
                    size={18}
                    className="cursor-pointer"
                    onClick={() => setItemToDelete(selectedNote.id)}
                  />
                </div>
              </div>

              <textarea
                value={selectedNote.content}
                onChange={(e) => handleEdit(selectedNote.id, e.target.value)}
                className="flex-1 p-6 bg-transparent text-zinc-300 text-sm resize-none outline-none custom-scrollbar"
              />
            </div>
          </div>
        </>
      )}
      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Action"
        message="Are you sure? This action cannot be undone."
        variant="danger"
      />
    </div>
  );
}
