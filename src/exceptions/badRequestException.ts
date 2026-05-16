import { BAD_REQUEST } from "../constants/httpStatusCodes";
import { BAD_REQUEST as BAD_REQUEST_MESSAGE } from "../constants/httpStatusPhrases";
import BaseException from "./baseException";

export default class BadRequestException extends BaseException {
  constructor(message?: string, errData?: Record<string, string> | null) {
    super(BAD_REQUEST, message || BAD_REQUEST_MESSAGE, "BadRequestException", true, errData);
  }
}
