"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { resolveProductCategory } from "@/modules/common/lib/resolve-product-category";
import { zodFieldErrors } from "@/modules/common/lib/zod-field-errors";
import { Button } from "@/modules/common/ui/button";
import { cn } from "@/modules/common/utils";
import { tryResolveAmazonProductUrls } from "../../lib/amazon-affiliate";
import { tryResolveFlipkartProductUrls } from "../../lib/flipkart-affiliate";
import { createProduct } from "../../actions/create-product";
import { useFetchProduct } from "../../hooks/use-fetch-product";
import {
  amazonProductUrlSchema,
  flipkartProductUrlSchema,
  parseProductFormValues,
  slugifyProductName,
} from "../../lib/product-form-schema";
import type { AddProductFormValues } from "../../types/add-product";
import { AffiliateUrlStep } from "./affiliate-url-step";
import { FetchErrorAlert } from "./fetch-error-alert";
import { FetchLoadingState } from "./fetch-loading-state";
import { FetchSuccessAlert } from "./fetch-success-alert";
import { ProductDetailsFields } from "./product-details-fields";

function resolveCategory(category: string, categories: string[]) {
  return resolveProductCategory(category, categories);
}

interface AddProductFormProps {
  categories: string[];
}

export function AddProductForm({ categories }: AddProductFormProps) {
  const router = useRouter();
  const [isSaving, startSaveTransition] = useTransition();
  const {
    status,
    fetchedData,
    errorMessage,
    fetchWarnings,
    fetchProduct,
    reset,
  } = useFetchProduct();
  const [amazonUrl, setAmazonUrl] = useState("");
  const [flipkartUrl, setFlipkartUrl] = useState("");
  const [formValues, setFormValues] = useState<AddProductFormValues | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [amazonUrlError, setAmazonUrlError] = useState<string | null>(null);
  const [flipkartUrlError, setFlipkartUrlError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof AddProductFormValues, string>>
  >({});

  const generatedAmazonAffiliateUrl = useMemo(() => {
    return tryResolveAmazonProductUrls(amazonUrl)?.affiliateUrl;
  }, [amazonUrl]);

  const generatedFlipkartAffiliateUrl = useMemo(() => {
    return tryResolveFlipkartProductUrls(flipkartUrl)?.affiliateUrl;
  }, [flipkartUrl]);

  const categoryKey = useMemo(
    () => categories.filter(Boolean).join("|"),
    [categories],
  );

  useEffect(() => {
    if (!fetchedData) return;

    setFormValues({
      ...fetchedData,
      slug:
        fetchedData.slug.trim() ||
        slugifyProductName(fetchedData.name) ||
        "product",
      category: resolveCategory(fetchedData.category, categories),
    });
    setSlugTouched(false);
    setFieldErrors({});
  }, [fetchedData, categoryKey]);

  function updateField<K extends keyof AddProductFormValues>(
    key: K,
    value: AddProductFormValues[K],
  ) {
    if (key === "slug") {
      setSlugTouched(true);
    }

    setFormValues((current) => {
      if (!current) return null;

      if (key === "name" && !slugTouched) {
        const name = value as string;
        return {
          ...current,
          name,
          slug: slugifyProductName(name) || "product",
        };
      }

      return { ...current, [key]: value };
    });
    setFieldErrors((current) => {
      if (!current[key] && !(key === "name" && current.slug)) return current;
      const next = { ...current };
      delete next[key];
      if (key === "name" && !slugTouched) {
        delete next.slug;
      }
      return next;
    });
  }

  async function handleFetch() {
    const amazonParsed = amazonProductUrlSchema.safeParse({
      productUrl: amazonUrl.trim(),
    });

    if (!amazonParsed.success) {
      setAmazonUrlError(
        amazonParsed.error.issues[0]?.message ??
          "Enter a valid Amazon India URL.",
      );
      return;
    }

    setAmazonUrlError(null);

    if (flipkartUrl.trim()) {
      const flipkartParsed = flipkartProductUrlSchema.safeParse({
        productUrl: flipkartUrl.trim(),
      });

      if (!flipkartParsed.success) {
        setFlipkartUrlError(
          flipkartParsed.error.issues[0]?.message ??
            "Enter a valid Flipkart URL.",
        );
        return;
      }

      setFlipkartUrlError(null);
    } else {
      setFlipkartUrlError(null);
    }

    await fetchProduct({
      amazonUrl: amazonUrl.trim(),
      flipkartUrl: flipkartUrl.trim() || undefined,
    });
  }

  function handleRetry() {
    reset();
    setFormValues(null);
    setSlugTouched(false);
    setSaveError(null);
    setAmazonUrlError(null);
    setFlipkartUrlError(null);
    setFieldErrors({});
  }

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!formValues) return;

    const parsed = parseProductFormValues(formValues, categories);
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      setSaveError(null);
      return;
    }

    setFieldErrors({});
    setSaveError(null);

    startSaveTransition(async () => {
      const result = await createProduct(formValues);
      if (!result.success) {
        setSaveError(result.error);
        return;
      }

      router.push("/admin/products");
    });
  }

  const showUrlStep = status === "idle" || status === "error";
  const showLoading = status === "loading";
  const showForm = status === "success" && formValues;

  return (
    <div className="space-y-6">
      {showUrlStep ? (
        <div className="space-y-4">
          {status === "error" && errorMessage ? (
            <FetchErrorAlert message={errorMessage} onRetry={handleRetry} />
          ) : null}

          <AffiliateUrlStep
            amazonUrl={amazonUrl}
            flipkartUrl={flipkartUrl}
            generatedAmazonAffiliateUrl={generatedAmazonAffiliateUrl}
            generatedFlipkartAffiliateUrl={generatedFlipkartAffiliateUrl}
            onAmazonUrlChange={(value) => {
              setAmazonUrl(value);
              if (amazonUrlError) setAmazonUrlError(null);
            }}
            onFlipkartUrlChange={(value) => {
              setFlipkartUrl(value);
              if (flipkartUrlError) setFlipkartUrlError(null);
            }}
            onFetch={handleFetch}
            isLoading={false}
            amazonError={amazonUrlError ?? undefined}
            flipkartError={flipkartUrlError ?? undefined}
          />
        </div>
      ) : null}

      {showLoading ? <FetchLoadingState /> : null}

      {showForm ? (
        <form
          onSubmit={handleSave}
          className={cn(
            "space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
          )}
          noValidate
        >
          <FetchSuccessAlert warnings={fetchWarnings} />

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
                "Save Product"
              )}
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
