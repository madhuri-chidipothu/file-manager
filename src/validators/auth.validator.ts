import { z } from "zod";

export const sendOtpSchema = z.object({
  newEmail: z.string().email(),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(4).regex(/^\d{4}$/),
  name: z.string().min(1).max(255).optional(),
});

export const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

export const logoutSchema = z.object({
  refresh_token: z.string().min(1),
});
