export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImageUrl: string | null;
  categoryId: string | null;
  categoryName: string | null;
  published: boolean;
  publishedAt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  robotsMeta: string;
  h1: string | null;
  schemaJsonLd: string;
  author: string | null;
  featuredImageAlt: string | null;
  includeInSitemap: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogFormValues {
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
}

export type BlogSaveMode = "draft" | "publish";
