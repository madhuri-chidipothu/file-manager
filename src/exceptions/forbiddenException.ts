import { FORBIDDEN } from "../constants/httpStatusCodes";
import { FORBIDDEN as FORBIDDEN_MESSAGE } from "../constants/httpStatusPhrases";
import BaseException from "./baseException";

export default class ForbiddenException extends BaseException {
  constructor(message?: string, errData?: Record<string, string> | null) {
    super(FORBIDDEN, message || FORBIDDEN_MESSAGE, "ForbiddenException", true, errData);
  }
}
