import { otps } from "../db/schema/index";
import {
  deleteRecordsByAColumnValue,
  getSingleRecordByAColumnValue,
  saveRecord,
  updateRecordById,
} from "./baseDbServices";

export interface OtpData {
  email: string;
  otp: string;
  expiresAt: Date;
}

export const createOTP = async (otpData: OtpData) => {
  // Invalidate any existing OTPs for this email
  await deleteRecordsByAColumnValue(otps, "email", otpData.email);
  return saveRecord(otps, otpData);
};

export const fetchOtp = async (email: string) =>
  getSingleRecordByAColumnValue(otps, "email", "=", email);

export const markOtpAsUsed = async (id: number) =>
  updateRecordById(otps, id, { isUsed: true });
