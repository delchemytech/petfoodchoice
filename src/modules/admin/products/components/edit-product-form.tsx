"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { zodFieldErrors } from "@/modules/common/lib/zod-field-errors";
import { resolveProductCategory } from "@/modules/common/lib/resolve-product-category";
import { Button } from "@/modules/common/ui/button";
import { updateProduct } from "../actions/update-product";
import { mapProductToFormValues } from "../lib/map-product";
import { parseProductFormValues } from "../lib/product-form-schema";
import type { Product } from "../types";
import type { AddProductFormValues } from "../types/add-product";
import { FetchErrorAlert } from "./add-product/fetch-error-alert";
import { ProductDetailsFields } from "./add-product/product-details-fields";

interface EditProductFormProps {
  product: Product;
  categories: string[];
}

export function EditProductForm({ product, categories }: EditProductFormProps) {
  const router = useRouter();
  const [isSaving, startSaveTransition] = useTransition();
  const [formValues, setFormValues] = useState<AddProductFormValues>(() => ({
    ...mapProductToFormValues(product),
    category: resolveProductCategory(product.category, categories),
  }));
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof AddProductFormValues, string>>
  >({});

  function updateField<K extends keyof AddProductFormValues>(
    key: K,
    value: AddProductFormValues[K],
  ) {
    setFormValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function handleSave(event: React.FormEvent) {
    event.preventDefault();

    const parsed = parseProductFormValues(formValues, categories);
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      setSaveError(null);
      return;
    }

    setFieldErrors({});
    setSaveError(null);

    startSaveTransition(async () => {
      try {
        await updateProduct(product.id, formValues);
        router.push("/admin/products");
        router.refresh();
      } catch (error) {
        setSaveError(
          error instanceof Error
            ? error.message
            : "Failed to update product. Please try again.",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSave} className="space-y-6" noValidate>
      {saveError ? <FetchErrorAlert message={saveError} /> : null}

      <ProductDetailsFields
        values={formValues}
        categories={categories}
        errors={fieldErrors}
        onChange={updateField}
      />

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          disabled={isSaving}
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
        <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="animate-spin" data-icon="inline-start" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
