import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import BaseException from "../exceptions/baseException";

export const onError = (err: Error, c: Context) => {
  if (err instanceof BaseException) {
    return c.json({ success: false, message: err.message, errors: err.errData ?? null }, err.status as ContentfulStatusCode);
  }
  console.error(err);
  const isDev = process.env.NODE_ENV === "development";
  return c.json({ success: false, message: isDev ? err.message : "Internal server error", errors: isDev ? err.stack : null }, 500);
};
