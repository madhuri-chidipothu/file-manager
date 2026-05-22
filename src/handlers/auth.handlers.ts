import { eq } from "drizzle-orm";
import factory from "../factory";
import { db } from "../db/client";
import { users, otps, tokens } from "../db/schema/index";
import { validateRequestBody } from "../helpers/validationHelpers";
import { prepareOTPData } from "../helpers/otpHelpers";
import { sendOtpEmail } from "../helpers/brevo.helper";
import { createOTP, fetchOtp, markOtpAsUsed } from "../services/otpServices";
import {
  saveRecord,
  getSingleRecordByAColumnValue,
  getRecordByPrimaryKey,
  updateRecordById,
  deleteRecordById,
  deleteRecordsByAColumnValue,
} from "../services/baseDbServices";
import { genJWTTokensForUser, verifyRefreshJwt } from "../utils/jwtUtils";
import { sendResponse } from "../utils/sendResponse";
import { authMiddleware } from "../middlewares/auth.middleware";
import { sendOtpSchema, verifyOtpSchema, refreshSchema, updateProfileSchema } from "../validators/auth.validator";
import { OK } from "../constants/httpStatusCodes";
import {
  SENT_OTP_SUCCESSFULLY,
  INVALID_OTP,
  NAME_REQUIRED,
  USER_LOGIN,
  LOGGED_OUT,
  TOKEN_REFRESHED,
  USER_DETAILS,
} from "../constants/appMessages";
import BadRequestException from "../exceptions/badRequestException";
import NotFoundException from "../exceptions/notFoundException";
import UnAuthorizedException from "../exceptions/unAuthorizedException";

export class AuthHandlers {
  sendOtp = factory.createHandlers(async (c) => {
    const reqData = await c.req.json();
    const { newEmail } = validateRequestBody(sendOtpSchema, reqData);

    let user = await getSingleRecordByAColumnValue(users, "email", "=", newEmail);
    let is_new_user = false;

    if (!user) {
      user = await saveRecord(users, { email: newEmail });
      is_new_user = true;
    }

    const otpData = prepareOTPData(newEmail);
    await createOTP(otpData);
    if (process.env.BREVO_API_KEY && process.env.BREVO_FROM_EMAIL) {
      await sendOtpEmail(newEmail, user.name ?? null, otpData.otp);
    } else {
      console.log(`[DEV] OTP for ${newEmail}: ${otpData.otp}`);
    }

    return sendResponse(c, OK, SENT_OTP_SUCCESSFULLY, { is_new_user, needs_name: !user.isVerified });
  });

  verifyOtp = factory.createHandlers(async (c) => {
    const reqData = await c.req.json();
    const { email, otp, firstName, lastName } = validateRequestBody(verifyOtpSchema, reqData);

    const user = await getSingleRecordByAColumnValue(users, "email", "=", email);
    if (!user) throw new NotFoundException("User not found");

    const otpRecord = await fetchOtp(email);
    if (!otpRecord) throw new BadRequestException(INVALID_OTP);
    if (otpRecord.isUsed) throw new BadRequestException(INVALID_OTP);
    if (otpRecord.expiresAt < new Date()) throw new BadRequestException(INVALID_OTP);
    if (otp !== otpRecord.otp) throw new BadRequestException(INVALID_OTP);

    if (!user.isVerified && (!firstName || !lastName)) throw new BadRequestException(NAME_REQUIRED);

    // Mark as used first — prevents reuse even if the subsequent delete fails
    await markOtpAsUsed(otpRecord.id);
    await deleteRecordById(otps, otpRecord.id);

    if (!user.isVerified) {
      await updateRecordById(users, user.id, {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        isVerified: true,
        updatedAt: new Date(),
      });
    }

    const { access_token, refresh_token } = await genJWTTokensForUser(user.id);
    await saveRecord(tokens, { userId: user.id, accessToken: access_token, refreshToken: refresh_token });

    const userDetails = await getRecordByPrimaryKey(users, user.id);
    return sendResponse(c, OK, USER_LOGIN, { user_details: userDetails, access_token, refresh_token });
  });

  refresh = factory.createHandlers(async (c) => {
    const reqData = await c.req.json();
    const { refresh_token } = validateRequestBody(refreshSchema, reqData);

    let payload;
    try {
      payload = await verifyRefreshJwt(refresh_token);
    } catch {
      throw new UnAuthorizedException("Invalid or expired refresh token");
    }

    const tokenRecord = await db.query.tokens.findFirst({
      where: eq(tokens.refreshToken, refresh_token),
    });
    if (!tokenRecord) throw new UnAuthorizedException("Invalid or expired refresh token");

    const { access_token, refresh_token: newRefreshToken } = await genJWTTokensForUser(payload.userId);
    await updateRecordById(tokens, tokenRecord.id, {
      accessToken: access_token,
      refreshToken: newRefreshToken,
    });

    return sendResponse(c, OK, TOKEN_REFRESHED, { access_token, refresh_token: newRefreshToken });
  });

  logout = factory.createHandlers(authMiddleware, async (c) => {
    const user = c.get("user_payload");
    await deleteRecordsByAColumnValue(tokens, "userId", user.id);
    return sendResponse(c, OK, LOGGED_OUT);
  });

  me = factory.createHandlers(authMiddleware, async (c) => {
    const user = c.get("user_payload");
    return sendResponse(c, OK, USER_DETAILS, user);
  });

  updateProfile = factory.createHandlers(authMiddleware, async (c) => {
    const user = c.get("user_payload");
    const reqData = await c.req.json();
    const { firstName, lastName } = validateRequestBody(updateProfileSchema, reqData);

    await updateRecordById(users, user.id, {
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      updatedAt: new Date(),
    });

    const updated = await getRecordByPrimaryKey(users, user.id);
    return sendResponse(c, OK, USER_DETAILS, updated);
  });
}
