import test from "node:test";
import assert from "node:assert/strict";
import {
  compareDueDatesAsc,
  daysRemaining,
  dueTimestampMs,
  formatDueDate,
  toDateKey,
  toDateTimeLocalInput,
} from "./datetime.ts";

function formatLocalDateTime(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function formatLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatLocalDateTimeInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

test("formatDueDate keeps timestamp wall-clock from DB strings", () => {
  assert.equal(
    formatDueDate("2026-03-05 09:00:00+00"),
    "05/03/2026 09:00",
  );
  assert.equal(
    formatDueDate("2026-03-05T21:45:00.000Z"),
    "05/03/2026 21:45",
  );
});

test("toDateTimeLocalInput and toDateKey are stable for SQL/ISO timestamps", () => {
  assert.equal(
    toDateTimeLocalInput("2026-03-05 09:00:00+00"),
    "2026-03-05T09:00",
  );
  assert.equal(toDateKey("2026-03-05 09:00:00+00"), "2026-03-05");
  assert.equal(toDateKey("2026-03-05T23:59:59.999Z"), "2026-03-05");
});

test("datetime helpers return empty values for empty input", () => {
  assert.equal(formatDueDate(""), "");
  assert.equal(toDateKey(""), "");
  assert.equal(toDateTimeLocalInput(""), "");
  assert.equal(daysRemaining(""), 0);
});

test("daysRemaining uses calendar-day difference (<0 / 0 / >0)", () => {
  const now = new Date("2026-03-05T13:00:00-03:00");

  assert.equal(daysRemaining("2026-03-05 09:00:00+00", now), 0);
  assert.equal(daysRemaining("2026-03-04 23:59:00+00", now), -1);
  assert.equal(daysRemaining("2026-03-06 00:01:00+00", now), 1);
});

test("daysRemaining returns 0 for invalid date strings", () => {
  assert.equal(daysRemaining("not-a-date"), 0);
});

test("compareDueDatesAsc sorts due dates from oldest to newest", () => {
  assert.ok(
    compareDueDatesAsc("2026-03-05 09:00:00+00", "2026-03-06 09:00:00+00") < 0,
  );
  assert.ok(
    compareDueDatesAsc("2026-03-07 09:00:00+00", "2026-03-06 09:00:00+00") > 0,
  );
  assert.equal(compareDueDatesAsc(null, null), 0);
});

test("formatDueDate handles date-only, invalid and Date-fallback inputs", () => {
  assert.equal(formatDueDate("2026-03-05"), "05/03/2026");
  assert.equal(formatDueDate(""), "");
  assert.equal(formatDueDate("not-a-date"), "");

  const fallbackValue = "2026/03/05";
  assert.equal(
    formatDueDate(fallbackValue),
    formatLocalDateTime(new Date(fallbackValue)),
  );
});

test("toDateKey and toDateTimeLocalInput cover Date-fallback and invalid inputs", () => {
  const fallbackValue = "2026/03/05";
  const fallbackDate = new Date(fallbackValue);

  assert.equal(toDateKey(fallbackValue), formatLocalDateKey(fallbackDate));
  assert.equal(toDateKey("not-a-date"), "");

  assert.equal(
    toDateTimeLocalInput(fallbackValue),
    formatLocalDateTimeInput(fallbackDate),
  );
  assert.equal(toDateTimeLocalInput("not-a-date"), "");
});

test("dueTimestampMs falls back for non-SQL formats and invalid values", () => {
  const fallbackValue = "2026/03/05";
  const fallbackTs = dueTimestampMs(fallbackValue);
  assert.ok(Number.isFinite(fallbackTs));
  assert.equal(dueTimestampMs("not-a-date"), Number.POSITIVE_INFINITY);
});

test("dueTimestampMs handles empty and parse-fallback strings with spaces", () => {
  assert.equal(dueTimestampMs(null), Number.POSITIVE_INFINITY);
  assert.equal(
    dueTimestampMs("Thu, 05 Mar 2026 09:00:00 GMT"),
    Number.POSITIVE_INFINITY,
  );
});
