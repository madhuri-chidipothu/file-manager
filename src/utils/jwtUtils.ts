import { SignJWT, jwtVerify } from "jose";

const accessSecret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET ?? "changeme_access");
const refreshSecret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET ?? "changeme_refresh");

const ACCESS_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY ?? "15m";
const REFRESH_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY ?? "7d";

export interface JwtPayload {
  userId: number;
}

export const genJWTTokensForUser = async (userId: number): Promise<{ access_token: string; refresh_token: string }> => {
  const [access_token, refresh_token] = await Promise.all([
    new SignJWT({ userId })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(ACCESS_EXPIRY)
      .sign(accessSecret),
    new SignJWT({ userId })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(REFRESH_EXPIRY)
      .sign(refreshSecret),
  ]);
  return { access_token, refresh_token };
};

export const verifyAccessJwt = async (token: string): Promise<JwtPayload> => {
  const { payload } = await jwtVerify(token, accessSecret);
  return payload as unknown as JwtPayload;
};

export const verifyRefreshJwt = async (token: string): Promise<JwtPayload> => {
  const { payload } = await jwtVerify(token, refreshSecret);
  return payload as unknown as JwtPayload;
};
