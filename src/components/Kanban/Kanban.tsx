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
  titleClass: string;
  badgeClass: string;
}[] = [
  {
    status: "backLog",
    title: "Backlog",
    toneClass: "border-amber-200 bg-amber-50/60",
    titleClass: "text-amber-700",
    badgeClass: "bg-amber-100 text-amber-700 border border-amber-200",
  },
  {
    status: "nextActions",
    title: "Next",
    toneClass: "border-sky-200 bg-sky-50/60",
    titleClass: "text-sky-700",
    badgeClass: "bg-sky-100 text-sky-700 border border-sky-200",
  },
  {
    status: "waiting",
    title: "Waiting",
    toneClass: "border-rose-200 bg-rose-50/60",
    titleClass: "text-rose-700",
    badgeClass: "bg-rose-100 text-rose-700 border border-rose-200",
  },
  {
    status: "done",
    title: "Done",
    toneClass: "border-emerald-200 bg-emerald-50/60",
    titleClass: "text-emerald-700",
    badgeClass: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  },
  {
    status: "someday",
    title: "Someday",
    toneClass: "border-cyan-200 bg-cyan-50/60",
    titleClass: "text-cyan-700",
    badgeClass: "bg-cyan-100 text-cyan-700 border border-cyan-200",
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
        "No se puede mover a Next Actions sin fecha de vencimiento. Edita la tarea y agrega una fecha primero.",
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

      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <KanbanSquare className="text-sky-500" size={24} />
        <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-900">
          Kanban
        </h2>
      </div>

      {blockedMessage && (
        <div className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm text-rose-700">
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
              className={`rounded-xl border p-2.5 min-h-[240px] transition shadow-sm ${column.toneClass} ${
                isDragOver
                  ? isInvalidDrop
                    ? "ring-2 ring-rose-400 border-rose-400"
                    : "ring-2 ring-sky-400 border-sky-400"
                  : ""
              }`}
            >
              <header className="flex items-center justify-between mb-2">
                <h3
                  className={`text-xs uppercase tracking-wide font-semibold ${column.titleClass}`}
                >
                  {column.title}
                </h3>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${column.badgeClass}`}
                >
                  {list.length}
                </span>
              </header>

              <div className="space-y-2">
                {list.length === 0 && (
                  <p className="text-xs text-slate-400 py-3">No tasks</p>
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
                      className={`rounded-lg border border-slate-200 bg-white p-2.5 cursor-grab active:cursor-grabbing shadow-sm ${
                        draggingId === action.id ? "opacity-60" : ""
                      }`}
                    >
                      <p className="text-sm text-slate-900 font-medium break-words">
                        {action.title}
                      </p>
                      {action.due_date && remainingDays !== null && (
                        <div className="mt-2 text-[11px]">
                          <p className="text-slate-500">
                            Due: {formatDate(action.due_date)}
                          </p>
                          <p
                            className={
                              remainingDays < 0
                                ? "text-rose-400"
                                : remainingDays === 0
                                  ? "text-amber-500"
                                  : "text-emerald-400"
                            }
                          >
                            {remainingDays < 0
                              ? `Vencida (${Math.abs(
                                  Math.ceil(remainingDays),
                                )} dia(s))`
                              : remainingDays === 0
                                ? "Vence hoy"
                                : `Quedan ${Math.ceil(remainingDays)} dia(s)`}
                          </p>
                        </div>
                      )}
                      {action.text?.trim() && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-3 whitespace-pre-wrap">
                          {action.text}
                        </p>
                      )}
                      {!action.due_date && (
                        <p className="text-[11px] text-amber-400 mt-2">
                          Sin Fecha de vencimiento
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
