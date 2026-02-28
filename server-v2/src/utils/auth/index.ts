import { SignJWT, jwtVerify } from "jose";
import { randomUUID } from "crypto";
import { JWTPayload } from "../../modules/auth/model";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET environment variable is not set");

const secret = new TextEncoder().encode(JWT_SECRET);

const ACCESS_TOKEN_EXPIRY_SECONDS = 60 * 15; // 15 minutes
export const REFRESH_TOKEN_EXPIRY_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export async function signAccessToken(
  userId: string,
  email: string,
  tokenVersion: number,
): Promise<{ token: string; jti: string; expiresAt: Date }> {
  const now = Math.floor(Date.now() / 1000);
  const jti = randomUUID();

  const token = await new SignJWT({ sub: userId, email, tokenVersion, jti })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + ACCESS_TOKEN_EXPIRY_SECONDS)
    .setJti(jti)
    .sign(secret);

  const expiresAt = new Date((now + ACCESS_TOKEN_EXPIRY_SECONDS) * 1000);
  return { token, jti, expiresAt };
}

export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, secret);
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

export function validateSignup(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  confirmPassword: string,
) {
  const errors = [];
  if (!firstName || !lastName || !email || !password || !confirmPassword)
    errors.push("All fields are required");
  if (password !== confirmPassword) errors.push("Passwords do not match");
  if (!validateEmail(email)) errors.push("Invalid email format");
  if (password !== confirmPassword) errors.push("Passwords do not match");
  if (!validatePassword(password))
    errors.push(
      "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    );
  if (!validateEmail(email)) errors.push("Invalid email format");
  if (!validatePassword(password))
    errors.push(
      "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    );

  return errors;
}

export function validateSignin(email: string, password: string) {
  try {
    if (!email || !password) throw new Error("Email and password are required");
    if (!validateEmail(email)) throw new Error("Invalid email format");

    return true;
  } catch (error) {
    return false;
  }
}

export function validateEmail(email: string) {
  // Simple email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePurpose(purpose: string) {
  const validPurposes = process.env.PURPOSES
    ? process.env.PURPOSES.split(",").map((p) => p.trim())
    : [];
  return validPurposes.includes(purpose);
}

function validatePassword(password: string) {
  // Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}
