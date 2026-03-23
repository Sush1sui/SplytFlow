import { t } from "elysia";

export type GenerateOtpBody = {
  email: string;
  purpose: "signup" | "password-reset";
};

export type SendEmailOptions = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

export type VerifyOtpBody = {
  email: string;
  purpose: "signup" | "password-reset";
  code: string;
};

export const OtpSchema = {
  otpPurpose: t.Union([t.Literal("signup"), t.Literal("password-reset")]),

  generateOtpBody: t.Object({
    email: t.String(),
    purpose: t.Union([t.Literal("signup"), t.Literal("password-reset")]),
  }),

  verifyOtpBody: t.Object({
    email: t.String(),
    purpose: t.Union([t.Literal("signup"), t.Literal("password-reset")]),
    code: t.String(),
  }),
};
