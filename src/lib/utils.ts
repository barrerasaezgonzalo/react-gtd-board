import type { Action } from "../types";

type TimestampParts = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
};

function getTimestampParts(value: string): TimestampParts | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T])(\d{2}):(\d{2})/);
  if (!match) return null;

  return {
    year: match[1],
    month: match[2],
    day: match[3],
    hour: match[4],
    minute: match[5],
  };
}

export const formatDate = (dateString: string): string => {
  if (!dateString) return "";

  const parts = getTimestampParts(dateString);
  if (parts) {
    return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`;
  }

  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minuts = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minuts}`;
};

export const getDaysRemaining = (targetDateString: string): number => {
  if (!targetDateString) return 0;

  const today = new Date();
  const parts = getTimestampParts(targetDateString);
  const targetLocalDate = parts
    ? new Date(Number(parts.year), Number(parts.month) - 1, Number(parts.day))
    : (() => {
        const targetDate = new Date(targetDateString);
        return new Date(
          targetDate.getFullYear(),
          targetDate.getMonth(),
          targetDate.getDate(),
        );
      })();

  const todayLocalDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const diffTime = targetLocalDate.getTime() - todayLocalDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const toDateTimeLocalValue = (dateString: string): string => {
  if (!dateString) return "";
  const parts = getTimestampParts(dateString);
  if (parts) {
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
  }

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

export const getDateKeyFromTimestamp = (dateString: string): string => {
  const parts = getTimestampParts(dateString);
  if (parts) {
    return `${parts.year}-${parts.month}-${parts.day}`;
  }

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
