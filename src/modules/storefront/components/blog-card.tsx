import Link from "next/link";
import Image from "next/image";
import type { StorefrontBlog } from "../types/blog";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

interface BlogCardProps {
  blog: StorefrontBlog;
  priority?: boolean;
}

export function BlogCard({ blog, priority = false }: BlogCardProps) {
  return (
    <Link href={`/blogs/${blog.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative aspect-[16/10] overflow-hidden bg-[#f3ecdf]">
          {blog.coverImageUrl ? (
            <Image
              src={blog.coverImageUrl}
              alt={blog.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              loading={priority ? "eager" : "lazy"}
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
              No cover image
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            {formatDate(blog.createdAt)}
          </p>
          <h2 className="line-clamp-2 font-heading text-2xl leading-snug font-semibold">
            {blog.title}
          </h2>
          <p className="mt-auto text-sm font-medium text-primary">
            Read article
          </p>
        </div>
      </article>
    </Link>
  );
}
