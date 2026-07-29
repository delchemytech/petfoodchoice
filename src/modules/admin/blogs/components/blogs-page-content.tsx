"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "../../components/page-header";
import { Button } from "@/modules/common/ui/button";
import { Input } from "@/modules/common/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/common/ui/table";
import { deleteBlog } from "../actions/delete-blog";
import type { Blog } from "../types";
import { DeleteBlogDialog } from "./delete-blog-dialog";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

interface BlogsPageContentProps {
  initialBlogs: Blog[];
}

export function BlogsPageContent({ initialBlogs }: BlogsPageContentProps) {
  const [blogs, setBlogs] = useState(initialBlogs);
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const filteredBlogs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return blogs;

    return blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(normalized) ||
        blog.slug.toLowerCase().includes(normalized) ||
        (blog.categoryName?.toLowerCase().includes(normalized) ?? false),
    );
  }, [blogs, query]);

  function handleDelete() {
    if (!deleteTarget) return;

    startDeleteTransition(async () => {
      try {
        await deleteBlog(deleteTarget.id);
        setBlogs((current) =>
          current.filter((blog) => blog.id !== deleteTarget.id),
        );
        setDeleteTarget(null);
      } catch (error) {
        console.error(error);
      }
    });
  }

  const emptyMessage =
    blogs.length === 0
      ? "No blogs yet. Publish your first post to get started."
      : "No blogs match your search.";

  return (
    <>
      <PageHeader
        title="Blogs"
        description="Write and publish blog posts for your storefront."
        actions={
          <Button
            className="w-full sm:w-auto"
            render={<Link href="/admin/blogs/add" />}
          >
            <Plus data-icon="inline-start" />
            New Blog
          </Button>
        }
      />

      <Input
        placeholder="Search by title or slug..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="max-w-md"
      />

      <div className="space-y-3 lg:hidden">
        {filteredBlogs.length === 0 ? (
          <div className="rounded-xl border px-4 py-10 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          filteredBlogs.map((blog) => (
            <div
              key={blog.id}
              className="flex gap-3 rounded-xl border p-3"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                {blog.coverImageUrl ? (
                  <Image
                    src={blog.coverImageUrl}
                    alt={blog.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="space-y-1">
                  <p className="line-clamp-2 font-medium leading-snug">
                    {blog.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    /blogs/{blog.slug} · {blog.categoryName ?? "No category"} ·{" "}
                    {formatDate(blog.createdAt)}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    nativeButton={false}
                    render={
                      <Link
                        href={`/blogs/${blog.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                    aria-label={`View ${blog.title}`}
                  >
                    <Eye />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    nativeButton={false}
                    render={<Link href={`/admin/blogs/edit/${blog.id}`} />}
                    aria-label={`Edit ${blog.title}`}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    aria-label={`Delete ${blog.title}`}
                    onClick={() =>
                      setDeleteTarget({ id: blog.id, title: blog.title })
                    }
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-hidden rounded-xl border lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Cover</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBlogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              filteredBlogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell>
                    <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                      {blog.coverImageUrl ? (
                        <Image
                          src={blog.coverImageUrl}
                          alt={blog.title}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[280px] whitespace-normal font-medium">
                    {blog.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {blog.categoryName ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    /blogs/{blog.slug}
                  </TableCell>
                  <TableCell>{formatDate(blog.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        nativeButton={false}
                        render={
                          <Link
                            href={`/blogs/${blog.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                        aria-label={`View ${blog.title}`}
                      >
                        <Eye />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        nativeButton={false}
                        render={<Link href={`/admin/blogs/edit/${blog.id}`} />}
                        aria-label={`Edit ${blog.title}`}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        aria-label={`Delete ${blog.title}`}
                        onClick={() =>
                          setDeleteTarget({ id: blog.id, title: blog.title })
                        }
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredBlogs.length} of {blogs.length} blogs
      </p>

      <DeleteBlogDialog
        open={!!deleteTarget}
        blogTitle={deleteTarget?.title ?? ""}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteTarget(null);
        }}
      />
    </>
  );
}
