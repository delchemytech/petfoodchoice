import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStorefrontBlogBySlug } from "@/modules/storefront/actions/get-blog";
import { BlogDetailView } from "@/modules/storefront/components/blog-detail-view";

export const dynamic = "force-dynamic";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getStorefrontBlogBySlug(slug);

  if (!blog) {
    return { title: "Blog not found | PETFOODCHOICE" };
  }

  return {
    title: `${blog.title} | PETFOODCHOICE`,
    description: blog.title,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const blog = await getStorefrontBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  return <BlogDetailView blog={blog} />;
}
