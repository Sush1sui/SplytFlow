import Elysia from "elysia";
import { GenerateOtpBody, OtpSchema } from "./model";
import { create, verify } from "./service";
import { checkRateLimit } from "../../utils/rate-limit";
import { getClientIp } from "../../utils/request";

// 3 OTP requests per 10 minutes per IP
const OTP_RATE_LIMIT = { max: 3, windowMs: 10 * 60 * 1000 };

const otp = new Elysia({ prefix: "/otp" })
  .onAfterHandle(({ set, path }) => {
    // LOGGER
    console.log(`< Response for ${path}: ${set.status}`);
  })
  /**
   * POST /otp
   * Body: { email, purpose }
   * Response: { otp }
   * Possible errors:
   * - 400: Invalid input (e.g. missing fields, invalid email format)
   * - 429: Rate limit exceeded
   * - 500: Server error
   */
  .post(
    "/",
    async ({ body, set, request }) => {
      try {
        const ip = getClientIp(request.headers);
        if (
          !checkRateLimit(
            `otp:${ip}`,
            OTP_RATE_LIMIT.max,
            OTP_RATE_LIMIT.windowMs,
          )
        ) {
          set.status = 429;
          return { error: "Too many OTP requests. Please try again later." };
        }

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
        return { message: "OTP generated successfully", otp };
      } catch (error) {
        console.error("Error generating OTP:", error);
        set.status = 500;
        return {
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        };
      }
    },
    {
      body: OtpSchema.generateOtpBody,
    },
  )

  /**
   * POST /otp/verify
   * Body: { email, purpose, code }
   * Response: { message }
   * Possible errors:
   * - 400: Invalid input (e.g. missing fields, invalid OTP, OTP expired)
   * - 500: Server error
   */
  .post(
    "/verify",
    async ({ body, set }) => {
      try {
        const { email, purpose, code } = body;

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
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        };
      }
    },
    {
      body: OtpSchema.verifyOtpBody,
    },
  );

export default otp;
