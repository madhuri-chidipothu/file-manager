import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export const sendResponse = (c: Context, status: ContentfulStatusCode, message: string, data?: unknown) =>
  c.json({ success: true, message, data }, status);
