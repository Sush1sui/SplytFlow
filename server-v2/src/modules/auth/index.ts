import { Elysia } from "elysia";
import { signin, signup } from "./service";
import { SignInBody, SignUpBody } from "./model";
import { validateSignup } from "../../utils/auth";

const auth = new Elysia({ prefix: "/api/auth" })
  /**
   * POST /auth/signin
   * Body: { email, password }
   * Response: { token, user }
   */
  .post("/signin", async ({ body, set }) => {
    try {
      const { email, password } = body as SignInBody;

      if (!email || !password) {
        set.status = 400;
        return { error: "Email and password are required" };
      }

      const result = await signin(email, password);

      set.status = 200;
      return result;
    } catch (error) {
      set.status = 500;
      return {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  })
  /**
   * POST /auth/signup
   * Body: { firstName, lastName, email, password, confirmPassword }
   * Response: { token, user }
   * Possible errors:
   * - 400: Invalid input (e.g. missing fields, password mismatch, weak password)
   * - 409: Email already in use
   * - 500: Server error
   */
  .post("/signup", async ({ body, set }) => {
    try {
      const { firstName, lastName, email, password, confirmPassword } =
        body as SignUpBody;

      const errors = validateSignup(
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
      );
      if (errors.length > 0) {
        set.status = 400;
        return { error: "Invalid signup data", errors };
      }

      const result = await signup(
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
      );

      set.status = 201;
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      if (message === "Email is already in use") {
        set.status = 409;
        return { error: message };
      }
      set.status = 500;
      return { error: message };
    }
  });

export default auth;
