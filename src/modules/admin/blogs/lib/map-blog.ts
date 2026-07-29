import type { BlogCategoryRow, BlogRow } from "@/modules/common/types/database";
import type { BlogInsert } from "@/modules/common/types/database";
import type { Blog, BlogFormValues } from "../types";

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

export function mapBlogRow(row: BlogRowWithCategory): Blog {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    coverImageUrl: row.cover_image_url,
    categoryId: row.category_id ?? row.blog_categories?.id ?? null,
    categoryName: row.blog_categories?.name ?? null,
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
  };
}

export function mapFormToInsert(values: BlogFormValues): BlogInsert {
  return {
    title: values.title.trim(),
    slug: values.slug.trim().toLowerCase(),
    content: values.content,
    cover_image_url: values.coverImageUrl.trim(),
    category_id: values.categoryId,
    delete: false,
  };
}

export function mapFormToUpdate(
  values: BlogFormValues,
): Omit<BlogInsert, "delete"> {
  return {
    title: values.title.trim(),
    slug: values.slug.trim().toLowerCase(),
    content: values.content,
    cover_image_url: values.coverImageUrl.trim(),
    category_id: values.categoryId,
  };
}
