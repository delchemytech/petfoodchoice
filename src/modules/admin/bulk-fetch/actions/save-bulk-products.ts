"use server";

import { AuthError, requireAdmin } from "@/modules/auth/lib/require-admin";
import { getCategoryNames } from "@/modules/admin/categories/actions/get-category-names";
import { extractAsinFromUrl } from "@/modules/admin/products/lib/amazon-affiliate";
import { NOT_DELETE } from "@/modules/admin/products/lib/product-filters";
import { revalidateStorefrontPaths } from "@/modules/admin/products/lib/revalidate-storefront";
import type { ProductInsert } from "@/modules/common/types/database";
import {
  allocateSlug,
  mapBulkFetchedToInsert,
} from "../lib/map-bulk-insert";
import type { BulkFetchedProduct, SaveBulkProductsResult } from "../types";

const INSERT_CHUNK_SIZE = 25;

function productKey(product: BulkFetchedProduct): string {
  return (
    product.asin.trim().toUpperCase() ||
    extractAsinFromUrl(product.amazonSourceUrl)?.toUpperCase() ||
    product.amazonSourceUrl.trim().toLowerCase()
  );
}

function existingKey(amazonSourceUrl: string | null): string | null {
  if (!amazonSourceUrl?.trim()) return null;
  return (
    extractAsinFromUrl(amazonSourceUrl)?.toUpperCase() ||
    amazonSourceUrl.trim().toLowerCase()
  );
}

async function insertPayloads(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  payloads: ProductInsert[],
): Promise<{ saved: number; skippedExisting: number; error: string | null }> {
  let saved = 0;
  let skippedExisting = 0;

  for (let index = 0; index < payloads.length; index += INSERT_CHUNK_SIZE) {
    const chunk = payloads.slice(index, index + INSERT_CHUNK_SIZE);
    const { data, error } = await supabase
      .from("products")
      .insert(chunk)
      .select("id");

    if (!error) {
      saved += data?.length ?? chunk.length;
      continue;
    }

    if (error.code !== "23505") {
      return { saved, skippedExisting, error: error.message };
    }

    for (const row of chunk) {
      const { error: rowError } = await supabase.from("products").insert(row);
      if (!rowError) {
        saved += 1;
        continue;
      }
      if (rowError.code === "23505") {
        skippedExisting += 1;
        continue;
      }
      return { saved, skippedExisting, error: rowError.message };
    }
  }

  return { saved, skippedExisting, error: null };
}

export async function saveBulkProducts(
  products: BulkFetchedProduct[],
  category: string,
): Promise<SaveBulkProductsResult> {
  try {
    if (!Array.isArray(products) || products.length === 0) {
      return { success: false, error: "Fetch products before saving." };
    }

    const { supabase, websiteId } = await requireAdmin();
    const categoryNames = await getCategoryNames();
    const selectedCategory = category.trim();

    if (!selectedCategory || !categoryNames.includes(selectedCategory)) {
      return { success: false, error: "Select a valid catalog category." };
    }

    const { data: existingRows, error: existingError } = await supabase
      .from("products")
      .select("amazon_source_url, slug")
      .eq("website_id", websiteId)
      .eq("delete", NOT_DELETE);

    if (existingError) {
      return { success: false, error: existingError.message };
    }

    const existingAsins = new Set(
      (existingRows ?? [])
        .map((row) => existingKey(row.amazon_source_url))
        .filter((key): key is string => Boolean(key)),
    );
    const usedSlugs = new Set(
      (existingRows ?? [])
        .map((row) => row.slug?.trim().toLowerCase())
        .filter((slug): slug is string => Boolean(slug)),
    );

    const payloads: ProductInsert[] = [];
    const seenBatch = new Set<string>();
    let skippedExisting = 0;
    let skippedInvalid = 0;

    for (const product of products) {
      const key = productKey(product);
      if (!key) {
        skippedInvalid += 1;
        continue;
      }
      if (seenBatch.has(key) || existingAsins.has(key)) {
        skippedExisting += 1;
        continue;
      }

      const slug = allocateSlug(product.name, product.asin, usedSlugs);
      const payload = mapBulkFetchedToInsert(product, {
        category: selectedCategory,
        slug,
        websiteId,
      });

      if (!payload) {
        skippedInvalid += 1;
        continue;
      }

      seenBatch.add(key);
      payloads.push(payload);
    }

    if (payloads.length === 0) {
      return {
        success: true,
        saved: 0,
        skippedExisting,
        skippedInvalid,
      };
    }

    const inserted = await insertPayloads(supabase, payloads);
    if (inserted.error) {
      return { success: false, error: inserted.error };
    }

    try {
      revalidateStorefrontPaths();
    } catch {
      // Save succeeded; cache refresh can be retried on next navigation.
    }

    return {
      success: true,
      saved: inserted.saved,
      skippedExisting: skippedExisting + inserted.skippedExisting,
      skippedInvalid,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        error: "Admin access required. Sign in again and retry.",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to save products. Please try again.",
    };
  }
}
