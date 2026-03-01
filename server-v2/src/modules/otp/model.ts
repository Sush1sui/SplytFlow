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
