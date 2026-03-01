import Elysia from "elysia";
import { GenerateOtpBody, VerifyOtpBody } from "./model";
import { create, verify } from "./service";

const otp = new Elysia({ prefix: "/otp" })
  /**
   * POST /otp
   * Body: { email, purpose }
   * Response: { otp }
   * Possible errors:
   * - 400: Invalid input (e.g. missing fields, invalid email format)
   * - 500: Server error
   */
  .post("/", async ({ body, set }) => {
    try {
      const { email, purpose } = body as GenerateOtpBody;

      if (!email || !purpose) {
        set.status = 400;
        return { error: "Email and purpose are required" };
      }

      const otp = await create(email, purpose);

      if (!otp) {
        set.status = 500;
        return { error: "Failed to generate OTP" };
      }

      set.status = 200;
      return { otp };
    } catch (error) {
      console.error("Error generating OTP:", error);
      set.status = 500;
      return {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  })
  /**
   * POST /otp/verify
   * Body: { email, purpose, code }
   * Response: { message }
   * Possible errors:
   * - 400: Invalid input (e.g. missing fields, invalid OTP, OTP expired)
   * - 500: Server error
   */
  .post("/verify", async ({ body, set }) => {
    try {
      const { email, purpose, code } = body as VerifyOtpBody;

      if (!email || !purpose || !code) {
        set.status = 400;
        return { error: "Email, purpose, and code are required" };
      }

      const isValid = await verify(email, code, purpose);
      if (!isValid) {
        set.status = 400;
        return { error: "Invalid OTP or OTP has expired" };
      }

      set.status = 200;
      return { message: "OTP verified successfully" };
    } catch (error) {
      console.error("Error verifying OTP:", error);
      set.status = 500;
      return {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  });

export default otp;
