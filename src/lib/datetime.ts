type TimestampParts = {
  year: string;
  month: string;
  day: string;
  hour?: string;
  minute?: string;
};

function getTimestampParts(value: string): TimestampParts | null {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::\d{2})?)?/,
  );
  if (!match) return null;

  return {
    year: match[1],
    month: match[2],
    day: match[3],
    hour: match[4],
    minute: match[5],
  };
}

function parseDate(raw: string): Date | null {
  if (!raw) return null;
  const normalized = raw.includes(" ") ? raw.replace(" ", "T") : raw;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDueDate(dateString: string): string {
  if (!dateString) return "";

  const parts = getTimestampParts(dateString);
  if (parts?.hour && parts.minute) {
    return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`;
  }

  if (parts) {
    return `${parts.day}/${parts.month}/${parts.year}`;
  }

  const date = parseDate(dateString);
  if (!date) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function toDateKey(dateString: string): string {
  if (!dateString) return "";
  const parts = getTimestampParts(dateString);
  if (parts) {
    return `${parts.year}-${parts.month}-${parts.day}`;
  }

  const date = parseDate(dateString);
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toDateTimeLocalInput(dateString: string): string {
  if (!dateString) return "";
  const parts = getTimestampParts(dateString);
  if (parts) {
    const hour = parts.hour ?? "00";
    const minute = parts.minute ?? "00";
    return `${parts.year}-${parts.month}-${parts.day}T${hour}:${minute}`;
  }

  const date = parseDate(dateString);
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export function daysRemaining(targetDateString: string, now = new Date()): number {
  if (!targetDateString) return 0;
  const key = toDateKey(targetDateString);
  if (!key) return 0;

  const [year, month, day] = key.split("-").map(Number);
  const targetLocalDate = new Date(year, month - 1, day);
  const todayLocalDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const diffMs = targetLocalDate.getTime() - todayLocalDate.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function dueTimestampMs(value: string | null): number {
  if (!value) return Number.POSITIVE_INFINITY;
  const parts = getTimestampParts(value);
  if (parts) {
    const year = Number(parts.year);
    const month = Number(parts.month);
    const day = Number(parts.day);
    const hour = Number(parts.hour ?? "00");
    const minute = Number(parts.minute ?? "00");
    return new Date(year, month - 1, day, hour, minute).getTime();
  }

  const date = parseDate(value);
  return date ? date.getTime() : Number.POSITIVE_INFINITY;
}

export function compareDueDatesAsc(
  a: string | null,
  b: string | null,
): number {
  const aTs = dueTimestampMs(a);
  const bTs = dueTimestampMs(b);
  if (aTs === bTs) return 0;
  return aTs - bTs;
}
