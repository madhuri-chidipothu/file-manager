import { UNPROCESSABLE_ENTITY } from "../constants/httpStatusCodes";
import { UNPROCESSABLE_ENTITY as UNPROCESSABLE_ENTITY_MESSAGE } from "../constants/httpStatusPhrases";
import BaseException from "./baseException";

export default class UnprocessableEntityException extends BaseException {
  constructor(message?: string, errData?: Record<string, string> | null) {
    super(UNPROCESSABLE_ENTITY, message || UNPROCESSABLE_ENTITY_MESSAGE, "UnprocessableEntityException", true, errData);
  }
}
