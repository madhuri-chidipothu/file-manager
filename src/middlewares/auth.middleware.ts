import factory from "../factory";
import { verifyAccessJwt } from "../utils/jwtUtils";
import { getSingleRecordByAColumnValue } from "../services/baseDbServices";
import { users } from "../db/schema/index";
import UnAuthorizedException from "../exceptions/unAuthorizedException";

export const authMiddleware = factory.createMiddleware(async (c, next) => {
  const authorization = c.req.header("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new UnAuthorizedException("Missing or invalid authorization header");
  }

  let payload;
  try {
    payload = await verifyAccessJwt(authorization.slice(7));
  } catch {
    throw new UnAuthorizedException("Invalid or expired access token");
  }

  const user = await getSingleRecordByAColumnValue(users, "id", "=", payload.userId);
  if (!user) throw new UnAuthorizedException("User not found");

  c.set("user_payload", user);
  await next();
});
