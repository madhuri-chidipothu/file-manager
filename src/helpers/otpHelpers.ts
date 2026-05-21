import { randomInt } from "crypto";

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES ?? 10);

export const generateOtp = (): string => randomInt(100000, 1000000).toString();

export const prepareOTPData = (email: string) => ({
  email,
  otp: generateOtp(),
  expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
});
