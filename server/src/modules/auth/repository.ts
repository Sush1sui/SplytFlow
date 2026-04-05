import { eq, lt, sql } from "drizzle-orm";
import { db } from "../../db";
import { refreshTokens, users } from "../../db/schema";
import type {
  AuthUser,
  AuthUserWithPassword,
  ConsumedRefreshTokenRecord,
} from "./model";
import { AuthServiceError } from "./errors";

const authUserColumns = {
  id: users.id,
  firstName: users.firstName,
  lastName: users.lastName,
  email: users.email,
  tokenVersion: users.tokenVersion,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

const authUserWithPasswordColumns = {
  ...authUserColumns,
  password: users.password,
};

export async function createUserRecord(input: {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
}): Promise<AuthUser> {
  try {
    const [user] = await db
      .insert(users)
      .values({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        password: input.passwordHash,
      })
      .returning(authUserColumns);

    if (!user) {
      throw new Error("Failed to create user");
    }

    return user;
  } catch (error) {
    const maybe = error as { code?: string };
    if (maybe.code === "23505") {
      throw new AuthServiceError("conflict", "Email is already in use");
    }

    throw error;
  }
}

export async function findUserWithPasswordByEmail(
  email: string,
): Promise<AuthUserWithPassword | null> {
  const [user] = await db
    .select(authUserWithPasswordColumns)
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user ?? null;
}

export async function findUserByIdWithPassword(
  userId: string,
): Promise<AuthUserWithPassword | null> {
  const [user] = await db
    .select(authUserWithPasswordColumns)
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
}

export async function findUserById(userId: string): Promise<AuthUser | null> {
  const [user] = await db
    .select(authUserColumns)
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
}

export async function consumeRefreshTokenRecord(
  tokenHash: string,
): Promise<ConsumedRefreshTokenRecord | null> {
  const [record] = await db
    .delete(refreshTokens)
    .where(eq(refreshTokens.tokenHash, tokenHash))
    .returning({
      userId: refreshTokens.userId,
      expiresAt: refreshTokens.expiresAt,
    });

  return record ?? null;
}

export async function createRefreshTokenRecord(
  tokenHash: string,
  userId: string,
  expiresAt: Date,
): Promise<void> {
  await db.insert(refreshTokens).values({ tokenHash, userId, expiresAt });
}

export async function deleteRefreshTokenRecord(
  tokenHash: string,
): Promise<void> {
  await db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash));
}

export async function invalidateAllSessions(userId: string): Promise<void> {
  await Promise.all([
    db
      .update(users)
      .set({ tokenVersion: sql`${users.tokenVersion} + 1` })
      .where(eq(users.id, userId)),
    db.delete(refreshTokens).where(eq(refreshTokens.userId, userId)),
  ]);
}

export async function deleteExpiredRefreshTokenRecords(
  now = new Date(),
): Promise<number> {
  const deleted = await db
    .delete(refreshTokens)
    .where(lt(refreshTokens.expiresAt, now))
    .returning({ id: refreshTokens.id });

  return deleted.length;
}
