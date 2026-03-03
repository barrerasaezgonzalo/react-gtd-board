import { HeaderProps, ActionStatus } from "@/types";
import { useActions } from "@/context/ActionContext";
import {
  ActivitySquare,
  X,
  CalendarDays,
  ClipboardCheck,
  KanbanSquare,
  LogOut,
  Menu,
  Search,
} from "lucide-react";
import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { getDaysRemaining } from "@/lib/utils";

export function Header({
  openSidebar,
  onOpenWeeklyReview,
  onOpenCalendar,
  onOpenKanban,
  onNavigateToView,
  onOpenSystemHealth,
  onSearchSubmit,
}: HeaderProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { actions } = useActions();
  const getCount = (status: ActionStatus) => {
    return actions.filter((action) => action.status === status).length;
  };

  const completion = useMemo(() => {
    const operational = actions.filter((action) => action.status !== "someday");
    const totalOperational = operational.length;
    const doneCount = operational.filter((a) => a.status === "done").length;
    const percent =
      totalOperational === 0
        ? 0
        : Math.round((doneCount / totalOperational) * 100);

    return { percent, doneCount, totalOperational };
  }, [actions]);
  const overdueCount = useMemo(
    () =>
      actions.filter(
        (action) =>
          action.status !== "done" &&
          !!action.due_date &&
          getDaysRemaining(action.due_date) < 0,
      ).length,
    [actions],
  );
  const searchMatches = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return actions
      .filter((action) => action.title.toLowerCase().includes(query))
      .slice(0, 5);
  }, [actions, search]);

  const { logout } = useAuth();

  return (
    <>
      <header className="h-16 bg-zinc-950/40 backdrop-blur-md border-b border-zinc-800/60 flex items-center justify-between px-8 sticky top-0 z-10">
        <div className="flex items-center gap-8">
          {openSidebar && (
            <button
              onClick={openSidebar}
              className="md:hidden text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <Menu size={22} />
            </button>
          )}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase font-bold leading-none">
                Backlog
              </span>
              <span className="text-sm font-semibold text-zinc-300">
                {getCount("backLog")} Tasks
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase font-bold leading-none">
                Waiting
              </span>
              <span className="text-sm font-semibold text-zinc-300">
                {getCount("waiting")} Tasks
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-rose-500 uppercase font-bold leading-none">
                Overdue
              </span>
              <span className="text-sm font-semibold text-rose-400">
                {overdueCount} Tasks
              </span>
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div className="flex flex-col">
              <div className="py-4 border-t border-zinc-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-tight text-zinc-500">
                    Completion
                  </span>
                  <span className="text-xs font-semibold text-blue-400 pl-2">
                    {completion.doneCount}/{completion.totalOperational} (
                    {completion.percent}%)
                  </span>
                </div>

                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-500 ease-out"
                    style={{ width: `${completion.percent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex h-9 items-center gap-2 border border-zinc-800 rounded-lg px-2 py-1 bg-zinc-900/50">
            <Search size={14} className="text-zinc-500" />
            <input
              value={search}
              onChange={(e) => {
                const value = e.target.value;
                setSearch(value);
                onSearchSubmit?.(value);
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                onSearchSubmit?.(search);
                const first = searchMatches[0];
                if (!first || !onNavigateToView) return;
                onNavigateToView(first.status);
              }}
              placeholder="Search action..."
              className="h-full w-36 lg:w-48 bg-transparent text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
            />
            {search.trim().length > 0 && (
              <button
                onClick={() => {
                  setSearch("");
                  onSearchSubmit?.("");
                }}
                title="Clear search"
                className="text-zinc-500 hover:text-zinc-300 transition"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <div className="hidden md:flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/60 p-1.5">
            <button
              onClick={onOpenCalendar}
              title="Calendar"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:border-sky-600 hover:text-sky-300 transition"
            >
              <CalendarDays size={16} />
              <span>Calendar</span>
            </button>
            <button
              onClick={onOpenKanban}
              title="Kanban"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:border-violet-600 hover:text-violet-300 transition"
            >
              <KanbanSquare size={16} />
              <span>Kanban</span>
            </button>
            <button
              onClick={onOpenWeeklyReview}
              title="Weekly Review"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:border-cyan-600 hover:text-cyan-300 transition"
            >
              <ClipboardCheck size={16} />
              <span>Review</span>
            </button>
            <button
              onClick={onOpenSystemHealth}
              title="System Health"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:border-emerald-600 hover:text-emerald-300 transition"
            >
              <ActivitySquare size={16} />
              <span>Health</span>
            </button>
          </div>
          <div className="h-8 w-px bg-zinc-800 mx-2" />
          <button onClick={() => setConfirmOpen(true)}>
            <LogOut
              size={20}
              className="text-zinc-500 hover:text-rose-500 cursor-pointer transition"
            />
          </button>
        </div>
      </header>
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          logout();
        }}
        title="Sign out"
        message="Are you sure you want to log out?"
        variant="danger"
      />
    </>
  );
}
