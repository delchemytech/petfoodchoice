import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required.")
    .max(50, "Category name must be 50 characters or less.")
    .refine(
      (value) => value.replace(/\s+/g, " ").length > 0,
      "Category name is required.",
    ),
});

export function parseCategoryName(name: string) {
  return categoryFormSchema.safeParse({ name });
}
