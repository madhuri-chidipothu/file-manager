import { BrevoClient } from "@getbrevo/brevo";

let client: BrevoClient | null = null;

const getClient = (): BrevoClient => {
  if (!client) {
    client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY! });
  }
  return client;
};

export const sendOtpEmail = async (
  toEmail: string,
  toName: string | null,
  otp: string
): Promise<void> => {
  await getClient().transactionalEmails.sendTransacEmail({
    to: [{ email: toEmail, name: toName ?? toEmail }],
    sender: {
      email: process.env.BREVO_FROM_EMAIL!,
      name: process.env.BREVO_FROM_NAME ?? "File Manager",
    },
    subject: "Your verification code",
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Verification Code</h2>
        <p>Use the code below to verify your identity. It expires in ${process.env.OTP_EXPIRY_MINUTES ?? 10} minutes.</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 16px 0;">${otp}</div>
        <p style="color: #666; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};
