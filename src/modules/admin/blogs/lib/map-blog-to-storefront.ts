import type { StorefrontBlog } from "@/modules/storefront/types/blog";
import type { Blog } from "../types";

export function mapBlogToStorefrontBlog(blog: Blog): StorefrontBlog {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    content: blog.content,
    coverImageUrl: blog.coverImageUrl,
    categoryId: blog.categoryId,
    categoryName: blog.categoryName,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
  };
}
