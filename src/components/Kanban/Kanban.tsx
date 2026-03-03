"use client";

import { DragEvent, useMemo, useState } from "react";
import { KanbanSquare } from "lucide-react";
import { useActions } from "@/context/ActionContext";
import { ActionStatus } from "@/types";
import {
  actionMatchesQuery,
  formatDate,
  getDaysRemaining,
  sortActions,
} from "@/lib/utils";
import { Capture } from "../ui/Capture";
import { Loading } from "../ui/Loading";

const columns: {
  status: ActionStatus;
  title: string;
  toneClass: string;
}[] = [
  {
    status: "backLog",
    title: "Backlog",
    toneClass: "border-violet-700/60 bg-violet-950/20",
  },
  {
    status: "nextActions",
    title: "Next",
    toneClass: "border-sky-700/60 bg-sky-950/20",
  },
  {
    status: "waiting",
    title: "Waiting",
    toneClass: "border-amber-700/60 bg-amber-950/20",
  },
  {
    status: "done",
    title: "Done",
    toneClass: "border-emerald-700/60 bg-emerald-950/20",
  },
  {
    status: "someday",
    title: "Someday",
    toneClass: "border-fuchsia-700/60 bg-fuchsia-950/20",
  },
];

export function Kanban({ searchQuery = "" }: { searchQuery?: string }) {
  const { actions, loading, updateAction, saving } = useActions();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<ActionStatus | null>(
    null,
  );
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);

  const draggedAction = useMemo(
    () => actions.find((action) => action.id === draggingId) ?? null,
    [actions, draggingId],
  );

  const actionsByStatus = useMemo(() => {
    return columns.reduce<Record<ActionStatus, typeof actions>>(
      (acc, column) => {
        const filtered = actions.filter(
          (action) =>
            action.status === column.status &&
            actionMatchesQuery(action, searchQuery),
        );
        acc[column.status] = sortActions(filtered);
        return acc;
      },
      {
        backLog: [],
        nextActions: [],
        waiting: [],
        done: [],
        someday: [],
      },
    );
  }, [actions, searchQuery]);

  const clearDragState = () => {
    setDraggingId(null);
    setDragOverStatus(null);
  };

  const handleDragStart = (e: DragEvent<HTMLElement>, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOverColumn = (
    e: DragEvent<HTMLElement>,
    status: ActionStatus,
  ) => {
    e.preventDefault();
    if (!draggingId) return;
    setDragOverStatus(status);
  };

  const handleDropOnColumn = async (targetStatus: ActionStatus) => {
    if (!draggingId || saving) return clearDragState();
    const movingAction = actions.find((action) => action.id === draggingId);
    if (!movingAction) return clearDragState();

    if (movingAction.status === targetStatus) return clearDragState();

    if (targetStatus === "nextActions" && !movingAction.due_date) {
      setBlockedMessage(
        "No se puede mover a Next Actions sin due_date. Edita la tarea y agrega una fecha primero.",
      );
      setTimeout(() => setBlockedMessage(null), 3000);
      return clearDragState();
    }

    await updateAction({
      id: movingAction.id,
      updates: { status: targetStatus },
    });
    clearDragState();
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <Capture />

      <div className="flex items-center gap-2 border-b border-zinc-800/50 pb-2">
        <KanbanSquare className="text-cyan-400" size={24} />
        <h2 className="text-2xl font-bold uppercase tracking-widest text-white">
          Kanban
        </h2>
      </div>

      {blockedMessage && (
        <div className="rounded-lg border border-rose-700/70 bg-rose-950/30 px-4 py-2 text-sm text-rose-300">
          {blockedMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        {columns.map((column) => {
          const list = actionsByStatus[column.status];
          const isDragOver = dragOverStatus === column.status;
          const isInvalidDrop =
            isDragOver &&
            draggedAction?.status !== column.status &&
            column.status === "nextActions" &&
            !draggedAction?.due_date;

          return (
            <section
              key={column.status}
              onDragOver={(e) => handleDragOverColumn(e, column.status)}
              onDragEnter={(e) => handleDragOverColumn(e, column.status)}
              onDragLeave={() => setDragOverStatus(null)}
              onDrop={() => handleDropOnColumn(column.status)}
              className={`rounded-xl border p-2.5 min-h-[240px] transition ${column.toneClass} ${
                isDragOver
                  ? isInvalidDrop
                    ? "ring-2 ring-rose-500 border-rose-600"
                    : "ring-2 ring-cyan-500 border-cyan-500"
                  : ""
              }`}
            >
              <header className="flex items-center justify-between mb-2">
                <h3 className="text-xs uppercase tracking-wide font-semibold text-zinc-200">
                  {column.title}
                </h3>
                <span className="text-[11px] text-zinc-400 bg-zinc-900/70 px-2 py-0.5 rounded-md">
                  {list.length}
                </span>
              </header>

              <div className="space-y-2">
                {list.length === 0 && (
                  <p className="text-xs text-zinc-500 py-3">No tasks</p>
                )}

                {list.map((action) => {
                  const remainingDays = action.due_date
                    ? getDaysRemaining(action.due_date)
                    : null;

                  return (
                    <article
                      key={action.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, action.id)}
                      onDragEnd={clearDragState}
                      className={`rounded-lg border border-zinc-700/70 bg-zinc-900/80 p-2.5 cursor-grab active:cursor-grabbing ${
                        draggingId === action.id ? "opacity-60" : ""
                      }`}
                    >
                      <p className="text-sm text-zinc-100 font-medium break-words">
                        {action.title}
                      </p>
                      {action.due_date && remainingDays !== null && (
                        <div className="mt-2 text-[11px]">
                          <p className="text-zinc-400">
                            Due: {formatDate(action.due_date)}
                          </p>
                          <p
                            className={
                              remainingDays < 0
                                ? "text-rose-400"
                                : remainingDays < 1
                                  ? "text-amber-400"
                                  : "text-emerald-400"
                            }
                          >
                            {remainingDays < 0
                              ? `Vencida (${Math.abs(
                                  Math.ceil(remainingDays),
                                )} dia(s))`
                              : `Quedan ${Math.ceil(remainingDays)} dia(s)`}
                          </p>
                        </div>
                      )}
                      {action.text?.trim() && (
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-3 whitespace-pre-wrap">
                          {action.text}
                        </p>
                      )}
                      {!action.due_date && (
                        <p className="text-[11px] text-amber-400 mt-2">
                          Sin due_date
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
