import { z } from "zod";

export const blogSlugSchema = z
  .string()
  .trim()
  .min(1, "URL slug is required.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and hyphens only (e.g. best-dog-food).",
  );

const robotsMetaSchema = z.enum([
  "index,follow",
  "noindex,follow",
  "index,nofollow",
  "noindex,nofollow",
]);

const optionalUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      !value || value.startsWith("http://") || value.startsWith("https://"),
    "Canonical URL must start with http:// or https://",
  );

const sharedFields = {
  title: z.string().trim().min(1, "Title is required."),
  slug: blogSlugSchema,
  content: z.string(),
  coverImageUrl: z.string().trim(),
  categoryId: z
    .string()
    .uuid("Please select a blog category.")
    .or(z.literal("")),
  h1: z.string().trim(),
  metaTitle: z.string().trim(),
  metaDescription: z
    .string()
    .trim()
    .max(320, "Meta description must be 320 characters or less."),
  canonicalUrl: optionalUrlSchema,
  robotsMeta: robotsMetaSchema,
  schemaJsonLd: z.string().trim(),
  author: z.string().trim().max(120, "Author must be 120 characters or less."),
  featuredImageAlt: z
    .string()
    .trim()
    .max(200, "Image alt text must be 200 characters or less."),
  includeInSitemap: z.boolean(),
};

export const blogDraftFormSchema = z.object(sharedFields);

export const blogPublishFormSchema = z.object({
  ...sharedFields,
  categoryId: z.string().uuid("Please select a blog category."),
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
  metaTitle: z.string().trim().min(1, "Meta title is required."),
  metaDescription: z
    .string()
    .trim()
    .min(1, "Meta description is required.")
    .max(320, "Meta description must be 320 characters or less."),
  featuredImageAlt: z
    .string()
    .trim()
    .min(1, "Featured image alt text is required.")
    .max(200, "Image alt text must be 200 characters or less."),
});

export type BlogFormInput = z.infer<typeof blogPublishFormSchema>;

export type BlogFormValuesInput = {
  title: string;
  slug: string;
  content: string;
  coverImageUrl: string;
  categoryId: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  robotsMeta: string;
  schemaJsonLd: string;
  author: string;
  featuredImageAlt: string;
  includeInSitemap: boolean;
};

function normalizeInput(values: BlogFormValuesInput) {
  const title = values.title.trim();
  const slug =
    values.slug.trim().toLowerCase() || slugifyTitle(title) || "draft-post";

  return {
    ...values,
    title,
    slug,
    categoryId: values.categoryId || "",
  };
}

export function parseBlogDraftValues(values: BlogFormValuesInput) {
  return blogDraftFormSchema.safeParse(normalizeInput(values));
}

export function parseBlogPublishValues(values: BlogFormValuesInput) {
  return blogPublishFormSchema.safeParse(normalizeInput(values));
}

export function parseBlogFormValues(
  values: BlogFormValuesInput,
  mode: "draft" | "publish",
) {
  return mode === "draft"
    ? parseBlogDraftValues(values)
    : parseBlogPublishValues(values);
}

export function slugifyTitle(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
