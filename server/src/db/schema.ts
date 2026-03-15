import {
  index,
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  doublePrecision,
  jsonb,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const users = pgTable("User", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: varchar("firstName").notNull(),
  lastName: varchar("lastName").notNull(),
  email: varchar("email").notNull().unique(),
  password: text("password").notNull(),
  tokenVersion: integer("tokenVersion").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export const refreshTokens = pgTable("RefreshToken", {
  id: uuid("id").primaryKey().defaultRandom(),
  tokenHash: varchar("tokenHash").notNull().unique(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const otps = pgTable(
  "OTP",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email").notNull(),
    purpose: varchar("purpose").notNull(),
    code: varchar("code").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
  },
  (table) => [
    unique("OTP_email_purpose_key").on(table.email, table.purpose),
    // index to support cleanup and range queries by expiration
    // this will be translated into a `CREATE INDEX` migration when
    // you run `bun run db:generate`.
    // for a partial index you can add raw SQL in a migration file:
    //   CREATE INDEX CONCURRENTLY otp_expires_at_idx
    //     ON "OTP"("expiresAt") WHERE "expiresAt" > NOW();
  ],
);

export const splits = pgTable(
  "Split",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id),
    name: varchar("name").notNull(),
    value: doublePrecision("value").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [unique("Split_userId_name_key").on(table.userId, table.name)],
);

export const splitHistory = pgTable(
  "SplitHistory",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    effectiveFrom: timestamp("effectiveFrom").defaultNow().notNull(),
    totalSplitPct: doublePrecision("totalSplitPct").notNull(),
    // Optional snapshot for future per-category historical breakdown.
    breakdownJson: jsonb("breakdownJson"),
    source: varchar("source").notNull().default("live"),
    correctionBatchId: uuid("correctionBatchId"),
    reason: text("reason"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("SplitHistory_userId_effectiveFrom_idx").on(
      table.userId,
      table.effectiveFrom,
    ),
  ],
);

export const sales = pgTable(
  "Sale",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id),
    amount: doublePrecision("amount").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    unique("Sale_userId_createdAt_key").on(table.userId, table.createdAt),
  ],
);
