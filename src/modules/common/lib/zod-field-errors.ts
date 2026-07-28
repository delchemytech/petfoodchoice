import type { ZodError } from "zod";

export function zodFieldErrors<T extends string>(
  error: ZodError,
): Partial<Record<T, string>> {
  const errors: Partial<Record<T, string>> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key as T]) {
      errors[key as T] = issue.message;
    }
  }

  return errors;
}
