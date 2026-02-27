import "bun";
import dbClient from "../../../db/dbClient";
import { validateSignin, validateSignup } from "../../../util/auth/util";

export async function create(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  confirmPassword: string,
) {
  try {
    if (!validateSignup(firstName, lastName, email, password, confirmPassword))
      throw new Error("Invalid signup data");

    const hashedPassword = await Bun.password.hash(password);

    // attempt to create user; catch unique constraint violation explicitly
    try {
      const user = await dbClient.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
        },
      });

      if (!user) throw new Error("Failed to create user");
      return user;
    } catch (prismaError) {
      // Prisma uses P2002 for unique constraint failures. The error object
      // may not satisfy instanceof checks due to differing module instances,
      // so test by shape instead. meta.target can be a string[], string, or
      // undefined depending on the Prisma version and provider, so we only
      // check the code. Email is the sole unique field on User, so P2002
      // always means a duplicate email.
      const maybe = prismaError as { code?: string };
      if (maybe.code === "P2002") {
        throw new Error("Email is already in use");
      }
      // re‑throw other errors unchanged
      throw prismaError;
    }
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("An unknown error occurred");
  }
}

export async function findByEmailAndPassword(email: string, password: string) {
  try {
    if (!validateSignin(email, password))
      throw new Error("Invalid signin data");

    const user = await dbClient.user.findUnique({
      where: { email },
    });

    if (!user) throw new Error("User not found");

    const passwordMatch = await Bun.password.verify(password, user.password);

    if (!passwordMatch) throw new Error("Incorrect password");

    return user;
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("An unknown error occurred");
  }
}
