"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import type { StorefrontBlog, StorefrontBlogCategory } from "../types/blog";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

interface BlogsCatalogProps {
  blogs: StorefrontBlog[];
  categories: StorefrontBlogCategory[];
}

export function BlogsCatalog({ blogs, categories }: BlogsCatalogProps) {
  const [activeCategoryId, setActiveCategoryId] = useState("all");

  const filterOptions = useMemo(
    () => [{ id: "all", name: "All" }, ...categories],
    [categories],
  );

  const filteredBlogs = useMemo(() => {
    if (activeCategoryId === "all") return blogs;

    return blogs.filter((blog) => blog.categoryId === activeCategoryId);
  }, [activeCategoryId, blogs]);

  const emptyMessage =
    blogs.length === 0
      ? "No blog posts yet. Check back soon."
      : "No blog posts in this category yet.";

  return (
    <>
      {categories.length > 0 ? (
        <div className="mb-8 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filterOptions.map((category) => {
            const isActive = category.id === activeCategoryId;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategoryId(category.id)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      ) : null}

      {filteredBlogs.length === 0 ? (
        <div className="rounded-3xl border border-dashed px-6 py-16 text-center text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:gap-5">
          {filteredBlogs.map((blog, index) => (
            <Link
              key={blog.id}
              href={`/blogs/${blog.slug}`}
              className="group flex flex-col gap-4 rounded-3xl border border-border/80 bg-card p-5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:gap-6 sm:p-6"
            >
              <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-2xl bg-[#f3ecdf] sm:w-48">
                {blog.coverImageUrl ? (
                  <Image
                    src={blog.coverImageUrl}
                    alt={blog.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 192px"
                    priority={index < 2}
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                    No image
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  <span>{formatDate(blog.createdAt)}</span>
                  {blog.categoryName ? (
                    <>
                      <span aria-hidden>·</span>
                      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-foreground">
                        {blog.categoryName}
                      </span>
                    </>
                  ) : null}
                </div>
                <h2 className="font-heading text-2xl leading-snug font-semibold group-hover:text-primary">
                  {blog.title}
                </h2>
                <p className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Read article
                  <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
