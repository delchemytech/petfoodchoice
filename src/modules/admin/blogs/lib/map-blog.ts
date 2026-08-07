import type { BlogCategoryRow, BlogRow } from "@/modules/common/types/database";
import type { BlogInsert } from "@/modules/common/types/database";
import {
  applySeoDefaults,
  ensureSchemaJsonLd,
  parseSchemaJsonLdInput,
} from "./blog-seo";
import type { Blog, BlogFormValues, BlogSaveMode } from "../types";

export type BlogRowWithCategory = BlogRow & {
  blog_categories: Pick<BlogCategoryRow, "id" | "name"> | null;
};

export const BLOG_SELECT = `
  *,
  blog_categories (
    id,
    name
  )
`;

function mapSchemaJsonLdToString(value: BlogRow["schema_json_ld"]) {
  if (!value) return "";
  return JSON.stringify(value, null, 2);
}

export function mapBlogRow(row: BlogRowWithCategory): Blog {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    coverImageUrl: row.cover_image_url,
    categoryId: row.category_id ?? row.blog_categories?.id ?? null,
    categoryName: row.blog_categories?.name ?? null,
    published: row.published,
    publishedAt: row.published_at,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    canonicalUrl: row.canonical_url,
    robotsMeta: row.robots_meta,
    h1: row.h1,
    schemaJsonLd: mapSchemaJsonLdToString(row.schema_json_ld),
    author: row.author,
    featuredImageAlt: row.featured_image_alt,
    includeInSitemap: row.include_in_sitemap,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapBlogToFormValues(blog: Blog): BlogFormValues {
  return {
    title: blog.title,
    slug: blog.slug,
    content: blog.content,
    coverImageUrl: blog.coverImageUrl ?? "",
    categoryId: blog.categoryId ?? "",
    h1: blog.h1 ?? "",
    metaTitle: blog.metaTitle ?? "",
    metaDescription: blog.metaDescription ?? "",
    canonicalUrl: blog.canonicalUrl ?? "",
    robotsMeta: blog.robotsMeta || "index,follow",
    schemaJsonLd: blog.schemaJsonLd,
    author: blog.author ?? "",
    featuredImageAlt: blog.featuredImageAlt ?? "",
    includeInSitemap: blog.includeInSitemap,
  };
}

export function createEmptyBlogFormValues(): BlogFormValues {
  return {
    title: "",
    slug: "",
    content: "<p></p>",
    coverImageUrl: "",
    categoryId: "",
    h1: "",
    metaTitle: "",
    metaDescription: "",
    canonicalUrl: "",
    robotsMeta: "index,follow",
    schemaJsonLd: "",
    author: "",
    featuredImageAlt: "",
    includeInSitemap: true,
  };
}

function buildSeoPayload(
  values: BlogFormValues,
  options: {
    publish: boolean;
    publishedAt: string | null;
    updatedAt: string;
  },
) {
  const withDefaults = applySeoDefaults(values);
  const schemaJsonLdString = ensureSchemaJsonLd(
    withDefaults,
    options.publish ? options.publishedAt || options.updatedAt : null,
    options.updatedAt,
  );

  return {
    meta_title: withDefaults.metaTitle,
    meta_description: withDefaults.metaDescription,
    canonical_url: withDefaults.canonicalUrl,
    robots_meta: withDefaults.robotsMeta,
    h1: withDefaults.h1,
    schema_json_ld: parseSchemaJsonLdInput(schemaJsonLdString),
    author: withDefaults.author || null,
    featured_image_alt: withDefaults.featuredImageAlt || null,
    include_in_sitemap: withDefaults.includeInSitemap,
  };
}

export function mapFormToInsert(
  values: BlogFormValues,
  mode: BlogSaveMode,
): BlogInsert {
  const publish = mode === "publish";
  const now = new Date().toISOString();
  const withDefaults = applySeoDefaults(values);

  return {
    title: withDefaults.title.trim(),
    slug: withDefaults.slug,
    content: withDefaults.content,
    cover_image_url: withDefaults.coverImageUrl.trim() || null,
    category_id: withDefaults.categoryId || null,
    published: publish,
    published_at: publish ? now : null,
    delete: false,
    ...buildSeoPayload(withDefaults, {
      publish,
      publishedAt: publish ? now : null,
      updatedAt: now,
    }),
  };
}

export function mapFormToUpdate(
  values: BlogFormValues,
  mode: BlogSaveMode,
  existing: Blog,
): Omit<BlogInsert, "delete"> {
  const publish = mode === "publish";
  const now = new Date().toISOString();
  const withDefaults = applySeoDefaults(values);
  const published = publish;
  const publishedAt =
    publish && !existing.publishedAt ? now : existing.publishedAt;

  return {
    title: withDefaults.title.trim(),
    slug: withDefaults.slug,
    content: withDefaults.content,
    cover_image_url: withDefaults.coverImageUrl.trim() || null,
    category_id: withDefaults.categoryId || null,
    published,
    published_at: publishedAt,
    ...buildSeoPayload(withDefaults, {
      publish: published,
      publishedAt,
      updatedAt: now,
    }),
  };
}
