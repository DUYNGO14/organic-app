import type { FieldError, FieldErrors, FieldValues, Resolver } from "react-hook-form";
import type { ZodType } from "zod";

export function createAuthFormResolver<Input extends FieldValues, Output = Input>(
  schema: ZodType<Output>,
): Resolver<Input, unknown, Output> {
  return (values) => {
    const result = schema.safeParse(values);
    if (result.success) return { values: result.data, errors: {} };

    const errors: Record<string, FieldError> = {};
    for (const issue of result.error.issues) {
      const [field] = issue.path;
      if (typeof field === "string" && !Object.hasOwn(errors, field)) {
        errors[field] = { type: issue.code, message: issue.message };
      }
    }

    return { values: {}, errors: errors as FieldErrors<Input> };
  };
}
