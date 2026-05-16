import { NOT_FOUND } from "../constants/httpStatusCodes";
import { NOT_FOUND as NOT_FOUND_MESSAGE } from "../constants/httpStatusPhrases";
import BaseException from "./baseException";

export default class NotFoundException extends BaseException {
  constructor(message?: string, errData?: Record<string, string> | null) {
    super(NOT_FOUND, message || NOT_FOUND_MESSAGE, "NotFoundException", true, errData);
  }
}
