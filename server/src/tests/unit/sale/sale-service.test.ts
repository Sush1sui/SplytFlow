import { describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { sales, users } from "../../../db/schema";
import saleService from "../../../modules/sale/service";

const TIME_ZONE = "UTC";
const LOCAL_DATE = "2026-04-02";

async function createTestUser(tag: string) {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const [user] = await db
    .insert(users)
    .values({
      firstName: "Test",
      lastName: "User",
      email: `sale-${tag}-${unique}@example.com`,
      password: "hashed-password",
    })
    .returning({ id: users.id });

  if (!user) {
    throw new Error("Failed to create test user");
  }

  return user;
}

async function cleanupUser(userId: string) {
  await db.delete(sales).where(eq(sales.userId, userId));
  await db.delete(users).where(eq(users.id, userId));
}

describe("sale service multi-currency behavior", () => {
  test("upsert aggregates same-day deltas for the same currency", async () => {
    const user = await createTestUser("aggregate");

    try {
      await saleService.upsert(
        user.id,
        120,
        100,
        "USD",
        TIME_ZONE,
        LOCAL_DATE,
        "09:00",
      );

      await saleService.upsert(
        user.id,
        80,
        70,
        "USD",
        TIME_ZONE,
        LOCAL_DATE,
        "10:00",
      );

      const rows = await saleService.getByUserIdWithRange(
        user.id,
        LOCAL_DATE,
        LOCAL_DATE,
        TIME_ZONE,
      );

      expect(rows.length).toBe(1);
      expect(rows[0]?.currencyCode).toBe("USD");
      expect(rows[0]?.amount).toBe(200);
      expect(rows[0]?.originalAmount).toBe(170);
    } finally {
      await cleanupUser(user.id);
    }
  });

  test("upsert stores separate rows for different currencies on the same local day", async () => {
    const user = await createTestUser("multicurrency");

    try {
      await saleService.upsert(
        user.id,
        150,
        150,
        "USD",
        TIME_ZONE,
        LOCAL_DATE,
        "09:30",
      );

      await saleService.upsert(
        user.id,
        95,
        80,
        "EUR",
        TIME_ZONE,
        LOCAL_DATE,
        "09:30",
      );

      const allRows = await saleService.getByUserIdWithRange(
        user.id,
        LOCAL_DATE,
        LOCAL_DATE,
        TIME_ZONE,
      );
      const usdRows = await saleService.getByUserIdWithRange(
        user.id,
        LOCAL_DATE,
        LOCAL_DATE,
        TIME_ZONE,
        "USD",
      );
      const eurRows = await saleService.getByUserIdWithRange(
        user.id,
        LOCAL_DATE,
        LOCAL_DATE,
        TIME_ZONE,
        "EUR",
      );

      expect(allRows.length).toBe(2);
      expect(usdRows.length).toBe(1);
      expect(eurRows.length).toBe(1);
      expect(usdRows[0]?.amount).toBe(150);
      expect(eurRows[0]?.amount).toBe(95);
      expect(usdRows[0]?.currencyCode).toBe("USD");
      expect(eurRows[0]?.currencyCode).toBe("EUR");
    } finally {
      await cleanupUser(user.id);
    }
  });

  test("update persists amount, originalAmount, and currencyCode", async () => {
    const user = await createTestUser("update");

    try {
      const created = await saleService.upsert(
        user.id,
        300,
        250,
        "USD",
        TIME_ZONE,
        LOCAL_DATE,
        "11:15",
      );

      if (!created) {
        throw new Error("Expected created sale row");
      }

      const updated = await saleService.update(
        created.id,
        user.id,
        275,
        220,
        "EUR",
      );

      expect(updated).not.toBeNull();
      expect(updated?.amount).toBe(275);
      expect(updated?.originalAmount).toBe(220);
      expect(updated?.currencyCode).toBe("EUR");
    } finally {
      await cleanupUser(user.id);
    }
  });
});
