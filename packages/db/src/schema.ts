import {
  pgTable,
  serial,
  text,
  numeric,
  timestamp,
  integer,
  date,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// USERS TABLE
// ============================================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  supabaseId: text("supabase_id").unique().notNull(),
  email: text("email").unique().notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// SPLIT CONFIGURATIONS TABLE
// ============================================
export const splitConfigs = pgTable("split_configs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(), // e.g., "Electricity", "Gas", "Transportation", "Savings"
  percentage: numeric("percentage", { precision: 5, scale: 2 }).notNull(), // e.g., 25.50 for 25.5%
  color: text("color"), // Hex color for UI display (e.g., "#FF6B6B")
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(), // For custom ordering in UI
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// EARNINGS TABLE (renamed from sales)
// ============================================
export const earnings = pgTable("earnings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  date: date("date").notNull(), // The actual date of the earning
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(), // When the record was created
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// SPLIT ALLOCATIONS TABLE
// ============================================
// This stores how each earning was split according to the split configs
export const splitAllocations = pgTable("split_allocations", {
  id: serial("id").primaryKey(),
  earningId: integer("earning_id")
    .references(() => earnings.id, { onDelete: "cascade" })
    .notNull(),
  splitConfigId: integer("split_config_id")
    .references(() => splitConfigs.id, { onDelete: "cascade" })
    .notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(), // Calculated amount for this split
  percentage: numeric("percentage", { precision: 5, scale: 2 }).notNull(), // Snapshot of percentage at time of earning
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// RELATIONS
// ============================================
export const usersRelations = relations(users, ({ many }) => ({
  splitConfigs: many(splitConfigs),
  earnings: many(earnings),
}));

export const splitConfigsRelations = relations(
  splitConfigs,
  ({ one, many }) => ({
    user: one(users, {
      fields: [splitConfigs.userId],
      references: [users.id],
    }),
    allocations: many(splitAllocations),
  })
);

export const earningsRelations = relations(earnings, ({ one, many }) => ({
  user: one(users, {
    fields: [earnings.userId],
    references: [users.id],
  }),
  allocations: many(splitAllocations),
}));

export const splitAllocationsRelations = relations(
  splitAllocations,
  ({ one }) => ({
    earning: one(earnings, {
      fields: [splitAllocations.earningId],
      references: [earnings.id],
    }),
    splitConfig: one(splitConfigs, {
      fields: [splitAllocations.splitConfigId],
      references: [splitConfigs.id],
    }),
  })
);
