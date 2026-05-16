import type { StatusCode } from "hono/utils/http-status";

import BaseException from "./baseException";

class S3ErrorException extends BaseException {
  constructor(status: StatusCode, message: string, errData?: Record<string, string> | null, isOperational = true) {
    super(status, message, "S3ErrorException", isOperational, errData);
  }
}

export default S3ErrorException;
