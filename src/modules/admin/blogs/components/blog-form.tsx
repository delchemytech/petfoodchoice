"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ExternalLink, Eye, Loader2 } from "lucide-react";
import { zodFieldErrors } from "@/modules/common/lib/zod-field-errors";
import { Badge } from "@/modules/common/ui/badge";
import { Button } from "@/modules/common/ui/button";
import { Input } from "@/modules/common/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/common/ui/select";
import type { BlogCategory } from "@/modules/admin/blog-categories/types";
import { createBlog } from "../actions/create-blog";
import { updateBlog } from "../actions/update-blog";
import { prepareBlogValuesClient } from "../lib/prepare-blog-values-client";
import { parseBlogFormValues, slugifyTitle } from "../lib/blog-form-schema";
import type { Blog, BlogFormValues, BlogSaveMode } from "../types";
import {
  createEmptyBlogFormValues,
  mapBlogToFormValues,
} from "../lib/map-blog";
import { BlogEditor } from "./blog-editor";
import { BlogImageUpload } from "./blog-image-upload";
import { BlogSeoPanel } from "./blog-seo-panel";
import { BlogSidebarPanel } from "./blog-sidebar-panel";

interface BlogFormProps {
  formMode?: "create" | "edit";
  blog?: Blog;
  categories: BlogCategory[];
}

export function BlogForm({
  formMode = "create",
  blog,
  categories,
}: BlogFormProps) {
  const router = useRouter();
  const [isSaving, startSaveTransition] = useTransition();
  const [isPreviewing, startPreviewTransition] = useTransition();
  const [saveMode, setSaveMode] = useState<BlogSaveMode>("publish");
  const [values, setValues] = useState<BlogFormValues>(() =>
    blog ? mapBlogToFormValues(blog) : createEmptyBlogFormValues(),
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(blog?.slug));
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof BlogFormValues, string>>
  >({});
  const [saveError, setSaveError] = useState<string | null>(null);

  function updateField<K extends keyof BlogFormValues>(
    key: K,
    value: BlogFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
    setSaveError(null);
  }

  function handleTitleChange(title: string) {
    setValues((current) => ({
      ...current,
      title,
      slug: slugTouched ? current.slug : slugifyTitle(title),
    }));
    setFieldErrors((current) => {
      if (!current.title) return current;
      const next = { ...current };
      delete next.title;
      return next;
    });
    setSaveError(null);
  }

  function handlePreview() {
    const parsed = parseBlogFormValues(values, "draft");
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }

    setFieldErrors({});
    setSaveError(null);

    startPreviewTransition(async () => {
      try {
        const prepared = await prepareBlogValuesClient(values);
        let previewId = blog?.id;

        if (formMode === "create") {
          const result = await createBlog(prepared, "draft");
          previewId = result.id;
          router.replace(`/admin/blogs/edit/${result.id}`);
        } else if (blog) {
          await updateBlog(blog.id, prepared, "draft");
          previewId = blog.id;
        }

        if (previewId) {
          window.open(
            `/blogs/preview/${previewId}`,
            "_blank",
            "noopener,noreferrer",
          );
        }
      } catch (error) {
        setSaveError(
          error instanceof Error
            ? error.message
            : "Failed to open preview. Please try again.",
        );
      }
    });
  }

  function handleSubmit(nextSaveMode: BlogSaveMode) {
    return (event: React.FormEvent) => {
      event.preventDefault();

      if (formMode === "create" && nextSaveMode === "publish") {
        return;
      }

      const parsed = parseBlogFormValues(values, nextSaveMode);
      if (!parsed.success) {
        setFieldErrors(zodFieldErrors(parsed.error));
        setSaveError(null);
        return;
      }

      setFieldErrors({});
      setSaveError(null);
      setSaveMode(nextSaveMode);

      startSaveTransition(async () => {
        try {
          const prepared = await prepareBlogValuesClient(values);

          if (formMode === "create") {
            const result = await createBlog(prepared, "draft");
            router.push(`/admin/blogs/edit/${result.id}`);
            router.refresh();
            return;
          }

          if (blog) {
            await updateBlog(blog.id, prepared, nextSaveMode);
          }

          router.push("/admin/blogs");
          router.refresh();
        } catch (error) {
          setSaveError(
            error instanceof Error
              ? error.message
              : nextSaveMode === "draft"
                ? "Failed to save draft. Please try again."
                : "Failed to publish blog. Please try again.",
          );
        }
      });
    };
  }

  const previewSlug = values.slug.trim() || "your-post-slug";
  const isDraft = blog ? !blog.published : true;
  const canPublish = formMode === "edit";
  const isPublishing = isSaving && saveMode === "publish";
  const isSavingDraft = isSaving && saveMode === "draft";
  const isBusy = isSaving || isPreviewing;

  return (
    <>
      <form
        onSubmit={handleSubmit(canPublish ? "publish" : "draft")}
        className="-mx-4 -mt-6 flex min-h-[calc(100vh-3.5rem)] flex-col bg-[#f0f0f1] md:-mx-6"
        noValidate
      >
        <div className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-[#c3c4c7] bg-white px-4 py-2.5 shadow-sm">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 rounded-sm px-2 text-[#2271b1] hover:bg-[#f0f0f1] hover:text-[#135e96]"
            nativeButton={false}
            render={<Link href="/admin/blogs" />}
          >
            <ChevronLeft className="size-4" />
            All blogs
          </Button>

          <div className="hidden h-5 w-px bg-[#c3c4c7] sm:block" />

          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-[#1d2327]">
              {formMode === "create" ? "Add new post" : "Edit post"}
            </p>
            {formMode === "edit" ? (
              <Badge variant={isDraft ? "secondary" : "default"}>
                {isDraft ? "Draft" : "Published"}
              </Badge>
            ) : null}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-sm border-[#c3c4c7] bg-white text-xs shadow-none"
              onClick={handlePreview}
              disabled={isBusy}
            >
              {isPreviewing ? (
                <>
                  <Loader2 className="animate-spin" data-icon="inline-start" />
                  Opening...
                </>
              ) : (
                <>
                  <Eye className="size-3.5" />
                  Preview
                </>
              )}
            </Button>

            {formMode === "edit" && blog?.slug && blog.published ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-sm border-[#c3c4c7] bg-white text-xs shadow-none"
                nativeButton={false}
                render={
                  <Link
                    href={`/blogs/${blog.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <ExternalLink className="size-3.5" />
                View live
              </Button>
            ) : null}

            <Button
              type="button"
              variant={canPublish ? "outline" : "default"}
              size="sm"
              disabled={isBusy}
              className={
                canPublish
                  ? "h-8 rounded-sm border-[#c3c4c7] bg-white text-xs shadow-none"
                  : "h-8 rounded-sm bg-[#2271b1] px-4 text-white hover:bg-[#135e96]"
              }
              onClick={handleSubmit("draft")}
            >
              {isSavingDraft ? (
                <>
                  <Loader2 className="animate-spin" data-icon="inline-start" />
                  Saving...
                </>
              ) : (
                "Save draft"
              )}
            </Button>

            {canPublish ? (
              <Button
                type="submit"
                size="sm"
                disabled={isBusy}
                className="h-8 rounded-sm bg-[#2271b1] px-4 text-white hover:bg-[#135e96]"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="animate-spin" data-icon="inline-start" />
                    Publishing...
                  </>
                ) : isDraft ? (
                  "Publish"
                ) : (
                  "Update"
                )}
              </Button>
            ) : null}
          </div>
        </div>

        {saveError ? (
          <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {saveError}
          </div>
        ) : null}

        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="overflow-hidden rounded-sm border border-[#c3c4c7] bg-white shadow-sm">
              <div className="border-b border-[#c3c4c7] px-6 py-5">
                <label htmlFor="blog-title" className="sr-only">
                  Blog title
                </label>
                <input
                  id="blog-title"
                  type="text"
                  value={values.title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  placeholder="Add title"
                  aria-invalid={Boolean(fieldErrors.title)}
                  className="w-full border-0 bg-transparent p-0 font-sans text-3xl font-semibold text-[#1d2327] placeholder:text-[#a7aaad] focus:outline-none focus:ring-0"
                />
                {fieldErrors.title ? (
                  <p className="mt-2 text-sm text-destructive">
                    {fieldErrors.title}
                  </p>
                ) : null}
              </div>

              <BlogEditor
                value={values.content}
                onChange={(content) => updateField("content", content)}
                error={fieldErrors.content}
              />
            </div>

            <aside className="space-y-4 lg:sticky lg:top-13 lg:self-start">
              <BlogSidebarPanel title="Publish">
                <div className="space-y-3 text-xs text-[#646970]">
                  <p>
                    Preview saves your latest changes and opens the post in a new
                    tab. Publish from the edit screen when ready.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-full rounded-sm border-[#c3c4c7] bg-white shadow-none"
                    onClick={handlePreview}
                    disabled={isBusy}
                  >
                    {isPreviewing ? (
                      <>
                        <Loader2
                          className="animate-spin"
                          data-icon="inline-start"
                        />
                        Opening preview...
                      </>
                    ) : (
                      <>
                        <Eye className="size-3.5" data-icon="inline-start" />
                        Preview
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant={canPublish ? "outline" : "default"}
                    disabled={isBusy}
                    className={
                      canPublish
                        ? "h-9 w-full rounded-sm border-[#c3c4c7] bg-white shadow-none"
                        : "h-9 w-full rounded-sm bg-[#2271b1] text-white hover:bg-[#135e96]"
                    }
                    onClick={handleSubmit("draft")}
                  >
                    {isSavingDraft ? (
                      <>
                        <Loader2
                          className="animate-spin"
                          data-icon="inline-start"
                        />
                        Saving...
                      </>
                    ) : (
                      "Save draft"
                    )}
                  </Button>
                  {canPublish ? (
                    <Button
                      type="submit"
                      disabled={isBusy}
                      className="h-9 w-full rounded-sm bg-[#2271b1] text-white hover:bg-[#135e96]"
                    >
                      {isPublishing ? (
                        <>
                          <Loader2
                            className="animate-spin"
                            data-icon="inline-start"
                          />
                          Publishing...
                        </>
                      ) : isDraft ? (
                        "Publish"
                      ) : (
                        "Update"
                      )}
                    </Button>
                  ) : (
                    <p className="text-[11px] text-[#646970]">
                      Publish unlocks after you save this post for the first
                      time.
                    </p>
                  )}
                </div>
              </BlogSidebarPanel>

              <BlogSidebarPanel title="Category">
                {categories.length === 0 ? (
                  <p className="text-xs text-[#646970]">
                    No blog categories yet.{" "}
                    <Link
                      href="/admin/blog-categories"
                      className="font-medium text-[#2271b1] hover:underline"
                    >
                      Add categories
                    </Link>{" "}
                    before publishing.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <Select
                      value={values.categoryId || null}
                      onValueChange={(value) => {
                        if (value) updateField("categoryId", value);
                      }}
                    >
                      <SelectTrigger
                        className="h-8 w-full rounded-sm border-[#c3c4c7] bg-white text-xs shadow-none"
                        aria-invalid={Boolean(fieldErrors.categoryId)}
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.categoryId ? (
                      <p className="text-xs text-destructive">
                        {fieldErrors.categoryId}
                      </p>
                    ) : (
                      <p className="text-[11px] text-[#646970]">
                        Required to publish. Manage in{" "}
                        <Link
                          href="/admin/blog-categories"
                          className="text-[#2271b1] hover:underline"
                        >
                          Blog Categories
                        </Link>
                        .
                      </p>
                    )}
                  </div>
                )}
              </BlogSidebarPanel>

              <BlogSidebarPanel title="Featured image">
                <BlogImageUpload
                  variant="sidebar"
                  value={values.coverImageUrl}
                  onChange={(url) => updateField("coverImageUrl", url)}
                  error={fieldErrors.coverImageUrl}
                />
              </BlogSidebarPanel>

              <BlogSidebarPanel title="Permalink">
                <div className="space-y-2">
                  <p className="text-[11px] leading-relaxed text-[#646970]">
                    URL:{" "}
                    <span className="break-all text-[#2271b1]">
                      /blogs/{previewSlug}
                    </span>
                  </p>
                  <label htmlFor="blog-slug" className="sr-only">
                    URL slug
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="shrink-0 text-xs text-[#646970]">
                      /blogs/
                    </span>
                    <Input
                      id="blog-slug"
                      value={values.slug}
                      onChange={(event) => {
                        setSlugTouched(true);
                        updateField("slug", event.target.value.toLowerCase());
                      }}
                      placeholder="post-slug"
                      aria-invalid={Boolean(fieldErrors.slug)}
                      className="h-8 rounded-sm border-[#c3c4c7] bg-white text-xs shadow-none"
                    />
                  </div>
                  {fieldErrors.slug ? (
                    <p className="text-xs text-destructive">{fieldErrors.slug}</p>
                  ) : (
                    <p className="text-[11px] text-[#646970]">
                      Auto-generated from title. You can edit it anytime.
                    </p>
                  )}
                </div>
              </BlogSidebarPanel>

              <BlogSeoPanel
                values={values}
                fieldErrors={fieldErrors}
                onFieldChange={updateField}
              />
            </aside>
          </div>
        </div>
      </form>
    </>
  );
}
