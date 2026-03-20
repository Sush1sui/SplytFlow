import { describe, expect, test } from "bun:test";
import { AuthServiceError } from "../../../modules/auth/errors";
import {
  formatUserProfile,
  toAuthResponse,
} from "../../../modules/auth/mapper";
import {
  assertSigninInput,
  assertSignupInput,
  normalizeEmail,
} from "../../../modules/auth/validators";
import type { AuthUser } from "../../../modules/auth/model";

function getAuthError(fn: () => void) {
  try {
    fn();
    return null;
  } catch (error) {
    return error;
  }
}

describe("auth validators", () => {
  test("normalizeEmail trims and lowercases", () => {
    expect(normalizeEmail("  USER@Example.COM  ")).toBe("user@example.com");
  });

  test("assertSigninInput accepts valid input", () => {
    expect(() =>
      assertSigninInput("user@example.com", "Password1!"),
    ).not.toThrow();
  });

  test("assertSigninInput throws invalid_input on missing fields", () => {
    const error = getAuthError(() => assertSigninInput("", ""));

    expect(error).toBeInstanceOf(AuthServiceError);
    expect((error as AuthServiceError).code).toBe("invalid_input");
  });

  test("assertSignupInput throws with details on bad data", () => {
    const error = getAuthError(() =>
      assertSignupInput("", "", "bad-email", "weak", "different"),
    );

    expect(error).toBeInstanceOf(AuthServiceError);
    expect((error as AuthServiceError).code).toBe("invalid_input");
    expect((error as AuthServiceError).details?.length).toBeGreaterThan(0);
  });
});

describe("auth mapper", () => {
  test("formatUserProfile serializes dates to ISO", () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    const updatedAt = new Date("2026-01-02T00:00:00.000Z");

    const user: AuthUser = {
      id: "user-1",
      firstName: "A",
      lastName: "B",
      email: "a@b.com",
      tokenVersion: 0,
      createdAt,
      updatedAt,
    };

    const profile = formatUserProfile(user);

    expect(profile.createdAt).toBe(createdAt.toISOString());
    expect(profile.updatedAt).toBe(updatedAt.toISOString());
  });

  test("toAuthResponse maps user and token payload", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const user: AuthUser = {
      id: "user-1",
      firstName: "A",
      lastName: "B",
      email: "a@b.com",
      tokenVersion: 0,
      createdAt: now,
      updatedAt: now,
    };

    const result = toAuthResponse("ok", user, {
      token: "access",
      expiresAt: now,
      refreshToken: "refresh",
      refreshTokenExpiresAt: now,
    });

    expect(result.message).toBe("ok");
    expect(result.token).toBe("access");
    expect(result.refreshToken).toBe("refresh");
    expect(result.user.email).toBe("a@b.com");
  });
});
