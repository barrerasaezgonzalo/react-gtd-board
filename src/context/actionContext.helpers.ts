import type { Action, UpdateActionParams } from "@/types";

export function normalizeFetchedActions(actions: Action[]) {
  return actions.map((action) => ({
    ...action,
    context: action.context ?? "home",
  }));
}

export function hasDueDateValue(dueDate: string | null | undefined) {
  if (typeof dueDate === "string") return dueDate.trim().length > 0;
  return !!dueDate;
}

export function shouldBlockMoveToNextActions(params: {
  updates: UpdateActionParams["updates"];
  currentAction?: Action;
}) {
  const { updates, currentAction } = params;
  const targetStatus = updates.status ?? currentAction?.status;
  const effectiveDueDate = updates.due_date ?? currentAction?.due_date ?? null;
  return targetStatus === "nextActions" && !hasDueDateValue(effectiveDueDate);
}

export function buildCaptureInsertPayload(capture: string, userId: string) {
  return {
    title: capture.trim(),
    status: "backLog" as const,
    context: "home" as const,
    urgent: false,
    user_id: userId,
  };
}
