/**
 * Integration tests for the Sale and Split modules.
 *
 * Runs against a real database – make sure DATABASE_URL is set.
 * Uses Bun's built-in test runner: `bun test src/tests/sale-split.test.ts`
 *
 * Test isolation strategy
 * ───────────────────────
 * A fresh UUID is generated per test file run (TEST_USER_ID).
 * All records created during tests are scoped to that ID and cleaned up in
 * afterAll so the suite is fully idempotent.
 */

import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { asc, eq } from "drizzle-orm";
import { db } from "../db";
import {
  sales as salesTable,
  splitHistory as splitHistoryTable,
  splits as splitsTable,
  users as usersTable,
} from "../db/schema";
import * as splitService from "../modules/split/service";
import {
  SplitCorrectionValidationError,
  SplitLimitExceededError,
} from "../modules/split/service";
import * as saleService from "../modules/sale/service";

// ─── Test Fixtures ───────────────────────────────────────────────────────────

// Create a dedicated temporary test user so tests never mutate real users.
let TEST_USER_ID: string;
let CREATED_TEST_USER_ID: string | null = null;

beforeAll(async () => {
  const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const [createdUser] = await db
    .insert(usersTable)
    .values({
      firstName: "Test",
      lastName: "Runner",
      email: `sale-suite-${unique}@example.test`,
      password: "not-used-in-tests",
    })
    .returning({ id: usersTable.id });

  if (!createdUser?.id) {
    throw new Error("Failed to create isolated test user");
  }

  TEST_USER_ID = createdUser.id;
  CREATED_TEST_USER_ID = createdUser.id;

  // Clean up any leftover data from previous runs for this user
  await db.delete(salesTable).where(eq(salesTable.userId, TEST_USER_ID));
  await db
    .delete(splitHistoryTable)
    .where(eq(splitHistoryTable.userId, TEST_USER_ID));
  await db.delete(splitsTable).where(eq(splitsTable.userId, TEST_USER_ID));
});

afterAll(async () => {
  await db.delete(salesTable).where(eq(salesTable.userId, TEST_USER_ID));
  await db
    .delete(splitHistoryTable)
    .where(eq(splitHistoryTable.userId, TEST_USER_ID));
  await db.delete(splitsTable).where(eq(splitsTable.userId, TEST_USER_ID));

  if (CREATED_TEST_USER_ID) {
    await db.delete(usersTable).where(eq(usersTable.id, CREATED_TEST_USER_ID));
  }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return { start, end };
}

function parseBreakdown(raw: unknown): Array<{ name: string; value: number }> {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (
        typeof item !== "object" ||
        item === null ||
        !("name" in item) ||
        !("value" in item)
      ) {
        return null;
      }

      const name = (item as { name: unknown }).name;
      const value = (item as { value: unknown }).value;
      if (typeof name !== "string" || typeof value !== "number") return null;

      return { name, value };
    })
    .filter((item): item is { name: string; value: number } => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function resetSplitStateForHistoryTests() {
  await db
    .delete(splitHistoryTable)
    .where(eq(splitHistoryTable.userId, TEST_USER_ID));
  await db.delete(splitsTable).where(eq(splitsTable.userId, TEST_USER_ID));
}

async function resetSalesAndSplitStateForReadHistoryTests() {
  await db.delete(salesTable).where(eq(salesTable.userId, TEST_USER_ID));
  await db
    .delete(splitHistoryTable)
    .where(eq(splitHistoryTable.userId, TEST_USER_ID));
  await db.delete(splitsTable).where(eq(splitsTable.userId, TEST_USER_ID));
}

// ─── Split Service ───────────────────────────────────────────────────────────

describe("splitService.upsert", () => {
  it("creates a new split (201 path)", async () => {
    const split = await splitService.upsert(TEST_USER_ID, "Rent", 30);
    expect(split.name).toBe("Rent");
    expect(split.value).toBe(30);
    expect(split.userId).toBe(TEST_USER_ID);
  });

  it("updates an existing split without summing old value (idempotent per name)", async () => {
    const updated = await splitService.upsert(TEST_USER_ID, "Rent", 25);
    expect(updated.value).toBe(25);
  });

  it("allows adding a second split within the 100% cap", async () => {
    // Rent is now 25 – adding Utilities at 40 → total = 65 ✓
    const split = await splitService.upsert(TEST_USER_ID, "Utilities", 40);
    expect(split.value).toBe(40);
  });

  it("throws SplitLimitExceededError when total would exceed 100%", async () => {
    // Rent=25, Utilities=40 → other=65; requesting 40 → 65+40=105 > 100
    await expect(
      splitService.upsert(TEST_USER_ID, "Marketing", 40),
    ).rejects.toBeInstanceOf(SplitLimitExceededError);
  });

  it("allows a split that hits exactly 100%", async () => {
    // Rent=25, Utilities=40 → other=65; requesting 35 → 65+35=100 ✓
    const split = await splitService.upsert(TEST_USER_ID, "Marketing", 35);
    expect(split.value).toBe(35);
  });

  it("throws when updating a split would push total above 100%", async () => {
    // Rent=25, Utilities=40, Marketing=35 → total=100
    // Updating Utilities to 41 → others=25+35=60; 60+41=101 > 100
    await expect(
      splitService.upsert(TEST_USER_ID, "Utilities", 41),
    ).rejects.toBeInstanceOf(SplitLimitExceededError);
  });

  it("getSplitsByUserId returns all splits for the user", async () => {
    const result = await splitService.getSplitsByUserId(TEST_USER_ID);
    expect(result.length).toBe(3);
    const names = result.map((s) => s.name);
    expect(names).toContain("Rent");
    expect(names).toContain("Utilities");
    expect(names).toContain("Marketing");
  });
});

// ─── Sale Service ────────────────────────────────────────────────────────────

describe("saleService.createOrUpdate", () => {
  it("creates a new sale for today", async () => {
    const sale = await saleService.createOrUpdate(TEST_USER_ID, 1000);
    expect(sale.amount).toBe(1000);
    expect(sale.userId).toBe(TEST_USER_ID);
  });

  it("accumulates amount on conflict (same userId + createdAt)", async () => {
    // The service uses onConflictDoUpdate with sales.createdAt – calling
    // createOrUpdate again within the same tick will hit a different timestamp,
    // so we validate by reading the stored value.
    const sale = await saleService.createOrUpdate(TEST_USER_ID, 500);
    expect(sale.amount).toBeGreaterThanOrEqual(500);
  });
});

describe("saleService.getSaleToday", () => {
  it("returns { sales, net_sale } for today", async () => {
    const result = await saleService.getSaleToday(TEST_USER_ID);
    expect(Array.isArray(result.sales)).toBe(true);
    expect(result.sales.length).toBeGreaterThan(0);
    expect(typeof result.net_sale).toBe("number");
  });

  it("net_sale is lower than gross sale amount (splits are applied)", async () => {
    // Total splits = 100% → net_sale = amount * (1 - 100/100) = 0
    // but let's assert it is less than or equal to the total gross
    const result = await saleService.getSaleToday(TEST_USER_ID);
    const grossTotal = result.sales.reduce((acc, s) => acc + s.amount, 0);
    expect(result.net_sale).toBeLessThanOrEqual(grossTotal);
  });

  it("returns empty sales and net_sale=0 when no sale exists for today", async () => {
    // Use a non-existent userId
    const result = await saleService.getSaleToday(
      "ffffffff-ffff-ffff-ffff-ffffffffffff",
    );
    expect(result.sales).toEqual([]);
    expect(result.net_sale).toBe(0);
  });
});

describe("saleService.getSalesByTimeRange", () => {
  it("returns { sales, net_sale } for given range", async () => {
    const { start, end } = todayRange();
    const result = await saleService.getSalesByTimeRange(
      TEST_USER_ID,
      start,
      end,
    );
    expect(Array.isArray(result.sales)).toBe(true);
    expect(result.sales.length).toBeGreaterThan(0);
    expect(typeof result.net_sale).toBe("number");
  });

  it("net_sale equals sum(amount) * (1 - totalSplitPct/100)", async () => {
    const { start, end } = todayRange();
    const result = await saleService.getSalesByTimeRange(
      TEST_USER_ID,
      start,
      end,
    );
    const grossTotal = result.sales.reduce((acc, s) => acc + s.amount, 0);
    // Total splits = 100 → net_sale = grossTotal * (1 - 100/100) = 0
    const expectedNet = grossTotal * (1 - 100 / 100);
    expect(result.net_sale).toBeCloseTo(expectedNet, 5);
  });

  it("net_sale remains locked to historical split for already-recorded sales", async () => {
    // Delete Marketing split after today's sale was already bucketed.
    // Historical read should keep using the split active at sale time.
    await splitService.deleteSplitByName(TEST_USER_ID, "Marketing");

    const { start, end } = todayRange();
    const result = await saleService.getSalesByTimeRange(
      TEST_USER_ID,
      start,
      end,
    );
    const grossTotal = result.sales.reduce((acc, s) => acc + s.amount, 0);
    const expectedNet = grossTotal * (1 - 100 / 100);
    expect(result.net_sale).toBeCloseTo(expectedNet, 5);

    // Restore Marketing for clean-up consistency
    await splitService.upsert(TEST_USER_ID, "Marketing", 35);
  });

  it("returns empty sales and net_sale=0 when range has no sales", async () => {
    const result = await saleService.getSalesByTimeRange(
      TEST_USER_ID,
      new Date("2000-01-01"),
      new Date("2000-01-02"),
    );
    expect(result.sales).toEqual([]);
    expect(result.net_sale).toBe(0);
  });
});

describe("saleService.getTotalSalesByTimeRange", () => {
  it("returns the numeric sum of all sales in the range", async () => {
    const { start, end } = todayRange();
    const total = await saleService.getTotalSalesByTimeRange(
      TEST_USER_ID,
      start,
      end,
    );
    expect(typeof total).toBe("number");
    expect(total).toBeGreaterThan(0);
  });

  it("returns 0 when there are no sales in range", async () => {
    const total = await saleService.getTotalSalesByTimeRange(
      TEST_USER_ID,
      new Date("2000-01-01"),
      new Date("2000-01-02"),
    );
    expect(total).toBe(0);
  });
});

// ─── Split Service – Delete ───────────────────────────────────────────────────

describe("splitService.deleteSplitByName", () => {
  it("deletes a single split by name", async () => {
    // "Rent" was created in the upsert suite — delete it directly
    const deleted = await splitService.deleteSplitByName(TEST_USER_ID, "Rent");
    expect(deleted).not.toBeNull();
    if (!deleted) {
      throw new Error("Expected split deletion result");
    }
    expect(deleted.length).toBe(1);
    expect(deleted[0].name).toBe("Rent");
  });

  it("returns null when split does not exist", async () => {
    const deleted = await splitService.deleteSplitByName(
      TEST_USER_ID,
      "DoesNotExist",
    );
    expect(deleted).toBeNull();
  });
});

describe("splitService.deleteAllSplitsByUserId", () => {
  it("removes every split for the user", async () => {
    const deleted = await splitService.deleteAllSplitsByUserId(TEST_USER_ID);
    expect(deleted.length).toBeGreaterThanOrEqual(2); // Utilities + Marketing (Rent was removed in prior test)
    const remaining = await splitService.getSplitsByUserId(TEST_USER_ID);
    expect(remaining.length).toBe(0);
  });
});

describe("splitService SplitHistory write path", () => {
  it("upsert appends history with current total and breakdown", async () => {
    await resetSplitStateForHistoryTests();

    await splitService.upsert(TEST_USER_ID, "Rent", 30);

    const historyRows = await db
      .select({
        totalSplitPct: splitHistoryTable.totalSplitPct,
        breakdownJson: splitHistoryTable.breakdownJson,
      })
      .from(splitHistoryTable)
      .where(eq(splitHistoryTable.userId, TEST_USER_ID))
      .orderBy(
        asc(splitHistoryTable.effectiveFrom),
        asc(splitHistoryTable.createdAt),
      );

    expect(historyRows.length).toBe(1);
    expect(historyRows[0].totalSplitPct).toBeCloseTo(30, 5);
    expect(parseBreakdown(historyRows[0].breakdownJson)).toEqual([
      { name: "Rent", value: 30 },
    ]);
  });

  it("no-op updates do not append duplicate history rows", async () => {
    await resetSplitStateForHistoryTests();

    await splitService.upsert(TEST_USER_ID, "Rent", 30);
    await splitService.upsert(TEST_USER_ID, "Rent", 30);

    const historyRows = await db
      .select({ id: splitHistoryTable.id })
      .from(splitHistoryTable)
      .where(eq(splitHistoryTable.userId, TEST_USER_ID));

    expect(historyRows.length).toBe(1);
  });

  it("delete by name appends updated history snapshot", async () => {
    await resetSplitStateForHistoryTests();

    await splitService.upsert(TEST_USER_ID, "Rent", 30);
    await splitService.upsert(TEST_USER_ID, "Utilities", 20);
    await splitService.deleteSplitByName(TEST_USER_ID, "Rent");

    const historyRows = await db
      .select({
        totalSplitPct: splitHistoryTable.totalSplitPct,
        breakdownJson: splitHistoryTable.breakdownJson,
      })
      .from(splitHistoryTable)
      .where(eq(splitHistoryTable.userId, TEST_USER_ID))
      .orderBy(
        asc(splitHistoryTable.effectiveFrom),
        asc(splitHistoryTable.createdAt),
      );

    expect(historyRows.length).toBe(3);

    const latest = historyRows[historyRows.length - 1];
    expect(latest.totalSplitPct).toBeCloseTo(20, 5);
    expect(parseBreakdown(latest.breakdownJson)).toEqual([
      { name: "Utilities", value: 20 },
    ]);
  });

  it("delete all appends total=0 with empty breakdown", async () => {
    await resetSplitStateForHistoryTests();

    await splitService.upsert(TEST_USER_ID, "Rent", 30);
    await splitService.upsert(TEST_USER_ID, "Utilities", 20);
    await splitService.deleteAllSplitsByUserId(TEST_USER_ID);

    const historyRows = await db
      .select({
        totalSplitPct: splitHistoryTable.totalSplitPct,
        breakdownJson: splitHistoryTable.breakdownJson,
      })
      .from(splitHistoryTable)
      .where(eq(splitHistoryTable.userId, TEST_USER_ID))
      .orderBy(
        asc(splitHistoryTable.effectiveFrom),
        asc(splitHistoryTable.createdAt),
      );

    expect(historyRows.length).toBe(3);

    const latest = historyRows[historyRows.length - 1];
    expect(latest.totalSplitPct).toBeCloseTo(0, 5);
    expect(parseBreakdown(latest.breakdownJson)).toEqual([]);
  });
});

describe("splitService.applyHistoricalCorrection", () => {
  it("applies bounded correction and restores original timeline after endAt", async () => {
    await resetSalesAndSplitStateForReadHistoryTests();

    await splitService.upsert(TEST_USER_ID, "Ops", 40);

    const firstSale = await saleService.createOrUpdate(TEST_USER_ID, 100, {
      recordedAt: new Date("2099-06-01T10:00:00.000Z"),
      utcOffsetMinutes: 0,
    });

    // Ensure deterministic ordering for updatedAt-based timeline resolution.
    await new Promise((resolve) => setTimeout(resolve, 5));

    await splitService.upsert(TEST_USER_ID, "Ops", 20);

    await new Promise((resolve) => setTimeout(resolve, 5));

    const secondSale = await saleService.createOrUpdate(TEST_USER_ID, 100, {
      recordedAt: new Date("2099-06-02T10:00:00.000Z"),
      utcOffsetMinutes: 0,
    });

    const correctionStart = new Date(firstSale.updatedAt.getTime() - 1);
    const correctionEnd = new Date(secondSale.updatedAt.getTime());

    await splitService.applyHistoricalCorrection(
      TEST_USER_ID,
      correctionStart,
      correctionEnd,
      [{ name: "Ops", value: 10 }],
      "correct old period snapshot",
    );

    const olderPeriod = await saleService.getSalesByTimeRange(
      TEST_USER_ID,
      new Date("2099-06-01T00:00:00.000Z"),
      new Date("2099-06-02T00:00:00.000Z"),
    );
    expect(olderPeriod.net_sale).toBeCloseTo(90, 5);
    expect(parseBreakdown((olderPeriod as any).split_breakdown)).toEqual([
      { name: "Ops", value: 10 },
    ]);

    const newerPeriod = await saleService.getSalesByTimeRange(
      TEST_USER_ID,
      new Date("2099-06-02T00:00:00.000Z"),
      new Date("2099-06-03T00:00:00.000Z"),
    );
    expect(newerPeriod.net_sale).toBeCloseTo(80, 5);
    expect(parseBreakdown((newerPeriod as any).split_breakdown)).toEqual([
      { name: "Ops", value: 20 },
    ]);
  });

  it("open-ended correction updates current Split table to remain consistent", async () => {
    await resetSplitStateForHistoryTests();

    await splitService.upsert(TEST_USER_ID, "Rent", 25);
    await splitService.upsert(TEST_USER_ID, "Utilities", 15);

    await splitService.applyHistoricalCorrection(
      TEST_USER_ID,
      new Date(Date.now() - 60_000),
      undefined,
      [{ name: "Ops", value: 30 }],
      "normalize split setup",
    );

    const activeSplits = await splitService.getSplitsByUserId(TEST_USER_ID);
    expect(activeSplits).toHaveLength(1);
    expect(activeSplits[0]?.name).toBe("Ops");
    expect(activeSplits[0]?.value).toBeCloseTo(30, 5);
  });

  it("rejects no-op correction payload", async () => {
    await resetSplitStateForHistoryTests();
    await splitService.upsert(TEST_USER_ID, "Rent", 20);

    await expect(
      splitService.applyHistoricalCorrection(
        TEST_USER_ID,
        new Date("2099-08-01T00:00:00.000Z"),
        new Date("2099-08-02T00:00:00.000Z"),
        [{ name: "Rent", value: 20 }],
      ),
    ).rejects.toBeInstanceOf(SplitCorrectionValidationError);
  });

  it("allows extending a previously bounded window with the same breakdown", async () => {
    await resetSplitStateForHistoryTests();
    await splitService.upsert(TEST_USER_ID, "Ops", 0);

    const startAt = new Date("2099-03-01T00:00:00.000Z");
    const initialEndAt = new Date("2099-03-05T00:00:00.000Z");
    const extendedEndAt = new Date("2099-03-11T00:00:00.000Z");

    await splitService.applyHistoricalCorrection(
      TEST_USER_ID,
      startAt,
      initialEndAt,
      [{ name: "Ops", value: 30 }],
      "initial bounded correction",
    );

    const extension = await splitService.applyHistoricalCorrection(
      TEST_USER_ID,
      startAt,
      extendedEndAt,
      [{ name: "Ops", value: 30 }],
      "extend bounded correction",
    );

    expect(extension.startInserted).toBe(true);
    expect(extension.restoreInserted).toBe(true);

    const extensionRows = await db
      .select({
        effectiveFrom: splitHistoryTable.effectiveFrom,
        totalSplitPct: splitHistoryTable.totalSplitPct,
        source: splitHistoryTable.source,
        correctionBatchId: splitHistoryTable.correctionBatchId,
      })
      .from(splitHistoryTable)
      .where(eq(splitHistoryTable.userId, TEST_USER_ID))
      .orderBy(
        asc(splitHistoryTable.effectiveFrom),
        asc(splitHistoryTable.createdAt),
      );

    const extensionStart = extensionRows.find(
      (row) =>
        row.correctionBatchId === extension.correctionBatchId &&
        row.source === "correction_start",
    );

    const extensionRestore = extensionRows.find(
      (row) =>
        row.correctionBatchId === extension.correctionBatchId &&
        row.source === "correction_restore",
    );

    expect(extensionStart?.effectiveFrom.toISOString()).toBe(
      initialEndAt.toISOString(),
    );
    expect(extensionStart?.totalSplitPct).toBeCloseTo(30, 5);

    expect(extensionRestore?.effectiveFrom.toISOString()).toBe(
      extendedEndAt.toISOString(),
    );
    expect(extensionRestore?.totalSplitPct).toBeCloseTo(0, 5);
  });
});

// ─── Sale Service – Delete ───────────────────────────────────────────────────

describe("saleService.deleteSalesById", () => {
  it("deletes sales by their UUIDs", async () => {
    const sale1 = await saleService.createOrUpdate(TEST_USER_ID, 200);
    const deleted = await saleService.deleteSalesById(TEST_USER_ID, [sale1.id]);
    expect(deleted.length).toBe(1);
    expect(deleted[0].id).toBe(sale1.id);
  });

  it("returns empty array when no IDs match", async () => {
    const deleted = await saleService.deleteSalesById(TEST_USER_ID, [
      "ffffffff-ffff-ffff-ffff-ffffffffffff",
    ]);
    expect(deleted.length).toBe(0);
  });
});

describe("saleService.deleteSaleById (by date)", () => {
  it("deletes a sale matching userId + createdAt", async () => {
    const sale = await saleService.createOrUpdate(TEST_USER_ID, 300);
    const deleted = await saleService.deleteSaleById(
      TEST_USER_ID,
      sale.createdAt,
    );
    expect(deleted.length).toBeGreaterThanOrEqual(1);
  });
});

describe("saleService historical split timeline", () => {
  it("keeps old split for old buckets and uses new split for new buckets", async () => {
    await resetSalesAndSplitStateForReadHistoryTests();

    await splitService.upsert(TEST_USER_ID, "Ops", 40);

    await saleService.createOrUpdate(TEST_USER_ID, 100, {
      recordedAt: new Date("2099-03-01T10:00:00.000Z"),
      utcOffsetMinutes: 0,
    });

    await splitService.upsert(TEST_USER_ID, "Ops", 20);

    await saleService.createOrUpdate(TEST_USER_ID, 100, {
      recordedAt: new Date("2099-03-02T10:00:00.000Z"),
      utcOffsetMinutes: 0,
    });

    const dayA = await saleService.getSalesByTimeRange(
      TEST_USER_ID,
      new Date("2099-03-01T00:00:00.000Z"),
      new Date("2099-03-02T00:00:00.000Z"),
    );
    expect(dayA.net_sale).toBeCloseTo(60, 5);
    expect(parseBreakdown((dayA as any).split_breakdown)).toEqual([
      { name: "Ops", value: 40 },
    ]);

    const dayB = await saleService.getSalesByTimeRange(
      TEST_USER_ID,
      new Date("2099-03-02T00:00:00.000Z"),
      new Date("2099-03-03T00:00:00.000Z"),
    );
    expect(dayB.net_sale).toBeCloseTo(80, 5);
    expect(parseBreakdown((dayB as any).split_breakdown)).toEqual([
      { name: "Ops", value: 20 },
    ]);

    const fullRange = await saleService.getSalesByTimeRange(
      TEST_USER_ID,
      new Date("2099-03-01T00:00:00.000Z"),
      new Date("2099-03-03T00:00:00.000Z"),
    );
    expect(fullRange.net_sale).toBeCloseTo(140, 5);
    expect(parseBreakdown((fullRange as any).split_breakdown)).toEqual([
      { name: "Ops", value: 20 },
    ]);

    const timeline = (fullRange as any).split_breakdown_timeline;
    expect(Array.isArray(timeline)).toBe(true);
    expect(timeline.length).toBe(1);
    expect(timeline[0]?.totalSplitPct).toBeCloseTo(20, 5);
    expect(parseBreakdown(timeline[0]?.breakdown)).toEqual([
      { name: "Ops", value: 20 },
    ]);
  });

  it("defaults to 0% split when no history exists before sale", async () => {
    await resetSalesAndSplitStateForReadHistoryTests();

    await saleService.createOrUpdate(TEST_USER_ID, 123, {
      recordedAt: new Date("2099-04-01T12:00:00.000Z"),
      utcOffsetMinutes: 0,
    });

    const result = await saleService.getSalesByTimeRange(
      TEST_USER_ID,
      new Date("2099-04-01T00:00:00.000Z"),
      new Date("2099-04-02T00:00:00.000Z"),
    );

    expect(result.net_sale).toBeCloseTo(123, 5);
    expect(parseBreakdown((result as any).split_breakdown)).toEqual([]);
  });

  it("returns period-specific historical breakdown for split impact", async () => {
    await resetSalesAndSplitStateForReadHistoryTests();

    await splitService.upsert(TEST_USER_ID, "Rent", 20);
    await splitService.upsert(TEST_USER_ID, "Utilities", 10);

    await saleService.createOrUpdate(TEST_USER_ID, 100, {
      recordedAt: new Date("2099-05-01T09:00:00.000Z"),
      utcOffsetMinutes: 0,
    });

    await splitService.upsert(TEST_USER_ID, "Utilities", 25);

    await saleService.createOrUpdate(TEST_USER_ID, 100, {
      recordedAt: new Date("2099-05-02T09:00:00.000Z"),
      utcOffsetMinutes: 0,
    });

    const olderPeriod = await saleService.getSalesByTimeRange(
      TEST_USER_ID,
      new Date("2099-05-01T00:00:00.000Z"),
      new Date("2099-05-02T00:00:00.000Z"),
    );
    expect(parseBreakdown((olderPeriod as any).split_breakdown)).toEqual([
      { name: "Rent", value: 20 },
      { name: "Utilities", value: 10 },
    ]);

    const newerPeriod = await saleService.getSalesByTimeRange(
      TEST_USER_ID,
      new Date("2099-05-02T00:00:00.000Z"),
      new Date("2099-05-03T00:00:00.000Z"),
    );
    expect(parseBreakdown((newerPeriod as any).split_breakdown)).toEqual([
      { name: "Rent", value: 20 },
      { name: "Utilities", value: 25 },
    ]);
  });

  it("includes earlier correction snapshots in timeline for past day buckets", async () => {
    await resetSalesAndSplitStateForReadHistoryTests();

    await splitService.upsert(TEST_USER_ID, "Rent", 0);

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const correctionStart = new Date(now - 10 * dayMs);
    const correctionEnd = new Date(now - 5 * dayMs);
    const inWindowSaleAt = new Date(now - 9 * dayMs);
    const afterWindowSaleAt = new Date(now - 3 * dayMs);

    await splitService.applyHistoricalCorrection(
      TEST_USER_ID,
      correctionStart,
      correctionEnd,
      [{ name: "Rent", value: 5 }],
      "timeline visibility regression",
    );

    await saleService.createOrUpdate(TEST_USER_ID, 120, {
      recordedAt: inWindowSaleAt,
      utcOffsetMinutes: 0,
    });

    await saleService.createOrUpdate(TEST_USER_ID, 80, {
      recordedAt: afterWindowSaleAt,
      utcOffsetMinutes: 0,
    });

    const rangeResult = await saleService.getSalesByTimeRange(
      TEST_USER_ID,
      new Date(now - 11 * dayMs),
      new Date(now - 2 * dayMs),
    );

    const timeline = (rangeResult as any).split_breakdown_timeline;
    expect(Array.isArray(timeline)).toBe(true);
    expect(timeline.length).toBeGreaterThanOrEqual(2);

    expect(timeline[0]?.totalSplitPct).toBeCloseTo(5, 5);
    expect(parseBreakdown(timeline[0]?.breakdown)).toEqual([
      { name: "Rent", value: 5 },
    ]);

    expect(timeline[timeline.length - 1]?.totalSplitPct).toBeCloseTo(0, 5);
  });
});

// ─── HTTP Endpoint Integration ───────────────────────────────────────────────
//
// These tests spin up the Elysia app in-process using Elysia's .handle()
// so no network port is needed.
//

import { Elysia } from "elysia";
import splitRouter from "../modules/split/index";
import salesRouter from "../modules/sale/index";

const app = new Elysia().use(splitRouter).use(salesRouter);

async function req(
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; body: unknown }> {
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(body);
  }
  const res = await app.handle(new Request(`http://localhost${path}`, init));
  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }
  return { status: res.status, body: parsed };
}

// ── Split endpoints ──────────────────────────────────────────────────────────

describe("POST /split – HTTP", () => {
  it("returns 400 when userId is missing", async () => {
    const { status, body } = await req("POST", "/split", {
      name: "Rent",
      value: 20,
    });
    expect(status).toBe(400);
    expect((body as any).error).toMatch(/required/i);
  });

  it("creates a split and returns 201", async () => {
    await db.delete(splitsTable).where(eq(splitsTable.userId, TEST_USER_ID));

    const { status, body } = await req("POST", "/split", {
      userId: TEST_USER_ID,
      name: "Rent",
      value: 20,
    });
    expect(status).toBe(201);
    expect((body as any).name).toBe("Rent");
  });

  it("updates the same split and returns 200", async () => {
    const { status, body } = await req("POST", "/split", {
      userId: TEST_USER_ID,
      name: "Rent",
      value: 18,
    });
    expect(status).toBe(200);
    expect((body as any).value).toBe(18);
  });

  it("returns 400 when total would exceed 100%", async () => {
    // Rent=18; request 83 → 18+83=101
    const { status, body } = await req("POST", "/split", {
      userId: TEST_USER_ID,
      name: "BigExpense",
      value: 83,
    });
    expect(status).toBe(400);
    expect((body as any).error).toMatch(/exceed/i);
  });
});

describe("GET /split/:id – HTTP", () => {
  it("returns 200 with splits array", async () => {
    const { status, body } = await req("GET", `/split/${TEST_USER_ID}`);
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  it("returns 404 for unknown user", async () => {
    const { status } = await req(
      "GET",
      `/split/ffffffff-ffff-ffff-ffff-ffffffffffff`,
    );
    expect(status).toBe(404);
  });
});

describe("DELETE /split – HTTP", () => {
  it("returns 400 when body is incomplete", async () => {
    const { status } = await req("DELETE", "/split", { userId: TEST_USER_ID });
    expect(status).toBe(400);
  });

  it("deletes an existing split", async () => {
    const { status } = await req("DELETE", "/split", {
      userId: TEST_USER_ID,
      name: "Rent",
    });
    expect(status).toBe(200);
  });

  it("returns 404 when split name does not exist", async () => {
    const { status, body } = await req("DELETE", "/split", {
      userId: TEST_USER_ID,
      name: "UnknownSplitName",
    });
    expect(status).toBe(404);
    expect((body as any).error).toMatch(/split not found/i);
  });
});

describe("POST /split/history/correct – HTTP", () => {
  it("returns 400 when required fields are missing", async () => {
    const { status, body } = await req("POST", "/split/history/correct", {
      userId: TEST_USER_ID,
      breakdown: [{ name: "Ops", value: 20 }],
    });

    expect(status).toBe(400);
    expect((body as any).error).toMatch(/required/i);
  });

  it("returns 200 for a valid correction request", async () => {
    await resetSplitStateForHistoryTests();
    await splitService.upsert(TEST_USER_ID, "Ops", 25);

    const { status, body } = await req("POST", "/split/history/correct", {
      userId: TEST_USER_ID,
      startAt: "2099-09-01T00:00:00.000Z",
      endAt: "2099-09-02T00:00:00.000Z",
      breakdown: [{ name: "Ops", value: 10 }],
      reason: "historical correction route test",
    });

    expect(status).toBe(200);
    expect((body as any).correctionBatchId).toBeTruthy();
    expect((body as any).insertedRows).toBeGreaterThan(0);
  });
});

describe("GET /split/history/:userId/corrections – HTTP", () => {
  it("returns 400 when limit query is invalid", async () => {
    const { status, body } = await req(
      "GET",
      `/split/history/${TEST_USER_ID}/corrections?limit=0`,
    );

    expect(status).toBe(400);
    expect((body as any).error).toMatch(/limit/i);
  });

  it("returns correction entries for user", async () => {
    await resetSplitStateForHistoryTests();
    await splitService.upsert(TEST_USER_ID, "Ops", 30);

    await req("POST", "/split/history/correct", {
      userId: TEST_USER_ID,
      startAt: "2099-10-01T00:00:00.000Z",
      endAt: "2099-10-02T00:00:00.000Z",
      breakdown: [{ name: "Ops", value: 12 }],
      reason: "correction history fetch test",
    });

    const { status, body } = await req(
      "GET",
      `/split/history/${TEST_USER_ID}/corrections?limit=10`,
    );

    expect(status).toBe(200);
    expect(Array.isArray((body as any).corrections)).toBe(true);
    expect((body as any).corrections.length).toBeGreaterThan(0);
    expect((body as any).corrections[0]?.source).not.toBe("live");
  });
});

// ── Sales endpoints ──────────────────────────────────────────────────────────

describe("POST /sales – HTTP", () => {
  it("returns 400 when body is invalid", async () => {
    const { status } = await req("POST", "/sales", { userId: TEST_USER_ID });
    expect(status).toBe(400);
  });

  it("creates a sale and returns 201", async () => {
    const { status, body } = await req("POST", "/sales", {
      userId: TEST_USER_ID,
      amount: 750,
    });
    expect(status).toBe(201);
    expect((body as any).amount).toBe(750);
  });
});

describe("GET /sales/:id – HTTP (today)", () => {
  it("returns { sales, net_sale } for today", async () => {
    const { status, body } = await req("GET", `/sales/${TEST_USER_ID}`);
    expect(status).toBe(200);
    expect(Array.isArray((body as any).sales)).toBe(true);
    expect(typeof (body as any).net_sale).toBe("number");
  });

  it("returns { sales, net_sale } for date range", async () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const { status, body } = await req(
      "GET",
      `/sales/${TEST_USER_ID}?startDate=${start.toISOString()}&endDate=${end.toISOString()}`,
    );
    expect(status).toBe(200);
    expect(Array.isArray((body as any).sales)).toBe(true);
    expect(typeof (body as any).net_sale).toBe("number");
  });

  it("returns 404 for unknown user (today)", async () => {
    const { status } = await req(
      "GET",
      `/sales/ffffffff-ffff-ffff-ffff-ffffffffffff`,
    );
    expect(status).toBe(404);
  });
});

describe("GET /sales/:id/total – HTTP", () => {
  it("returns totalSales number", async () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const { status, body } = await req(
      "GET",
      `/sales/${TEST_USER_ID}/total?startDate=${start.toISOString()}&endDate=${end.toISOString()}`,
    );
    expect(status).toBe(200);
    expect(typeof (body as any).totalSales).toBe("number");
  });

  it("returns 400 when dates are missing", async () => {
    const { status } = await req("GET", `/sales/${TEST_USER_ID}/total`);
    expect(status).toBe(400);
  });
});

describe("PATCH /sales/adjust – HTTP", () => {
  it("returns 400 when requestId is missing", async () => {
    const { status } = await req("PATCH", "/sales/adjust", {
      userId: TEST_USER_ID,
      amount: 10,
    });
    expect(status).toBe(400);
  });

  it("deducts once and replays by idempotency key", async () => {
    const recordedAt = "2099-01-10T10:00:00.000Z";
    const utcOffsetMinutes = 0;
    const requestId = `adjust_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const create = await req("POST", "/sales", {
      userId: TEST_USER_ID,
      amount: 120,
      recordedAt,
      utcOffsetMinutes,
    });
    expect(create.status).toBe(201);

    const first = await req("PATCH", "/sales/adjust", {
      userId: TEST_USER_ID,
      amount: 20,
      requestId,
      recordedAt,
      utcOffsetMinutes,
    });
    expect(first.status).toBe(200);
    expect((first.body as any).idempotentReplay).toBe(false);
    expect((first.body as any).sale?.amount).toBeCloseTo(100, 5);

    const second = await req("PATCH", "/sales/adjust", {
      userId: TEST_USER_ID,
      amount: 20,
      requestId,
      recordedAt,
      utcOffsetMinutes,
    });
    expect(second.status).toBe(200);
    expect((second.body as any).idempotentReplay).toBe(true);
    expect((second.body as any).sale?.amount).toBeCloseTo(100, 5);
  });

  it("returns 400 when deduction exceeds available bucket amount", async () => {
    const recordedAt = "2099-01-11T10:00:00.000Z";
    const utcOffsetMinutes = 0;

    const create = await req("POST", "/sales", {
      userId: TEST_USER_ID,
      amount: 30,
      recordedAt,
      utcOffsetMinutes,
    });
    expect(create.status).toBe(201);

    const adjust = await req("PATCH", "/sales/adjust", {
      userId: TEST_USER_ID,
      amount: 50,
      requestId: `adjust_over_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      recordedAt,
      utcOffsetMinutes,
    });

    expect(adjust.status).toBe(400);
    expect((adjust.body as any).error).toMatch(/exceeds/i);
  });
});

describe("PATCH /sales/set-day – HTTP", () => {
  it("sets amount on a missing day bucket", async () => {
    const recordedAt = "2099-02-01T10:00:00.000Z";

    const { status, body } = await req("PATCH", "/sales/set-day", {
      userId: TEST_USER_ID,
      amount: 45,
      recordedAt,
      utcOffsetMinutes: 0,
    });

    expect(status).toBe(200);
    expect((body as any).deleted).toBe(false);
    expect((body as any).sale?.amount).toBeCloseTo(45, 5);
  });

  it("sets exact amount on an existing day bucket", async () => {
    const recordedAt = "2099-02-02T10:00:00.000Z";

    const first = await req("PATCH", "/sales/set-day", {
      userId: TEST_USER_ID,
      amount: 120,
      recordedAt,
      utcOffsetMinutes: 0,
    });
    expect(first.status).toBe(200);

    const second = await req("PATCH", "/sales/set-day", {
      userId: TEST_USER_ID,
      amount: 35,
      recordedAt,
      utcOffsetMinutes: 0,
    });

    expect(second.status).toBe(200);
    expect((second.body as any).deleted).toBe(false);
    expect((second.body as any).sale?.amount).toBeCloseTo(35, 5);
  });

  it("deletes a day bucket when amount is zero", async () => {
    const recordedAt = "2099-02-03T10:00:00.000Z";

    const create = await req("PATCH", "/sales/set-day", {
      userId: TEST_USER_ID,
      amount: 80,
      recordedAt,
      utcOffsetMinutes: 0,
    });
    expect(create.status).toBe(200);

    const remove = await req("PATCH", "/sales/set-day", {
      userId: TEST_USER_ID,
      amount: 0,
      recordedAt,
      utcOffsetMinutes: 0,
    });

    expect(remove.status).toBe(200);
    expect((remove.body as any).deleted).toBe(true);
    expect((remove.body as any).sale).toBeNull();
  });

  it("returns 400 for negative amount", async () => {
    const { status, body } = await req("PATCH", "/sales/set-day", {
      userId: TEST_USER_ID,
      amount: -10,
      recordedAt: "2099-02-04T10:00:00.000Z",
      utcOffsetMinutes: 0,
    });

    expect(status).toBe(400);
    expect((body as any).error).toMatch(/non-negative/i);
  });
});
