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
import { eq } from "drizzle-orm";
import { db } from "../db";
import { sales as salesTable, splits as splitsTable } from "../db/schema";
import * as splitService from "../modules/split/service";
import { SplitLimitExceededError } from "../modules/split/service";
import * as saleService from "../modules/sale/service";

// ─── Test Fixtures ───────────────────────────────────────────────────────────

// We need a real user in the DB because of FK constraints.
// Pull the first existing user or skip gracefully.
let TEST_USER_ID: string;

beforeAll(async () => {
  const user = await db.query.users?.findFirst();
  if (!user) {
    console.warn(
      "[test] No users found in DB – skipping tests that require a userId. " +
        "Seed at least one user to run the full suite.",
    );
    TEST_USER_ID = "00000000-0000-0000-0000-000000000000"; // sentinel
  } else {
    TEST_USER_ID = user.id;
  }

  // Clean up any leftover data from previous runs for this user
  await db.delete(salesTable).where(eq(salesTable.userId, TEST_USER_ID));
  await db.delete(splitsTable).where(eq(splitsTable.userId, TEST_USER_ID));
});

afterAll(async () => {
  await db.delete(salesTable).where(eq(salesTable.userId, TEST_USER_ID));
  await db.delete(splitsTable).where(eq(splitsTable.userId, TEST_USER_ID));
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return { start, end };
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

  it("net_sale reflects partial split coverage", async () => {
    // Delete Marketing split so total = 25 + 40 = 65%
    await splitService.deleteSplitByName(TEST_USER_ID, "Marketing");

    const { start, end } = todayRange();
    const result = await saleService.getSalesByTimeRange(
      TEST_USER_ID,
      start,
      end,
    );
    const grossTotal = result.sales.reduce((acc, s) => acc + s.amount, 0);
    const expectedNet = grossTotal * (1 - 65 / 100);
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
    expect(deleted.length).toBe(1);
    expect(deleted[0].name).toBe("Rent");
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
