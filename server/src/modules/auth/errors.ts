import type { AuthServiceErrorCode } from "./model";

export class AuthServiceError extends Error {
  constructor(
    public readonly code: AuthServiceErrorCode,
    message: string,
    public readonly details?: string[],
  ) {
    super(message);
    this.name = "AuthServiceError";
  }
}
