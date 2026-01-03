import {
  pgTable,
  serial,
  text,
  numeric,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  supabaseId: text("supabase_id").unique().notNull(),
  email: text("email").unique().notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const splitConfigs = pgTable("split_configs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  label: text("label").notNull(), // e.g., "Cost of Goods", "Operating Expenses", "Marketing"
  percent: numeric("percent", { precision: 5, scale: 2 }).notNull(),
});

// Alternative name: costAllocations (more professional)

// 3. Sales Table
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
