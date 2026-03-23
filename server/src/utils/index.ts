export function runJobs(jobs: Array<() => Promise<void>>) {
  jobs.forEach((job) => {
    job().catch((error) => {
      console.error(
        "Error running job:",
        error instanceof Error ? error : new Error("An unknown error occurred"),
      );
    });
  });
}

export function removeHyphensAndReplaceWithWhitespace(str: string) {
  return str.replace(/-/g, " ");
}

export function capitalizeFirstLetter(str: string) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function capitalizeWords(str: string) {
  if (!str) return str;
  return str
    .split(" ")
    .map((word) => capitalizeFirstLetter(word))
    .join(" ");
}

export function getUtcMidnight(date = new Date()) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

const DATE_FORMAT_ERROR_MESSAGE =
  "Invalid date format. Use YYYY-MM-DD (example: 2026-03-23)";
const DATE_CALENDAR_ERROR_MESSAGE =
  "Invalid calendar date. Use a real date in YYYY-MM-DD format";
const TIME_ZONE_ERROR_MESSAGE =
  "Invalid timeZone. Use a valid IANA time zone (example: Asia/Manila)";

const DATE_VALIDATION_MESSAGE_PARTS = [
  "Invalid date format",
  "Invalid calendar date",
  "Invalid timeZone",
  "cannot be after",
];

const timeZoneFormatterCache = new Map<string, Intl.DateTimeFormat>();

function parseIsoDateOnly(value: string) {
  const date = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  if (!match) {
    throw new Error(DATE_FORMAT_ERROR_MESSAGE);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const parsed = new Date(Date.UTC(year, month - 1, day));

  // Prevent JS Date overflow behavior (e.g. 2023-02-29 -> 2023-03-01).
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error(DATE_CALENDAR_ERROR_MESSAGE);
  }

  return parsed;
}

function parseIsoDateParts(value: string) {
  const parsed = parseIsoDateOnly(value);

  return {
    year: parsed.getUTCFullYear(),
    month: parsed.getUTCMonth() + 1,
    day: parsed.getUTCDate(),
  };
}

function getTimeZoneFormatter(timeZone: string) {
  const cached = timeZoneFormatterCache.get(timeZone);
  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  timeZoneFormatterCache.set(timeZone, formatter);
  return formatter;
}

function getDatePartsInTimeZone(date: Date, timeZone: string) {
  const formatter = getTimeZoneFormatter(timeZone);
  const parts = formatter.formatToParts(date);

  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      map[part.type] = part.value;
    }
  }

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
  };
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const map = getDatePartsInTimeZone(date, timeZone);

  const asUtc = Date.UTC(
    map.year,
    map.month - 1,
    map.day,
    map.hour,
    map.minute,
    map.second,
  );

  return asUtc - date.getTime();
}

function padTwo(value: number): string {
  return String(value).padStart(2, "0");
}

export function getLocalDateStringInTimeZone(
  timeZone: string,
  date = new Date(),
) {
  assertValidTimeZone(timeZone);

  const parts = getDatePartsInTimeZone(date, timeZone);
  return `${parts.year}-${padTwo(parts.month)}-${padTwo(parts.day)}`;
}

export function assertValidTimeZone(timeZone: string) {
  try {
    Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
  } catch {
    throw new Error(TIME_ZONE_ERROR_MESSAGE);
  }
}

export function toUtcFromLocalDateAndTimeZone(
  localDate: string,
  timeZone: string,
) {
  const { year, month, day } = parseIsoDateParts(localDate);
  assertValidTimeZone(timeZone);

  const utcGuess = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
  const initialOffsetMs = getTimeZoneOffsetMs(new Date(utcGuess), timeZone);

  let utcTimestamp = utcGuess - initialOffsetMs;
  const adjustedOffsetMs = getTimeZoneOffsetMs(
    new Date(utcTimestamp),
    timeZone,
  );

  if (adjustedOffsetMs !== initialOffsetMs) {
    utcTimestamp = utcGuess - adjustedOffsetMs;
  }

  return new Date(utcTimestamp);
}

export function getDateValidationMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return null;
  }

  const isDateValidationError = DATE_VALIDATION_MESSAGE_PARTS.some((part) =>
    error.message.includes(part),
  );

  if (!isDateValidationError) {
    return null;
  }

  return error.message;
}

export function toUtcDay(date?: Date | string) {
  if (typeof date === "string") {
    // Contract: client sends local calendar day as YYYY-MM-DD.
    return parseIsoDateOnly(date);
  }

  return getUtcMidnight(date ?? new Date());
}
