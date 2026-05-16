import { UNAUTHORIZED } from "../constants/httpStatusCodes";
import { UNAUTHORIZED as UNAUTHORIZED_MESSAGE } from "../constants/httpStatusPhrases";
import BaseException from "./baseException";

export default class UnAuthorizedException extends BaseException {
  constructor(message?: string, errData?: Record<string, string> | null) {
    super(UNAUTHORIZED, message || UNAUTHORIZED_MESSAGE, "UnAuthorizedException", true, errData);
  }
}
