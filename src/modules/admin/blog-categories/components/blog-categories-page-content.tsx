"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "../../components/page-header";
import { createBlogCategory } from "../actions/create-blog-category";
import { deleteBlogCategory } from "../actions/delete-blog-category";
import { parseBlogCategoryName } from "../lib/blog-category-form-schema";
import { sortBlogCategories } from "../lib/map-blog-category";
import type { BlogCategory } from "../types";
import { Button } from "@/modules/common/ui/button";
import { FormMessage } from "@/modules/common/ui/form-message";
import { Input } from "@/modules/common/ui/input";
import { Label } from "@/modules/common/ui/label";
import { cn } from "@/modules/common/utils";

interface BlogCategoriesPageContentProps {
  initialCategories: BlogCategory[];
}

export function BlogCategoriesPageContent({
  initialCategories,
}: BlogCategoriesPageContentProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isCreating, startCreateTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const parsed = parseBlogCategoryName(name);
    if (!parsed.success) {
      setNameError(
        parsed.error.issues[0]?.message ?? "Enter a valid category name.",
      );
      return;
    }

    setNameError(null);

    startCreateTransition(async () => {
      try {
        const result = await createBlogCategory(parsed.data.name);
        setName("");
        setCategories((current) =>
          sortBlogCategories([...current, result.category]),
        );
        router.refresh();
      } catch (createError) {
        setError(
          createError instanceof Error
            ? createError.message
            : "Failed to create blog category.",
        );
      }
    });
  }

  function handleDelete(id: string) {
    setError(null);
    setDeletingId(id);

    void (async () => {
      try {
        await deleteBlogCategory(id);
        setCategories((current) =>
          current.filter((category) => category.id !== id),
        );
        router.refresh();
      } catch (deleteError) {
        setError(
          deleteError instanceof Error
            ? deleteError.message
            : "Failed to delete blog category.",
        );
      } finally {
        setDeletingId(null);
      }
    })();
  }

  return (
    <>
      <PageHeader
        title="Blog Categories"
        description="Manage categories for blog posts. These are separate from product categories."
      />

      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-end"
        noValidate
      >
        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor="blogCategoryName">New blog category</Label>
          <Input
            id="blogCategoryName"
            placeholder="e.g. Pet Care, Nutrition, Grooming"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (nameError) setNameError(null);
            }}
            disabled={isCreating}
            aria-invalid={Boolean(nameError)}
            className={cn(nameError && "border-destructive")}
          />
          <FormMessage message={nameError ?? undefined} />
        </div>
        <Button type="submit" className="w-full sm:w-auto" disabled={isCreating}>
          <Plus data-icon="inline-start" />
          Add category
        </Button>
      </form>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border">
        {categories.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            No blog categories yet. Add your first category above.
          </div>
        ) : (
          <ul className="divide-y">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <span className="font-medium">{category.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  disabled={deletingId === category.id}
                  onClick={() => handleDelete(category.id)}
                  aria-label={`Delete ${category.name}`}
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
