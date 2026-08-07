import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/modules/auth/lib/require-admin";
import { getBlog } from "@/modules/admin/blogs/actions/get-blog";
import { BlogPreviewView } from "@/modules/admin/blogs/components/blog-preview-view";
import { mapBlogToStorefrontBlog } from "@/modules/admin/blogs/lib/map-blog-to-storefront";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog preview | PETFOODCHOICE",
  robots: {
    index: false,
    follow: false,
  },
};

interface BlogPreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function BlogPreviewPage({ params }: BlogPreviewPageProps) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const blog = await getBlog(id);

  if (!blog) {
    notFound();
  }

  return (
    <BlogPreviewView
      blog={mapBlogToStorefrontBlog(blog)}
      editorHref={`/admin/blogs/edit/${id}`}
      isPublished={blog.published}
    />
  );
}
