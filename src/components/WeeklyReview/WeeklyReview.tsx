"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, RotateCcw, ClipboardCheck } from "lucide-react";
import { useActions } from "@/context/ActionContext";
import { useProjects } from "@/context/ProjectsContext";
import { useWeeklyReview } from "@/context/WeeklyReviewContext";
import type { WeeklyReviewStep } from "@/types";
import { getDaysRemaining } from "@/lib/utils";
import { Loading } from "../ui/Loading";
import { Capture } from "../ui/Capture";

const EMPTY_STEPS: WeeklyReviewStep[] = [];

export function WeeklyReview() {
  const { review, loading, saving, toggleStep, resetWeekReview } =
    useWeeklyReview();
  const { actions } = useActions();
  const { projects } = useProjects();
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const steps = review?.steps ?? EMPTY_STEPS;

  const completedCount = steps.filter((step) => step.done).length;
  const progress =
    steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;
  const overdue = actions.filter((action) => {
    if (!action.due_date) return false;
    return getDaysRemaining(action.due_date) < 0;
  }).length;
  const waitingCount = actions.filter(
    (action) => action.status === "waiting",
  ).length;
  const projectsWithoutNext = projects.filter((project) => {
    const projectActions = actions.filter(
      (action) => action.project_id === project.id,
    );
    if (projectActions.length === 0) return false;
    return !projectActions.some((action) => action.status === "nextActions");
  }).length;
  const defaultStepId =
    steps.find((step) => !step.done)?.id ?? steps[0]?.id ?? null;
  const resolvedActiveStepId =
    activeStepId && steps.some((step) => step.id === activeStepId)
      ? activeStepId
      : defaultStepId;
  const activeStepIndex = useMemo(
    () => steps.findIndex((step) => step.id === resolvedActiveStepId),
    [steps, resolvedActiveStepId],
  );
  const activeStep = activeStepIndex >= 0 ? steps[activeStepIndex] : null;

  if (loading || !review) return <Loading />;

  const goToPreviousStep = () => {
    if (activeStepIndex <= 0) return;
    setActiveStepId(review.steps[activeStepIndex - 1].id);
  };

  const handleNextStep = async () => {
    if (!activeStep) return;

    if (!activeStep.done) {
      await toggleStep(activeStep.id);
    }

    const simulatedSteps = steps.map((step) =>
      step.id === activeStep.id ? { ...step, done: true } : step,
    );
    const nextPendingAfterCurrent = simulatedSteps.find(
      (step, index) => index > activeStepIndex && !step.done,
    );
    const firstPending = simulatedSteps.find((step) => !step.done);
    const fallback =
      simulatedSteps[Math.min(activeStepIndex + 1, simulatedSteps.length - 1)];
    setActiveStepId(
      (nextPendingAfterCurrent ?? firstPending ?? fallback)?.id ?? null,
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <Capture />

      <div className="flex items-center gap-2 border-b border-zinc-800/50 pb-2">
        <ClipboardCheck className="text-cyan-400" size={24} />
        <h2 className="text-2xl font-bold uppercase tracking-widest text-white">
          Weekly Review
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
          <p className="text-[11px] uppercase text-zinc-500">Progress</p>
          <p className="text-xl font-semibold text-cyan-300">{progress}%</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
          <p className="text-[11px] uppercase text-zinc-500">Overdue</p>
          <p className="text-xl font-semibold text-rose-300">{overdue}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
          <p className="text-[11px] uppercase text-zinc-500">Waiting</p>
          <p className="text-xl font-semibold text-amber-300">{waitingCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
          <p className="text-[11px] uppercase text-zinc-500">
            Projects no next
          </p>
          <p className="text-xl font-semibold text-violet-300">
            {projectsWithoutNext}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-300">
            Week start:{" "}
            <span className="text-zinc-100">{review.week_start}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousStep}
              disabled={saving || activeStepIndex <= 0}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-zinc-700 text-zinc-300 hover:border-zinc-500 transition disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={handleNextStep}
              disabled={saving || !activeStep}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-cyan-700 text-cyan-300 hover:border-cyan-500 transition disabled:opacity-50"
            >
              Next step
            </button>
            <button
              onClick={resetWeekReview}
              disabled={saving}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-zinc-700 text-zinc-300 hover:border-zinc-500 transition disabled:opacity-50"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {steps.map((step) => (
            <div
              key={step.id}
              onClick={() => setActiveStepId(step.id)}
              className={`w-full text-left rounded-lg border p-3 transition ${
                activeStepId === step.id
                  ? "border-cyan-600/70 bg-cyan-950/15"
                  : step.done
                    ? "border-emerald-700/70 bg-emerald-950/20"
                    : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <CheckCircle2
                  size={18}
                  className={step.done ? "text-emerald-400" : "text-zinc-600"}
                />
                <div>
                  <p className="text-sm font-medium text-zinc-100">
                    {step.title}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    {step.description}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    void toggleStep(step.id);
                  }}
                  disabled={saving}
                  className="text-[11px] px-2 py-1 rounded border border-zinc-700 text-zinc-300 hover:border-zinc-500 disabled:opacity-50"
                >
                  {step.done ? "Undo" : "Done"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
