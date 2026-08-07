import Link from "next/link";
import { BlogDetailView } from "@/modules/storefront/components/blog-detail-view";
import type { StorefrontBlog } from "@/modules/storefront/types/blog";

interface BlogPreviewViewProps {
  blog: StorefrontBlog;
  editorHref: string;
  isPublished: boolean;
}

export function BlogPreviewView({
  blog,
  editorHref,
  isPublished,
}: BlogPreviewViewProps) {
  return (
    <>
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-950">
        <span className="font-medium">Preview</span>
        {" — "}
        {isPublished
          ? "This is how your post looks on the site."
          : "This post is not published yet."}{" "}
        <Link href={editorHref} className="font-medium underline underline-offset-2">
          Back to editor
        </Link>
      </div>
      <BlogDetailView blog={blog} />
    </>
  );
}
