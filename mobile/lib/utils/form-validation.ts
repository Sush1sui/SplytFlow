export default function validateEmail(email: string): boolean {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

export function validatePassword(password: string): boolean {
  // Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return re.test(password);
}

export function passwordMatch(
  password: string,
  confirmPassword: string,
): boolean {
  return password === confirmPassword;
}

export function signUpValidation(
  email: string,
  password: string,
  confirmPassword: string,
): boolean {
  return (
    validateEmail(email) &&
    validatePassword(password) &&
    passwordMatch(password, confirmPassword)
  );
}
