import { describe, expect, test } from "bun:test";
import {
  getDateValidationMessage,
  toUtcDay,
  toUtcFromLocalDateAndTimeZone,
} from "../../../utils";

describe("toUtcDay", () => {
  test("accepts valid date-only string", () => {
    expect(toUtcDay("2026-03-23").toISOString()).toBe(
      "2026-03-23T00:00:00.000Z",
    );
  });

  test("rejects invalid date format", () => {
    expect(() => toUtcDay("03/23/2026")).toThrow(
      "Invalid date format. Use YYYY-MM-DD",
    );
  });

  test("rejects invalid calendar date", () => {
    expect(() => toUtcDay("2023-02-29")).toThrow("Invalid calendar date");
  });

  test("normalizes Date input to UTC midnight", () => {
    const value = new Date("2026-03-23T19:45:00.000Z");
    expect(toUtcDay(value).toISOString()).toBe("2026-03-23T00:00:00.000Z");
  });
});

describe("toUtcFromLocalDateAndTimeZone", () => {
  test("converts local date in Asia/Manila to UTC", () => {
    expect(
      toUtcFromLocalDateAndTimeZone("2026-03-23", "Asia/Manila").toISOString(),
    ).toBe("2026-03-22T16:00:00.000Z");
  });

  test("converts local date in UTC to UTC midnight", () => {
    expect(
      toUtcFromLocalDateAndTimeZone("2026-03-23", "UTC").toISOString(),
    ).toBe("2026-03-23T00:00:00.000Z");
  });

  test("rejects invalid timezone", () => {
    expect(() =>
      toUtcFromLocalDateAndTimeZone("2026-03-23", "Not/AZone"),
    ).toThrow("Invalid timeZone");
  });
});

describe("getDateValidationMessage", () => {
  test("extracts date validation errors", () => {
    const message = getDateValidationMessage(
      new Error("Invalid timeZone. Use a valid IANA time zone"),
    );

    expect(message).toContain("Invalid timeZone");
  });

  test("ignores non-date errors", () => {
    const message = getDateValidationMessage(
      new Error("Database connection failed"),
    );

    expect(message).toBeNull();
  });
});
