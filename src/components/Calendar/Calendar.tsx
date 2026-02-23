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
  parseISO,
} from "date-fns";
import { Action } from "@/types";
import { useActions } from "@/context/ActionContext";
import { getDaysRemaining } from "@/lib/utils";
import { Loading } from "../ui/Loading";

export function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { actions, loading } = useActions();
  const [showAll, setShowAll] = useState(false);

  const nextActions = actions.filter(
    (action) => action.status === "nextActions" || action.status === "waiting",
  );
  const tasksByDay = useMemo(() => {
    const map = new Map<string, Action[]>();

    nextActions.forEach((task) => {
      if (!task.due_date) return;
      const key = format(
        parseISO(task.due_date.substring(0, 10)),
        "yyyy-MM-dd",
      );
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(task);
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
    <div className="w-full max-w-4xl mx-auto p-6 bg-zinc-950 text-zinc-100 rounded-2xl shadow-xl border border-zinc-800">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="px-3 cursor-pointer py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition text-sm"
        >
          ←
        </button>

        <h2 className="text-lg font-semibold tracking-wide">
          {format(currentMonth, "MMMM yyyy")}
        </h2>

        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="px-3 cursor-pointer py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition text-sm"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 text-xs uppercase tracking-wider text-zinc-500 mb-3">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="text-center">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 border border-zinc-800 rounded-xl">
        {days.map((day, index) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const dayTasks = tasksByDay.get(dayKey) || [];
          const displayedTask = showAll ? dayTasks : dayTasks.slice(0, 3);
          const isCurrent = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);

          return (
            <div
              key={index}
              className={`
                 min-h-[80px] md:min-h-[130px] p-2 border border-zinc-800 flex flex-col
                ${
                  isTodayDate
                    ? "bg-blue-900"
                    : isCurrent
                      ? "bg-zinc-900"
                      : "bg-zinc-950 text-zinc-600"
                }
              `}
            >
              <div className={`text-xs mb-2 font-medium`}>
                {format(day, "d")}
              </div>

              <div className="flex flex-col gap-1 overflow-visible">
                {displayedTask.map((task) => {
                  const late = getDaysRemaining(task?.due_date).includes(
                    "Vencida",
                  );
                  return (
                    <div className="relative group" key={task.id}>
                      <div
                        className={`
                        ${late ? "bg-red-500/20 " : "bg-blue-500/20 "}
                        text-white
                        text-xs 
                        px-1 
                        py-1 
                        rounded-md 
                        truncate
                        h-6
                      `}
                      >
                        {task.title}
                      </div>

                      <div
                        className={`
                        absolute left-0 top-0
                        hidden group-hover:block
                        z-50
                        ${late ? "bg-red-900 " : "bg-blue-900 "}
                        text-white
                        text-xs
                        px-3 py-2
                        rounded-lg
                        shadow-xl
                        w-max max-w-[220px]
                        whitespace-normal
                        break-words
                        scale-95 group-hover:scale-100
                        transition-all duration-150
                        `}
                      >
                        {task.title}
                      </div>
                    </div>
                  );
                })}

                {dayTasks.length > 3 && (
                  <div
                    onClick={() => setShowAll(!showAll)}
                    className="cursor-pointer text-[11px] text-zinc-500"
                  >
                    {showAll ? "show less" : "show more"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
