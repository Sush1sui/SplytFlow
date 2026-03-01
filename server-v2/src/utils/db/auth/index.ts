import { db } from "../../../db";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { validateSignin, validateSignup } from "../../auth";

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

    try {
      const [user] = await db
        .insert(users)
        .values({ firstName, lastName, email, password: hashedPassword })
        .returning();

      if (!user) throw new Error("Failed to create user");
      return user;
    } catch (dbError) {
      // PostgreSQL unique violation code
      const maybe = dbError as { code?: string };
      if (maybe.code === "23505") {
        throw new Error("Email is already in use");
      }
      throw dbError;
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

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
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
