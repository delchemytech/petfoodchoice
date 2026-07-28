"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { sortCategories } from "@/modules/common/lib/category-match";
import { PageHeader } from "../../components/page-header";
import { createCategory } from "../actions/create-category";
import { deleteCategory } from "../actions/delete-category";
import { categoryFormSchema } from "../lib/category-form-schema";
import type { Category } from "../types";
import { Button } from "@/modules/common/ui/button";
import { FormMessage } from "@/modules/common/ui/form-message";
import { Input } from "@/modules/common/ui/input";
import { Label } from "@/modules/common/ui/label";
import { cn } from "@/modules/common/utils";

interface CategoriesPageContentProps {
  initialCategories: Category[];
}

export function CategoriesPageContent({
  initialCategories,
}: CategoriesPageContentProps) {
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

    const parsed = categoryFormSchema.safeParse({ name });
    if (!parsed.success) {
      setNameError(
        parsed.error.issues[0]?.message ?? "Enter a valid category name.",
      );
      return;
    }

    setNameError(null);

    startCreateTransition(async () => {
      try {
        const result = await createCategory(parsed.data.name);
        setName("");
        setCategories((current) =>
          sortCategories([...current, result.category]),
        );
        router.refresh();
      } catch (createError) {
        setError(
          createError instanceof Error
            ? createError.message
            : "Failed to create category.",
        );
      }
    });
  }

  function handleDelete(id: string) {
    setError(null);
    setDeletingId(id);

    void (async () => {
      try {
        await deleteCategory(id);
        setCategories((current) => current.filter((category) => category.id !== id));
        router.refresh();
      } catch (deleteError) {
        setError(
          deleteError instanceof Error
            ? deleteError.message
            : "Failed to delete category.",
        );
      } finally {
        setDeletingId(null);
      }
    })();
  }

  return (
    <>
      <PageHeader
        title="Categories"
        description="Manage product categories shown in the admin product form and on the website."
      />

      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-end"
        noValidate
      >
        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor="categoryName">New category</Label>
          <Input
            id="categoryName"
            placeholder="e.g. Food, Toys, Others"
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
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="rounded-xl border">
        {categories.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            No categories yet. Add Food, Toys, and Others to get started.
          </p>
        ) : (
          <ul className="divide-y">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Used in product dropdown and website filters
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  aria-label={`Delete ${category.name}`}
                  disabled={deletingId === category.id}
                  onClick={() => handleDelete(category.id)}
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
