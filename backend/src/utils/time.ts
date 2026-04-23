import type { OwnerBusyInterval } from "../types/contracts.js";

const MOSCOW_OFFSET_MINUTES = 3 * 60;
const MOSCOW_OFFSET_MS = MOSCOW_OFFSET_MINUTES * 60_000;

export const parseIsoDateTimeToMs = (value: string): number | null => {
  const hasTimeZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
  if (!hasTimeZone) {
    return null;
  }

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
};

export const toIsoString = (valueMs: number): string => {
  const moscowDate = new Date(valueMs + MOSCOW_OFFSET_MS);
  const year = moscowDate.getUTCFullYear();
  const month = String(moscowDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(moscowDate.getUTCDate()).padStart(2, "0");
  const hours = String(moscowDate.getUTCHours()).padStart(2, "0");
  const minutes = String(moscowDate.getUTCMinutes()).padStart(2, "0");
  const seconds = String(moscowDate.getUTCSeconds()).padStart(2, "0");
  const milliseconds = String(moscowDate.getUTCMilliseconds()).padStart(3, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+03:00`;
};

export const parseDateOnly = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utcMs = Date.UTC(year, month - 1, day, 0, 0, 0, 0) - MOSCOW_OFFSET_MS;
  const date = new Date(utcMs);
  const moscowDate = new Date(utcMs + MOSCOW_OFFSET_MS);

  if (
    Number.isNaN(date.getTime()) ||
    moscowDate.getUTCFullYear() !== year ||
    moscowDate.getUTCMonth() !== month - 1 ||
    moscowDate.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
};

export const overlaps = (
  candidateStartMs: number,
  candidateEndMs: number,
  intervals: OwnerBusyInterval[],
): OwnerBusyInterval | null => {
  const found = intervals.find(
    (entry) => candidateStartMs < entry.endMs && candidateEndMs > entry.startMs,
  );

  return found ?? null;
};

export const parseTimeToMinutes = (value: string): number | null => {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return null;
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
};

export const addMinutes = (startMs: number, minutes: number): number => startMs + minutes * 60_000;
