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
import { getDaysRemaining } from "@/lib/utils";
import { Loading } from "../ui/Loading";

export function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { actions, loading } = useActions();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const nextActions = actions.filter(
    (action) => action.status === "nextActions" || action.status === "waiting",
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
      tasks.sort((a, b) => {
        return (
          new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
        );
      });
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
      <div className="flex mx-auto w-xl items-center justify-between mb-6 gap-4      ">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="px-3 cursor-pointer py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition text-sm"
        >
          ←
        </button>

        <h2 className="text-3xl font-semibold tracking-wide">
          {format(currentMonth, "MMMM yyyy")}
        </h2>

        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="px-3 cursor-pointer py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition text-sm"
        >
          →
        </button>

        <button
          onClick={() => setCurrentMonth(new Date())}
          className="px-3 cursor-pointer py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-900 transition text-sm"
        >
          To day
        </button>
      </div>

      <div className="grid grid-cols-7 text-xs uppercase tracking-wider text-zinc-500 mb-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="text-center border py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 border border-zinc-800 rounded-xl">
        {days.map((day, index) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const dayTasks = tasksByDay.get(dayKey) || [];
          const displayedTask = dayTasks.slice(0, 3);
          const isCurrent = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);

          return (
            <div
              onClick={() => setSelectedDate(day)}
              key={index}
              className={`
                 cursor-pointer min-h-[80px] md:min-h-[130px] p-2 border bg-zinc-900  flex flex-col
                ${
                  isTodayDate
                    ? " border-blue-700"
                    : isCurrent
                      ? "border-zinc-800"
                      : "bg-zinc-950 text-zinc-600"
                }
              `}
            >
              <div className={`text-xs mb-2 font-medium`}>
                {format(day, "d")}
              </div>

              <div className="flex flex-col gap-1 overflow-visible">
                {displayedTask.map((task) => {
                  const late = getDaysRemaining(task?.due_date ?? "") < 0;
                  return (
                    <div
                      key={task.id}
                      className={`
                          ${late ? "bg-red-500/20" : "bg-blue-500/20"}
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
                  );
                })}

                {dayTasks.length > 3 && (
                  <div className="text-[11px] text-zinc-500">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {selectedDate && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
          onClick={() => setSelectedDate(null)}
        >
          <div
            className="bg-zinc-900 p-6 rounded-2xl w-[360px] max-h-[75vh] overflow-y-auto shadow-2xl border border-zinc-800 transform transition-all duration-1 00 scale-100 opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">
              {format(selectedDate, "MMMM d, yyyy")}
            </h3>

            {(tasksByDay.get(format(selectedDate, "yyyy-MM-dd")) || [])
              .sort(
                (a, b) =>
                  new Date(a.due_date!).getTime() -
                  new Date(b.due_date!).getTime(),
              )
              .map((task) => {
                const late = getDaysRemaining(task?.due_date ?? "") < 0;

                return (
                  <div
                    key={task.id}
                    className={`
                mb-2 p-3 rounded-lg text-sm transition
                ${late ? "bg-red-900/40" : "bg-zinc-800"}
              `}
                  >
                    <div className="font-medium text-blue-400">
                      {format(new Date(task.due_date!), "HH:mm")}
                    </div>
                    <div className="text-zinc-300">{task.title}</div>
                  </div>
                );
              })}

            {(tasksByDay.get(format(selectedDate, "yyyy-MM-dd")) || [])
              .length === 0 && (
              <div className="text-zinc-500 text-sm">No tasks for this day</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
