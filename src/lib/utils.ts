import type { Action } from "../types";
import {
  compareDueDatesAsc,
  daysRemaining,
  formatDueDate,
  toDateKey,
  toDateTimeLocalInput,
  dueTimestampMs,
} from "./datetime.ts";

export const formatDate = formatDueDate;
export const getDaysRemaining = daysRemaining;
export const toDateTimeLocalValue = toDateTimeLocalInput;
export const getDateKeyFromTimestamp = toDateKey;

export function sortActions(actions: Action[]) {
  const now = Date.now();

  return [...actions].sort((a, b) => {
    const getPriority = (item: Action) => {
      if (item.urgent) return 0;

      const dueTime = dueTimestampMs(item.due_date);
      if (dueTime < now) return 1;

      return 2;
    };

    const pA = getPriority(a);
    const pB = getPriority(b);

    if (pA !== pB) return pA - pB;

    return compareDueDatesAsc(a.due_date, b.due_date);
  });
}

export function actionMatchesQuery(action: Action, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return (
    action.title.toLowerCase().includes(normalized) ||
    (action.text ?? "").toLowerCase().includes(normalized) ||
    (action.file_urls ?? "").toLowerCase().includes(normalized)
  );
}
