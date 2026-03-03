import { useMemo, useState } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
  isToday,
} from "date-fns";
import { Action } from "@/types";
import { useActions } from "@/context/ActionContext";
import { actionMatchesQuery, getDaysRemaining } from "@/lib/utils";
import { Loading } from "../ui/Loading";
import { Capture } from "../ui/Capture";
import { Calendar1 } from "lucide-react";

export function Calendar({ searchQuery = "" }: { searchQuery?: string }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { actions, loading } = useActions();

  const nextActions = actions.filter(
    (action) =>
      (action.status === "nextActions" || action.status === "waiting") &&
      actionMatchesQuery(action, searchQuery),
  );

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Action[]>();

    nextActions.forEach((task) => {
      if (!task.due_date) return;

      const date = new Date(task.due_date);
      const key = format(date, "yyyy-MM-dd");

      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(task);
    });

    map.forEach((tasks) => {
      tasks.sort(
        (a, b) =>
          new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime(),
      );
    });

    return map;
  }, [nextActions]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = startDate;

  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  if (loading) return <Loading />;

  return (
    <div className="relative max-w-[1600px] mx-auto space-y-6 ">
      <Capture />

      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg sm:text-xl md:text-2xl flex gap-2 items-center font-semibold tracking-wide uppercase">
          <Calendar1 size={22} className="text-blue-400" />
          {format(currentMonth, "MMMM yyyy")}
        </h2>

        <div className="flex gap-2 sm:gap-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="px-2 sm:px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition text-xs sm:text-sm"
          >
            {"<"}
          </button>

          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="px-2 sm:px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition text-xs sm:text-sm"
          >
            {">"}
          </button>

          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-2 sm:px-3 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-900 transition text-xs sm:text-sm"
          >
            Today
          </button>
        </div>
      </div>

      <div className="block space-y-6">
        {Array.from(tasksByDay.entries())
          .filter(([dateKey]) => isSameMonth(new Date(dateKey), currentMonth))
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([dateKey, tasks]) => {
            const date = new Date(dateKey);
            const isTodayDate = isToday(date);

            return (
              <div
                key={dateKey}
                className={`rounded-xl p-4 border ${
                  isTodayDate
                    ? "border-blue-700 bg-zinc-900"
                    : "border-zinc-800 bg-zinc-900"
                }`}
              >
                <div className="text-sm font-semibold mb-3">
                  {format(date, "EEEE d MMMM")}
                </div>

                <div className="space-y-2">
                  {tasks.map((task) => {
                    const late = getDaysRemaining(task?.due_date ?? "") < 0;

                    return (
                      <div
                        key={task.id}
                        className={`p-3 rounded-lg text-sm ${
                          late ? "bg-red-900/40" : "bg-zinc-800"
                        }`}
                      >
                        <div className="text-blue-400 text-xs mb-1">
                          {format(new Date(task.due_date!), "HH:mm")}
                        </div>
                        <div className="text-zinc-300">{task.title}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

        {Array.from(tasksByDay.keys()).filter((dateKey) =>
          isSameMonth(new Date(dateKey), currentMonth),
        ).length === 0 && (
          <div className="text-zinc-500 text-sm text-center py-10">
            No upcoming tasks
          </div>
        )}
      </div>
    </div>
  );
}
