export interface StorefrontBlogCategory {
  id: string;
  name: string;
}

export interface StorefrontBlog {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImageUrl: string | null;
  categoryId: string | null;
  categoryName: string | null;
  createdAt: string;
  updatedAt: string;
}
