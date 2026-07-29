import type { BlogCategoryRow, BlogRow } from "@/modules/common/types/database";
import type { StorefrontBlog, StorefrontBlogCategory } from "../types/blog";

export type StorefrontBlogRow = BlogRow & {
  blog_categories: Pick<BlogCategoryRow, "id" | "name"> | null;
};

export const STOREFRONT_BLOG_SELECT = `
  *,
  blog_categories (
    id,
    name
  )
`;

export function mapStorefrontBlog(row: StorefrontBlogRow): StorefrontBlog {
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

export function mapStorefrontBlogCategory(
  row: BlogCategoryRow,
): StorefrontBlogCategory {
  return {
    id: row.id,
    name: row.name,
  };
}
