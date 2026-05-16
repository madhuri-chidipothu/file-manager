import type { StatusCode } from "hono/utils/http-status";

export default class BaseException extends Error {
  status: StatusCode;
  isOperational: boolean;
  errData: Record<string, string> | null | undefined;

  constructor(
    status: StatusCode,
    message: string,
    name: string,
    isOperational: boolean,
    errData?: Record<string, string> | null,
  ) {
    super(message);
    this.status = status;
    this.name = name;
    this.isOperational = isOperational;
    this.errData = errData;
  }
}
