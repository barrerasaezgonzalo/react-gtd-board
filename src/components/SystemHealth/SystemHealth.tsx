"use client";

import { useMemo } from "react";
import { ActivitySquare } from "lucide-react";
import { useActions } from "@/context/ActionContext";
import { useProjects } from "@/context/ProjectsContext";
import { useWeeklyReview } from "@/context/WeeklyReviewContext";
import type { ActiveView } from "@/types";
import { getDaysRemaining } from "@/lib/utils";
import { Loading } from "../ui/Loading";
import { Capture } from "../ui/Capture";

export function SystemHealth({
  onNavigate,
}: {
  onNavigate: (view: ActiveView) => void;
}) {
  const { actions } = useActions();
  const { projects } = useProjects();
  const { review, loading } = useWeeklyReview();

  const metrics = useMemo(() => {
    const backlogCount = actions.filter(
      (action) => action.status === "backLog",
    ).length;
    const waitingStaleCount = actions.filter(
      (action) =>
        action.status === "waiting" &&
        !!action.created_at &&
        getDaysRemaining(action.created_at) <= -7,
    ).length;
    const overdueCount = actions.filter(
      (action) =>
        action.status !== "done" &&
        !!action.due_date &&
        getDaysRemaining(action.due_date) < 0,
    ).length;
    const dueSoonCount = actions.filter((action) => {
      if (!action.due_date) return false;
      if (!(action.status === "nextActions" || action.status === "waiting"))
        return false;
      const days = getDaysRemaining(action.due_date);
      return days >= 0 && days <= 7;
    }).length;
    const projectCount = projects.length;
    const weeklyReviewCompleted = !!review?.completed_at;
    const penalties =
      Math.min(backlogCount, 30) * 0.8 +
      Math.min(waitingStaleCount, 15) * 2 +
      Math.min(overdueCount, 20) * 2.5 +
      (weeklyReviewCompleted ? 0 : 10);
    const healthScore = Math.max(0, Math.min(100, Math.round(100 - penalties)));
    const healthTone =
      healthScore >= 80 ? "good" : healthScore >= 55 ? "warning" : "critical";

    return {
      backlogCount,
      waitingStaleCount,
      overdueCount,
      dueSoonCount,
      projectCount,
      weeklyReviewCompleted,
      healthScore,
      healthTone,
    };
  }, [actions, projects, review]);

  if (loading) return <Loading />;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <Capture />

      <div className="flex items-center gap-2 border-b border-zinc-800/50 pb-2">
        <ActivitySquare className="text-cyan-400" size={24} />
        <h2 className="text-2xl font-bold uppercase tracking-widest text-white">
          System Health
        </h2>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase text-zinc-500">Health Score</p>
          <p
            className={`text-xl font-bold ${
              metrics.healthTone === "good"
                ? "text-emerald-300"
                : metrics.healthTone === "warning"
                  ? "text-amber-300"
                  : "text-rose-300"
            }`}
          >
            {metrics.healthScore}/100
          </p>
        </div>
        <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              metrics.healthTone === "good"
                ? "bg-emerald-500"
                : metrics.healthTone === "warning"
                  ? "bg-amber-500"
                  : "bg-rose-500"
            }`}
            style={{ width: `${metrics.healthScore}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
          <p className="text-xs uppercase text-zinc-500">
            Backlog sin procesar
          </p>
          <p className="text-2xl font-semibold text-zinc-200">
            {metrics.backlogCount}
          </p>
          <button
            onClick={() => onNavigate("backLog")}
            className="text-xs border border-zinc-700 px-2 py-1 rounded text-zinc-300 hover:border-zinc-500"
          >
            Ir a Backlog
          </button>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
          <p className="text-xs uppercase text-zinc-500">
            Waiting estancadas (+7 dias)
          </p>
          <p className="text-2xl font-semibold text-amber-300">
            {metrics.waitingStaleCount}
          </p>
          <button
            onClick={() => onNavigate("waiting")}
            className="text-xs border border-amber-800 px-2 py-1 rounded text-amber-300 hover:border-amber-600"
          >
            Ir a Waiting
          </button>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
          <p className="text-xs uppercase text-zinc-500">Atrasadas</p>
          <p className="text-2xl font-semibold text-rose-300">
            {metrics.overdueCount}
          </p>
          <button
            onClick={() => onNavigate("nextActions")}
            className="text-xs border border-rose-800 px-2 py-1 rounded text-rose-300 hover:border-rose-600"
          >
            Ir a Next Actions
          </button>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
          <p className="text-xs uppercase text-zinc-500">Proximas 7 dias</p>
          <p className="text-2xl font-semibold text-sky-300">
            {metrics.dueSoonCount}
          </p>
          <button
            onClick={() => onNavigate("calendar")}
            className="text-xs border border-sky-800 px-2 py-1 rounded text-sky-300 hover:border-sky-600"
          >
            Ver Calendar
          </button>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
          <p className="text-xs uppercase text-zinc-500">Proyectos</p>
          <p className="text-2xl font-semibold text-violet-300">
            {metrics.projectCount}
          </p>
          <button
            onClick={() => onNavigate("projects")}
            className="text-xs border border-violet-800 px-2 py-1 rounded text-violet-300 hover:border-violet-600"
          >
            Ir a Projects
          </button>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
          <p className="text-xs uppercase text-zinc-500">Weekly Review</p>
          <p
            className={`text-2xl font-semibold ${
              metrics.weeklyReviewCompleted
                ? "text-emerald-300"
                : "text-rose-300"
            }`}
          >
            {metrics.weeklyReviewCompleted ? "Al dia" : "Pendiente"}
          </p>
          <button
            onClick={() => onNavigate("weeklyReview")}
            className="text-xs border border-zinc-700 px-2 py-1 rounded text-zinc-300 hover:border-zinc-500"
          >
            Ir a Weekly Review
          </button>
        </div>
      </div>
    </div>
  );
}
