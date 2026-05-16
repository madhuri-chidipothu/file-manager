import type { ZodTypeAny } from "zod";
import UnprocessableEntityException from "../exceptions/unprocessableEntityException";

export const validateRequestBody = <T extends ZodTypeAny>(
  schema: T,
  body: unknown
): T["_output"] => {
  const result = schema.safeParse(body);
  if (!result.success) {
    const errData = result.error.issues.reduce<Record<string, string>>((acc, issue) => {
      acc[String(issue.path?.[0])] = issue.message;
      return acc;
    }, {});
    throw new UnprocessableEntityException("Validation error", errData);
  }
  return result.data;
};
