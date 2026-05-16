import { Hono } from "hono";
import { AuthHandlers } from "../handlers/auth.handlers";

export const auth = new Hono();
const handlers = new AuthHandlers();

auth.post("/login", ...handlers.sendOtp);
auth.post("/verify-otp", ...handlers.verifyOtp);
auth.post("/refresh", ...handlers.refresh);
auth.post("/logout", ...handlers.logout);
auth.get("/me", ...handlers.me);

export default auth;
