export interface Blog {
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

export interface BlogFormValues {
  title: string;
  slug: string;
  content: string;
  coverImageUrl: string;
  categoryId: string;
}
