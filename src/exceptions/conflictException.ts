import { CONFLICT } from "../constants/httpStatusCodes";
import { CONFLICT as CONFLICT_MESSAGE } from "../constants/httpStatusPhrases";
import BaseException from "./baseException";

export default class ConflictException extends BaseException {
  constructor(message?: string, errData?: Record<string, string> | null) {
    super(CONFLICT, message || CONFLICT_MESSAGE, "ConflictException", true, errData);
  }
}
