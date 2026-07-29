import { z } from "zod";

export const blogSlugSchema = z
  .string()
  .trim()
  .min(1, "URL slug is required.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and hyphens only (e.g. best-dog-food).",
  );

export const blogFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  slug: blogSlugSchema,
  content: z
    .string()
    .min(1, "Blog content is required.")
    .refine((html) => html.replace(/<[^>]*>/g, "").trim().length > 0, {
      message: "Blog content is required.",
    }),
  coverImageUrl: z
    .string()
    .trim()
    .min(1, "Cover image is required.")
    .refine(
      (value) =>
        value.startsWith("data:image/") ||
        value.startsWith("http://") ||
        value.startsWith("https://"),
      "Cover image is required.",
    ),
  categoryId: z.string().uuid("Please select a blog category."),
});

export function parseBlogFormValues(values: {
  title: string;
  slug: string;
  content: string;
  coverImageUrl: string;
  categoryId: string;
}) {
  return blogFormSchema.safeParse({
    title: values.title,
    slug: values.slug.trim().toLowerCase(),
    content: values.content,
    coverImageUrl: values.coverImageUrl,
    categoryId: values.categoryId,
  });
}

export function slugifyTitle(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
