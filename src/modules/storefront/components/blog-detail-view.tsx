import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import type { StorefrontBlog } from "../types/blog";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

interface BlogDetailViewProps {
  blog: StorefrontBlog;
}

export function BlogDetailView({ blog }: BlogDetailViewProps) {
  return (
    <article className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/blogs"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to blogs
      </Link>

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          <span>{formatDate(blog.createdAt)}</span>
          {blog.categoryName ? (
            <>
              <span aria-hidden>·</span>
              <span className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-foreground">
                {blog.categoryName}
              </span>
            </>
          ) : null}
        </div>
        <h1 className="font-heading text-4xl leading-tight font-semibold sm:text-5xl">
          {blog.title}
        </h1>
      </header>

      {blog.coverImageUrl ? (
        <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-3xl bg-[#f3ecdf]">
          <Image
            src={blog.coverImageUrl}
            alt={blog.title}
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
            priority
          />
        </div>
      ) : null}

      <div
        className="blog-content mt-10"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
    </article>
  );
}
