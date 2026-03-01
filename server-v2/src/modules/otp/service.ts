import { db } from "../../db";
import { otps } from "../../db/schema";
import { and, eq, gt, sql } from "drizzle-orm";
import { validateEmail, validatePurpose } from "../../utils/auth";
import {
  capitalizeWords,
  removeHyphensAndReplaceWithWhitespace,
} from "../../utils";
import { emailTemplate, sendEmail } from "../../utils/email";

export async function create(email: string, purpose = "signup") {
  try {
    if (!validateEmail(email) || !purpose)
      throw new Error("Invalid email format or purpose");
    if (!validatePurpose(purpose)) throw new Error("Invalid purpose");

    // Generate a 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
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

    const info = await sendEmail({
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
    });

    if (!info) {
      otp && (await db.delete(otps).where(eq(otps.id, otp.id))); // Clean up OTP if email fails
      throw new Error("Failed to send OTP email");
    }

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

    if (otp.expiresAt < now) {
      await db.delete(otps).where(eq(otps.id, otp.id));
      throw new Error("OTP has expired");
    }

    if (otp.code !== code) throw new Error("Invalid OTP code");

    // OTP is valid, delete it to prevent reuse
    await db.delete(otps).where(eq(otps.id, otp.id));

    return true;
  } catch (error) {
    return false;
  }
}

export async function runCleanup(minuteInterval = 5) {
  setInterval(
    async () => {
      try {
        // Use raw SQL to bypass Prisma's UTF-8 decoding, which throws on
        // any corrupted rows that may exist in the table.
        await db.execute(sql`DELETE FROM "OTP" WHERE "expiresAt" < NOW()`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        const code = (error as { code?: string }).code;
        console.error(
          `Error during OTP cleanup: ${msg}${code ? ` (code: ${code})` : ""}`,
        );
      }
    },
    60 * 1000 * minuteInterval,
  ); // Run every minuteInterval minutes
}
