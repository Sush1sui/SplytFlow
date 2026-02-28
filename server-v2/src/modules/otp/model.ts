export type GenerateOtpBody = {
  email: string;
  purpose: "password_reset" | "signup";
};

export type SendEmailOptions = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

export type VerifyOtpBody = {
  email: string;
  purpose: "password_reset" | "signup";
  code: string;
};
