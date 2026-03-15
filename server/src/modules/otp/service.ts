import { db } from "../../db";
import { otps } from "../../db/schema";
import { and, eq, gt, lt } from "drizzle-orm";
import { validateEmail, validatePurpose } from "../../utils/auth";
import {
  capitalizeWords,
  removeHyphensAndReplaceWithWhitespace,
} from "../../utils";
import { emailTemplate, sendEmail } from "../../utils/email";
import { randomInt } from "crypto"; // use secure RNG for OTPs
import {
  isTransientDbConnectionError,
  withDbRetry,
} from "../../utils/db/retry";

export async function create(email: string, purpose = "signup") {
  try {
    if (!validateEmail(email) || !purpose)
      throw new Error("Invalid email format or purpose");
    if (!validatePurpose(purpose)) throw new Error("Invalid purpose");

    // Generate a cryptographically strong 6‑digit OTP
    const code = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

    const [otp] = await db
      .insert(otps)
      .values({ email, purpose, code, expiresAt })
      .onConflictDoUpdate({
        target: [otps.email, otps.purpose],
        set: { code, expiresAt },
      })
      .returning();

    if (!otp) throw new Error("Failed to create OTP");

    // send email asynchronously so the request doesn’t stall waiting for
    // the SMTP server. failures are logged but do not prevent the API
    // from returning the OTP record
    sendEmail({
      to: email,
      subject: "Your verification code – SplytFlow",
      text: `Your verification code for ${purpose} is: ${code}. It expires in 5 minutes.`,
      html: emailTemplate({
        title: "Your verification code",
        message: `Enter the code below to complete your <strong>${capitalizeWords(removeHyphensAndReplaceWithWhitespace(purpose))}</strong> request.
                  It will expire in <strong>5 minutes</strong>.`,
        highlight: code,
        footerNote:
          "If you did not request this code, you can safely ignore this email.",
      }),
    }).catch((err) => {
      console.error("Failed to send OTP email (async):", err);

      // clean up the OTP since the user won't receive it
      db.delete(otps)
        .where(eq(otps.id, otp.id))
        .catch((deleteErr) => {
          console.error(
            "Failed to delete OTP after email send failure (async):",
            deleteErr,
          );
        });
    });

    return {
      ...otp,
      code: undefined, // Don't return the code in the response
    };
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("An unknown error occurred");
  }
}

export async function verify(email: string, code: string, purpose = "signup") {
  try {
    const now = new Date();
    if (!validateEmail(email) || !code || !purpose)
      throw new Error("Invalid input");
    if (!validatePurpose(purpose)) throw new Error("Invalid purpose");

    const [otp] = await db
      .select()
      .from(otps)
      .where(
        and(
          eq(otps.email, email),
          eq(otps.code, code),
          eq(otps.purpose, purpose),
          gt(otps.expiresAt, now),
        ),
      );

    if (!otp) throw new Error("OTP not found or expired");

    // SQL condition `gt(otps.expiresAt, now)` already guarantees the row is
    // not expired, so the check below is unnecessary.
    if (otp.code !== code) throw new Error("Invalid OTP code");

    // OTP is valid, delete it to prevent reuse
    await db.delete(otps).where(eq(otps.id, otp.id));

    return true;
  } catch (error) {
    return false;
  }
}

export async function runCleanup(minuteInterval = 5) {
  cleanupExpiredOtps(); // Run immediately on startup
  setInterval(cleanupExpiredOtps, 60 * 1000 * minuteInterval); // Run every minuteInterval minutes
}

async function cleanupExpiredOtps() {
  try {
    await withDbRetry(
      () => db.delete(otps).where(lt(otps.expiresAt, new Date())),
      { retries: 1, delayMs: 400 },
    );
  } catch (error) {
    if (isTransientDbConnectionError(error)) {
      console.error("Error during OTP cleanup: database connection timeout");
      return;
    }

    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error during OTP cleanup: ${msg}`);
  }
}
