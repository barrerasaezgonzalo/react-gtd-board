import type { Action } from "../types";

export const formatDate = (dateString: string): string => {
  if (!dateString) return "";

  const date = new Date(dateString);

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minuts = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minuts}`;
};

export const getDaysRemaining = (targetDateString: string): number => {
  if (!targetDateString) return 0;

  const targetDate = new Date(targetDateString);
  const today = new Date();

  const targetUTC = Date.UTC(
    targetDate.getUTCFullYear(),
    targetDate.getUTCMonth(),
    targetDate.getUTCDate(),
  );
  const todayUTC = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const diffTime = targetUTC - todayUTC;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export function sortActions(actions: Action[]) {
  const now = Date.now();

  return [...actions].sort((a, b) => {
    const getTime = (value: string | null) => {
      if (!value) return Number.POSITIVE_INFINITY;
      const normalized = value.replace(" ", "T");
      return new Date(normalized).getTime();
    };

    const getPriority = (item: Action) => {
      if (item.urgent) return 0;

      const dueTime = getTime(item.due_date);
      if (dueTime < now) return 1;

      return 2;
    };

    const pA = getPriority(a);
    const pB = getPriority(b);

    if (pA !== pB) return pA - pB;

    return getTime(a.due_date) - getTime(b.due_date);
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
