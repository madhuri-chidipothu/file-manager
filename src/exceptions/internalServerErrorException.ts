import { INTERNAL_SERVER_ERROR } from "../constants/httpStatusCodes";
import { INTERNAL_SERVER_ERROR as INTERNAL_SERVER_ERROR_MESSAGE } from "../constants/httpStatusPhrases";
import BaseException from "./baseException";

export default class InternalServerErrorException extends BaseException {
  constructor(message?: string, errData?: Record<string, string> | null) {
    super(INTERNAL_SERVER_ERROR, message || INTERNAL_SERVER_ERROR_MESSAGE, "InternalServerErrorException", true, errData);
  }
}
