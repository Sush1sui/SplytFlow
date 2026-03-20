import { validateEmail } from "../../utils/auth";
import { AuthServiceError } from "./errors";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function assertSigninInput(email: string, password: string) {
  if (!email?.trim() || !password) {
    throw new AuthServiceError(
      "invalid_input",
      "Email and password are required",
    );
  }

  if (!validateEmail(email.trim())) {
    throw new AuthServiceError("invalid_input", "Invalid email format");
  }
}

export function assertSignupInput(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  confirmPassword: string,
) {
  const errors: string[] = [];

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    errors.push("All fields are required");
  }

  if (password !== confirmPassword) {
    errors.push("Passwords do not match");
  }

  if (!validateEmail(email.trim())) {
    errors.push("Invalid email format");
  }

  if (!PASSWORD_REGEX.test(password)) {
    errors.push(
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
    );
  }

  if (errors.length > 0) {
    throw new AuthServiceError("invalid_input", "Invalid signup data", errors);
  }
}
