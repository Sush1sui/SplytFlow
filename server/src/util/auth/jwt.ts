import { sign, verify } from "hono/jwt";
import { randomUUID } from "crypto";
import { JWTPayload } from "./types";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";
const ACCESS_TOKEN_EXPIRY_SECONDS = 60 * 15; // 15 minutes
export const REFRESH_TOKEN_EXPIRY_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export async function signAccessToken(
  userId: string,
  email: string,
  tokenVersion: number,
): Promise<{ token: string; jti: string; expiresAt: Date }> {
  const now = Math.floor(Date.now() / 1000);
  const jti = randomUUID();

  const payload: JWTPayload = {
    sub: userId,
    email,
    tokenVersion,
    jti,
    iat: now,
    exp: now + ACCESS_TOKEN_EXPIRY_SECONDS,
  };

  const token = await sign(payload, JWT_SECRET, "HS256");
  const expiresAt = new Date((now + ACCESS_TOKEN_EXPIRY_SECONDS) * 1000);

  return { token, jti, expiresAt };
}

export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  const payload = await verify(token, JWT_SECRET, "HS256");
  return payload as unknown as JWTPayload;
}

/** Generate an opaque refresh token and its SHA-256 hash for storage. */
export function generateRefreshToken(): {
  rawToken: string;
  tokenHash: string;
} {
  const rawToken = randomUUID();
  const tokenHash = Bun.CryptoHasher
    ? new Bun.CryptoHasher("sha256").update(rawToken).digest("hex")
    : require("crypto").createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
}

/** Hash a raw refresh token the same way for lookup. */
export function hashRefreshToken(rawToken: string): string {
  return Bun.CryptoHasher
    ? new Bun.CryptoHasher("sha256").update(rawToken).digest("hex")
    : require("crypto").createHash("sha256").update(rawToken).digest("hex");
}
