import { eq, sql } from "drizzle-orm";

import { db } from "../src/db";
import { sales, splitHistory, splits } from "../src/db/schema";

type Options = {
  userId?: string;
  yes: boolean;
  dryRun: boolean;
};

function parseOptions(argv: string[]): Options {
  const args = [...argv];
  let userId: string | undefined;
  let yes = false;
  let dryRun = false;

  while (args.length > 0) {
    const token = args.shift();
    if (!token) break;

    if (token === "--yes") {
      yes = true;
      continue;
    }

    if (token === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (token === "--user-id") {
      const value = args.shift();
      if (!value) {
        throw new Error("--user-id requires a value");
      }
      userId = value;
      continue;
    }

    throw new Error(`Unknown argument: ${token}`);
  }

  return { userId, yes, dryRun };
}

function printUsage() {
  console.log("Usage: bun run scripts/db-reset-domain.ts [options]");
  console.log("");
  console.log("Options:");
  console.log("  --yes             Required to execute destructive reset");
  console.log("  --dry-run         Preview affected rows without deleting");
  console.log("  --user-id <uuid>  Restrict reset to one user");
}

async function countRows(userId?: string) {
  const [saleCountRow] = userId
    ? await db
        .select({ count: sql<number>`count(*)::int` })
        .from(sales)
        .where(eq(sales.userId, userId))
    : await db.select({ count: sql<number>`count(*)::int` }).from(sales);

  const [splitCountRow] = userId
    ? await db
        .select({ count: sql<number>`count(*)::int` })
        .from(splits)
        .where(eq(splits.userId, userId))
    : await db.select({ count: sql<number>`count(*)::int` }).from(splits);

  const [historyCountRow] = userId
    ? await db
        .select({ count: sql<number>`count(*)::int` })
        .from(splitHistory)
        .where(eq(splitHistory.userId, userId))
    : await db.select({ count: sql<number>`count(*)::int` }).from(splitHistory);

  return {
    sales: saleCountRow?.count ?? 0,
    splits: splitCountRow?.count ?? 0,
    splitHistory: historyCountRow?.count ?? 0,
  };
}

function printSummary(
  prefix: string,
  counts: Awaited<ReturnType<typeof countRows>>,
) {
  console.log(`${prefix} Sale rows: ${counts.sales}`);
  console.log(`${prefix} Split rows: ${counts.splits}`);
  console.log(`${prefix} SplitHistory rows: ${counts.splitHistory}`);
}

async function run() {
  const options = parseOptions(Bun.argv.slice(2));

  if (!options.dryRun && !options.yes) {
    console.error("Refusing to delete data without --yes.");
    printUsage();
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  console.log("SplytFlow domain reset utility (development only)");
  console.log(
    options.userId
      ? `Scope: user ${options.userId}`
      : "Scope: all users (Sale, Split, SplitHistory)",
  );

  const before = await countRows(options.userId);
  printSummary("Before", before);

  if (options.dryRun) {
    console.log("Dry run complete. No rows were deleted.");
    return;
  }

  await db.transaction(async (tx) => {
    if (options.userId) {
      await tx.delete(sales).where(eq(sales.userId, options.userId!));
      await tx
        .delete(splitHistory)
        .where(eq(splitHistory.userId, options.userId!));
      await tx.delete(splits).where(eq(splits.userId, options.userId!));
      return;
    }

    await tx.delete(sales);
    await tx.delete(splitHistory);
    await tx.delete(splits);
  });

  const after = await countRows(options.userId);
  printSummary("After", after);
  console.log("Domain reset completed.");
}

run().catch((error) => {
  console.error("Domain reset failed:", error);
  process.exit(1);
});
