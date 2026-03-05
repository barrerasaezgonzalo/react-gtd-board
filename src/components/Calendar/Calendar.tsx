import { useMemo, useState } from "react";
import {
  addMonths,
  subMonths,
  format,
  parse,
  isSameMonth,
  isToday,
} from "date-fns";
import { es } from "date-fns/locale";
import { Action } from "@/types";
import { useActions } from "@/context/ActionContext";
import {
  compareDueDatesAsc,
  daysRemaining,
  formatDueDate,
  toDateKey,
} from "@/lib/datetime";
import {
  actionMatchesQuery,
} from "@/lib/utils";
import { Loading } from "../ui/Loading";
import { Capture } from "../ui/Capture";
import { Title } from "../ui/Title";
import { Calendar1, Clock3 } from "lucide-react";

export function Calendar({ searchQuery = "" }: { searchQuery?: string }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { actions, loading } = useActions();
  const parseDateKey = (dateKey: string) =>
    parse(dateKey, "yyyy-MM-dd", new Date());

  const nextActions = actions.filter(
    (action) =>
      (action.status === "nextActions" || action.status === "waiting") &&
      actionMatchesQuery(action, searchQuery),
  );

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Action[]>();

    nextActions.forEach((task) => {
      if (!task.due_date) return;

      const key = toDateKey(task.due_date);

      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(task);
    });

    map.forEach((tasks) => {
      tasks.sort(
        (a, b) =>
          compareDueDatesAsc(a.due_date, b.due_date),
      );
    });

    return map;
  }, [nextActions]);

  if (loading) return <Loading />;

  return (
    <div className="relative max-w-[1600px] mx-auto space-y-6">
      <Capture />
      <Title title="Calendar" icon={Calendar1} />

      <section className="rounded-2xl border border-sky-200 bg-white/80 backdrop-blur-sm px-4 py-4 sm:px-6 sm:py-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold tracking-wide capitalize text-slate-900">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </h2>

          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="cursor-pointer px-3 py-1.5 rounded-lg border border-sky-300 bg-sky-100 text-sky-700 hover:bg-sky-200 transition text-xs sm:text-sm font-medium"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="cursor-pointer px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition text-xs sm:text-sm"
            >
              {"<"}
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="cursor-pointer px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition text-xs sm:text-sm"
            >
              {">"}
            </button>
          </div>
        </div>
      </section>

      <div className="block space-y-4">
        {Array.from(tasksByDay.entries())
          .filter(([dateKey]) =>
            isSameMonth(parseDateKey(dateKey), currentMonth),
          )
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([dateKey, tasks]) => {
            const date = parseDateKey(dateKey);
            const isTodayDate = isToday(date);

            return (
              <section
                key={dateKey}
                className={`rounded-2xl border p-4 sm:p-5 shadow-sm ${
                  isTodayDate
                    ? "border-sky-300 bg-sky-50/80"
                    : "border-slate-200 bg-white/80"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-800 capitalize">
                    {format(date, "EEEE d 'de' MMMM", { locale: es })}
                  </h3>
                  {isTodayDate && (
                    <span className="text-[10px] uppercase tracking-wide font-bold rounded-full px-2 py-1 border border-sky-300 bg-sky-100 text-sky-700">
                      Hoy
                    </span>
                  )}
                </div>

                <div className="space-y-2.5">
                  {tasks.map((task) => {
                    const remainingDays = daysRemaining(
                      task?.due_date ?? "",
                    );
                    const isOverdue = remainingDays < 0;
                    const isDueToday = remainingDays === 0;

                    return (
                      <article
                        key={task.id}
                        className={`rounded-xl border px-3 py-3 ${
                          isOverdue
                            ? "border-rose-300 bg-rose-50"
                            : isDueToday
                              ? "border-amber-300 bg-amber-50/70"
                              : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide">
                            <Clock3
                              size={13}
                              className={
                                isOverdue
                                  ? "text-rose-400"
                                  : isDueToday
                                    ? "text-amber-500"
                                    : "text-slate-600"
                              }
                            />
                            <span
                              className={
                                isOverdue
                                  ? "text-rose-500"
                                  : isDueToday
                                    ? "text-amber-600"
                                    : "text-slate-700"
                              }
                            >
                              {formatDueDate(task.due_date!)}
                            </span>
                          </div>
                          <span
                            className={`text-[11px] font-medium ${
                              isOverdue
                                ? "text-rose-500"
                                : isDueToday
                                  ? "text-amber-600"
                                  : "text-slate-500"
                            }`}
                          >
                            {isOverdue
                              ? `Vencida ${Math.abs(remainingDays)} d`
                              : isDueToday
                                ? "Vence hoy"
                                : `Quedan ${remainingDays} d`}
                          </span>
                        </div>
                        <p className="text-sm text-slate-800 mt-1.5">
                          {task.title}
                        </p>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}

        {Array.from(tasksByDay.keys()).filter((dateKey) =>
          isSameMonth(parseDateKey(dateKey), currentMonth),
        ).length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-sky-200 bg-white/70 text-slate-500 text-sm text-center py-12">
            No upcoming tasks
          </div>
        )}
      </div>
    </div>
  );
}
