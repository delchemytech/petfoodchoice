import { notFound } from "next/navigation";
import { getBlogCategories } from "@/modules/admin/blog-categories/actions/get-blog-categories";
import { getBlog } from "../../actions/get-blog";
import { BlogForm } from "../../components/blog-form";

export const dynamic = "force-dynamic";

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params;
  const [blog, categories] = await Promise.all([
    getBlog(id),
    getBlogCategories(),
  ]);

  if (!blog) {
    notFound();
  }

  return <BlogForm formMode="edit" blog={blog} categories={categories} />;
}
