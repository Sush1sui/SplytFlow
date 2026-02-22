import nodemailer from "nodemailer";
import { SendEmailOptions } from "../../util/auth/types";

// create a single transporter instance that can be reused across the app
const { EMAIL_USER, EMAIL_PASSWORD } = process.env;
if (!EMAIL_USER || !EMAIL_PASSWORD)
  throw new Error("Email credentials are not set in environment");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

export async function sendEmail(options: SendEmailOptions) {
  try {
    if (!EMAIL_USER || !EMAIL_PASSWORD) {
      throw new Error("Email credentials are not set in environment");
    }

    const message = {
      from: EMAIL_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(message);

    return info;
  } catch (error) {
    console.error(
      "Failed to send email:",
      error instanceof Error ? error : new Error("Unknown error"),
    );
    throw error instanceof Error ? error : new Error("Failed to send email");
  }
}

export interface EmailTemplateOptions {
  title: string;
  /** Main body paragraph shown below the title */
  message: string;
  /** Optional highlighted callout (e.g. an OTP code) */
  highlight?: string;
  /** Optional CTA button label */
  buttonLabel?: string;
  /** Optional CTA button URL */
  buttonUrl?: string;
  /** Footer note override – defaults to the standard disclaimer */
  footerNote?: string;
}

export function emailTemplate(options: EmailTemplateOptions): string {
  const {
    title,
    message,
    highlight,
    buttonLabel,
    buttonUrl,
    footerNote = "This is an automated message from SplytFlow. Please do not reply to this email.",
  } = options;

  const highlightBlock = highlight
    ? `
    <!-- Highlight / OTP block -->
    <tr>
      <td align="center" style="padding: 24px 40px 8px;">
        <div style="
          display: inline-block;
          background-color: #f0f4ff;
          border: 1px solid #c7d2fe;
          border-radius: 10px;
          padding: 18px 36px;
          font-size: 36px;
          font-weight: 700;
          letter-spacing: 10px;
          color: #4f46e5;
          font-family: 'Courier New', Courier, monospace;
        ">${highlight}</div>
      </td>
    </tr>`
    : "";

  const buttonBlock =
    buttonLabel && buttonUrl
      ? `
    <!-- CTA Button -->
    <tr>
      <td align="center" style="padding: 28px 40px 8px;">
        <a href="${buttonUrl}" target="_blank" style="
          display: inline-block;
          background-color: #4f46e5;
          color: #ffffff;
          text-decoration: none;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 15px;
          font-weight: 600;
          padding: 14px 32px;
          border-radius: 8px;
          letter-spacing: 0.3px;
        ">${buttonLabel}</a>
      </td>
    </tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color:#f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
    style="background-color:#f3f4f6; padding: 40px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
          style="max-width:580px; background-color:#ffffff; border-radius:16px;
                 box-shadow:0 4px 24px rgba(0,0,0,0.06); overflow:hidden;">

          <!-- Header bar -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                        padding: 32px 40px; text-align:center;">
              <span style="
                font-family: Arial, Helvetica, sans-serif;
                font-size: 24px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: -0.5px;
              ">SplytFlow</span>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding: 36px 40px 0; text-align:center;">
              <h1 style="
                margin: 0;
                font-family: Arial, Helvetica, sans-serif;
                font-size: 22px;
                font-weight: 700;
                color: #111827;
                line-height: 1.3;
              ">${title}</h1>
            </td>
          </tr>

          <!-- Body message -->
          <tr>
            <td style="padding: 20px 40px 8px; text-align:center;">
              <p style="
                margin: 0;
                font-family: Arial, Helvetica, sans-serif;
                font-size: 15px;
                line-height: 1.6;
                color: #4b5563;
              ">${message}</p>
            </td>
          </tr>

          ${highlightBlock}
          ${buttonBlock}

          <!-- Divider -->
          <tr>
            <td style="padding: 32px 40px 0;">
              <hr style="border:none; border-top:1px solid #e5e7eb;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 32px; text-align:center;">
              <p style="
                margin: 0;
                font-family: Arial, Helvetica, sans-serif;
                font-size: 12px;
                color: #9ca3af;
                line-height: 1.6;
              ">${footerNote}</p>
              <p style="
                margin: 8px 0 0;
                font-family: Arial, Helvetica, sans-serif;
                font-size: 12px;
                color: #d1d5db;
              ">&copy; ${new Date().getFullYear()} SplytFlow. All rights reserved.</p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>
</body>
</html>`;
}
