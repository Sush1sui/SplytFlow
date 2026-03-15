const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_UTC_OFFSET_MINUTES = 14 * 60;

export const FLOAT_TOLERANCE = 1e-9;

export function normalizeUtcOffsetMinutes(offset?: number) {
  if (!Number.isFinite(offset)) return 0;
  return Math.max(
    -MAX_UTC_OFFSET_MINUTES,
    Math.min(MAX_UTC_OFFSET_MINUTES, Math.trunc(offset as number)),
  );
}

export function getDayBucketStartUtc(
  reference: Date,
  utcOffsetMinutes: number,
) {
  const offsetMs = utcOffsetMinutes * 60 * 1000;
  const localMs = reference.getTime() + offsetMs;
  const localDayStartMs = Math.floor(localMs / DAY_MS) * DAY_MS;
  return new Date(localDayStartMs - offsetMs);
}

export function getDayRangeFromBucketStart(startOfDay: Date) {
  return {
    startOfDay,
    endOfDay: new Date(startOfDay.getTime() + DAY_MS),
  };
}
