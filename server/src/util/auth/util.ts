export function validateSignup(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  confirmPassword: string,
) {
  try {
    if (!firstName || !lastName || !email || !password || !confirmPassword)
      throw new Error("All fields are required");
    if (password !== confirmPassword) throw new Error("Passwords do not match");
    if (!validateEmail(email)) throw new Error("Invalid email format");
    if (!validatePassword(password))
      throw new Error(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      );

    return true;
  } catch (error) {
    return false;
  }
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
