"use client";



import { useEffect, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { Loader2 } from "lucide-react";

import { resolveProductCategory } from "@/modules/common/lib/resolve-product-category";

import { zodFieldErrors } from "@/modules/common/lib/zod-field-errors";

import { Button } from "@/modules/common/ui/button";

import { cn } from "@/modules/common/utils";

import { createProduct } from "../../actions/create-product";

import { useFetchProduct } from "../../hooks/use-fetch-product";

import {

  affiliateUrlSchema,

  parseProductFormValues,

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

  const { status, fetchedData, errorMessage, fetchProduct, reset } =

    useFetchProduct();

  const [affiliateUrl, setAffiliateUrl] = useState("");

  const [formValues, setFormValues] = useState<AddProductFormValues | null>(

    null,

  );

  const [saveError, setSaveError] = useState<string | null>(null);

  const [urlError, setUrlError] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<

    Partial<Record<keyof AddProductFormValues, string>>

  >({});



  useEffect(() => {

    if (fetchedData) {

      setFormValues({

        ...fetchedData,

        category: resolveCategory(fetchedData.category, categories),

      });

      setFieldErrors({});

    }

  }, [fetchedData, categories]);



  function updateField<K extends keyof AddProductFormValues>(

    key: K,

    value: AddProductFormValues[K],

  ) {

    setFormValues((current) => (current ? { ...current, [key]: value } : null));

    setFieldErrors((current) => {

      if (!current[key]) return current;

      const next = { ...current };

      delete next[key];

      return next;

    });

  }



  async function handleFetch() {

    const parsed = affiliateUrlSchema.safeParse({

      affiliateUrl: affiliateUrl.trim(),

    });



    if (!parsed.success) {

      setUrlError(

        parsed.error.issues[0]?.message ?? "Enter a valid affiliate URL.",

      );

      return;

    }



    setUrlError(null);

    await fetchProduct(affiliateUrl.trim());

  }



  function handleRetry() {

    reset();

    setFormValues(null);

    setSaveError(null);

    setUrlError(null);

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

      try {

        await createProduct(formValues);

        router.push("/admin/products");

        router.refresh();

      } catch (error) {

        setSaveError(

          error instanceof Error

            ? error.message

            : "Failed to save product. Please try again.",

        );

      }

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

            value={affiliateUrl}

            onChange={(value) => {

              setAffiliateUrl(value);

              if (urlError) setUrlError(null);

            }}

            onFetch={handleFetch}

            isLoading={false}

            error={urlError ?? undefined}

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

          <FetchSuccessAlert />



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


