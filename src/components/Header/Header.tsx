import { HeaderProps } from "@/types";
import { useActions } from "@/context/ActionContext";
import {
  X,
  CalendarDays,
  KanbanSquare,
  LogOut,
  Menu,
  Search,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { getDaysRemaining } from "@/lib/utils";

export function Header({
  openSidebar,
  onOpenCalendar,
  onOpenKanban,
  onNavigateToView,
  onSearchSubmit,
  searchQuery = "",
}: HeaderProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { actions } = useActions();

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

  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  return (
    <>
      <header className="h-16 bg-white/75 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 md:px-8 sticky top-0 z-10">
        <div className="flex items-center gap-8">
          {openSidebar && (
            <button
              onClick={openSidebar}
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white/90 text-slate-600 shadow-sm hover:border-slate-300 hover:text-slate-800 transition cursor-pointer"
              title="Open menu"
            >
              <Menu size={22} />
            </button>
          )}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] text-rose-500 uppercase font-bold leading-none">
                Overdue
              </span>
              <span className="text-sm font-semibold text-rose-400">
                {overdueCount} Tasks
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex flex-col">
              <div className="py-4 border-t border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-tight text-slate-500">
                    Completion
                  </span>
                  <span className="text-xs font-semibold text-sky-600 pl-2">
                    {completion.doneCount}/{completion.totalOperational} (
                    {completion.percent}%)
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-400 h-full transition-all duration-500 ease-out"
                    style={{ width: `${completion.percent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`hidden md:flex h-9 items-center gap-2 border rounded-lg px-2 py-1 transition ${
              search.trim().length > 0
                ? "border-sky-300 bg-sky-50/80 shadow-sm"
                : "border-slate-200 bg-white/80"
            }`}
          >
            <Search size={14} className="text-slate-400" />
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
              placeholder="Search..."
              className="h-full w-36 lg:w-48 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {search.trim().length > 0 && (
              <span className="rounded border border-sky-300 bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-700">
                Filtering
              </span>
            )}
            {search.trim().length > 0 && (
              <button
                onClick={() => {
                  setSearch("");
                  onSearchSubmit?.("");
                }}
                title="Clear search"
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <div className="hidden md:flex items-center gap-1 rounded-xl border border-slate-200 bg-white/80 p-1.5">
            <button
              onClick={onOpenCalendar}
              title="Calendar"
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-sky-200 px-2.5 py-1.5 text-xs font-medium text-sky-700 hover:border-sky-400 hover:text-sky-800 transition"
            >
              <CalendarDays size={16} />
              <span>Calendar</span>
            </button>
            <button
              onClick={onOpenKanban}
              title="Kanban"
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-amber-200 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:border-amber-400 hover:text-amber-800 transition"
            >
              <KanbanSquare size={16} />
              <span>Kanban</span>
            </button>
          </div>
          <div className="hidden md:block h-8 w-px bg-slate-200 mx-2" />
          <button onClick={() => setConfirmOpen(true)}>
            <LogOut
              size={20}
              className="text-slate-500 hover:text-rose-500 cursor-pointer transition"
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
