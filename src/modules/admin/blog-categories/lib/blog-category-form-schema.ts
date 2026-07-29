import { z } from "zod";

export const blogCategoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required.")
    .max(80, "Category name must be 80 characters or less."),
});

export function parseBlogCategoryName(name: string) {
  return blogCategoryFormSchema.safeParse({ name });
}
