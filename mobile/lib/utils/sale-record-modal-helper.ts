import { formatDateOnly, parseDateParts } from "@/lib/utils/calendar-helper";

type DateParts = {
  year: number;
  month: number;
  day: number;
};

function padTwo(value: number): string {
  return String(value).padStart(2, "0");
}

export function getTodayParts(): DateParts {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
    day: now.getDate(),
  };
}

export function toAmountInput(value?: number | null): string {
  if (value == null) return "";
  return Number.isInteger(value) ? String(Math.trunc(value)) : String(value);
}

export function getInitialLocalDate(sourceDate?: string | null): string {
  const fallback = new Date();
  const parsed = parseDateParts(
    (sourceDate ?? fallback.toISOString()).slice(0, 10),
  );

  const year = parsed?.year ?? fallback.getFullYear();
  const month = parsed?.month ?? fallback.getMonth();
  const day = parsed?.day ?? fallback.getDate();

  return formatDateOnly(year, month, day);
}

export function getCurrentLocalTimeString(date = new Date()): string {
  return `${padTwo(date.getHours())}:${padTwo(date.getMinutes())}`;
}

export function getInitialLocalTime(sourceDate?: string | null): string {
  if (!sourceDate) {
    return getCurrentLocalTimeString();
  }

  const date = new Date(sourceDate);
  if (Number.isNaN(date.getTime())) {
    return getCurrentLocalTimeString();
  }

  return `${padTwo(date.getHours())}:${padTwo(date.getMinutes())}`;
}

export function isValidLocalTime(value: string): boolean {
  const match = /^(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return false;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  return (
    Number.isInteger(hours) &&
    Number.isInteger(minutes) &&
    hours >= 0 &&
    hours <= 23 &&
    minutes >= 0 &&
    minutes <= 59
  );
}

export function clampTimePart(value: number, max: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > max) return max;
  return Math.trunc(value);
}

export function splitLocalTime(value: string): {
  hour: number;
  minute: number;
} {
  if (!isValidLocalTime(value)) {
    const now = new Date();
    return { hour: now.getHours(), minute: now.getMinutes() };
  }

  const [hourText, minuteText] = value.split(":");
  return {
    hour: Number(hourText),
    minute: Number(minuteText),
  };
}

export function buildLocalTime(hour: number, minute: number): string {
  return `${padTwo(clampTimePart(hour, 23))}:${padTwo(clampTimePart(minute, 59))}`;
}

export function getCalendarCursor(localDate: string): {
  year: number;
  month: number;
} {
  const parsed = parseDateParts(localDate);
  if (!parsed) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }

  return { year: parsed.year, month: parsed.month };
}

export function buildCalendarDays(year: number, month: number): number[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const leading = Array.from({ length: firstWeekday }, () => 0);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return [...leading, ...days];
}

export function canGoToNextMonth(
  year: number,
  month: number,
  today: DateParts,
): boolean {
  return year < today.year || (year === today.year && month < today.month);
}

export function isFutureCalendarDay(
  year: number,
  month: number,
  day: number,
  today: DateParts,
): boolean {
  return (
    year > today.year ||
    (year === today.year &&
      (month > today.month || (month === today.month && day > today.day)))
  );
}

export function parseAmount(input: string): number {
  const sanitized = input.replace(/,/g, "").trim();
  return sanitized ? Number(sanitized) : Number.NaN;
}
