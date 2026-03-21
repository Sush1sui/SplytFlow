export function validateSignup(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  confirmPassword: string,
) {
  const errors: string[] = [];
  if (!firstName || !lastName || !email || !password || !confirmPassword)
    errors.push("All fields are required");
  if (password !== confirmPassword) errors.push("Passwords do not match");
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

function validatePassword(password: string) {
  // Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}
