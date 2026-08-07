import type { AddProductFormValues } from "../../types/add-product";

type FieldCheck = {
  label: string;
  value: string | string[] | null | undefined;
};

function isPresent(value: string | string[] | null | undefined) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return Boolean(value?.trim());
}

function summarizeFields(fields: FieldCheck[]) {
  const present: string[] = [];
  const missing: string[] = [];

  for (const field of fields) {
    if (isPresent(field.value)) {
      present.push(field.label);
    } else {
      missing.push(field.label);
    }
  }

  return { present, missing };
}

export function logScrapeResult(
  data: AddProductFormValues,
  warnings: string[],
  context: { amazonUrl: string; flipkartUrl?: string },
) {
  const amazon = summarizeFields([
    { label: "amazonSourceUrl", value: data.amazonSourceUrl },
    { label: "amazonAffiliateUrl", value: data.amazonAffiliateUrl },
    { label: "amazonCurrentPrice", value: data.amazonCurrentPrice },
    { label: "amazonOriginalPrice", value: data.amazonOriginalPrice },
    { label: "amazonDiscountPercentage", value: data.amazonDiscountPercentage },
  ]);

  const flipkart = summarizeFields([
    { label: "flipkartSourceUrl", value: data.flipkartSourceUrl },
    { label: "flipkartAffiliateUrl", value: data.flipkartAffiliateUrl },
    { label: "flipkartCurrentPrice", value: data.flipkartCurrentPrice },
    { label: "flipkartOriginalPrice", value: data.flipkartOriginalPrice },
    { label: "flipkartDiscountPercentage", value: data.flipkartDiscountPercentage },
  ]);

  const shared = summarizeFields([
    { label: "name", value: data.name },
    { label: "brand", value: data.brand },
    { label: "category", value: data.category },
    { label: "imageUrl", value: data.imageUrl },
    { label: "imageUrls", value: data.imageUrls },
    { label: "rating", value: data.rating },
    { label: "totalReviews", value: data.totalReviews },
    { label: "shortDescription", value: data.shortDescription },
    { label: "currency", value: data.currency },
  ]);

  console.log("[scrape-product] URLs:", {
    amazonUrl: context.amazonUrl,
    flipkartUrl: context.flipkartUrl ?? null,
  });

  console.log("[scrape-product] Amazon:", {
    present: amazon.present,
    missing: amazon.missing,
    values: {
      amazonSourceUrl: data.amazonSourceUrl || null,
      amazonAffiliateUrl: data.amazonAffiliateUrl || null,
      amazonCurrentPrice: data.amazonCurrentPrice || null,
      amazonOriginalPrice: data.amazonOriginalPrice || null,
      amazonDiscountPercentage: data.amazonDiscountPercentage || null,
    },
  });

  console.log("[scrape-product] Flipkart:", {
    present: flipkart.present,
    missing: flipkart.missing,
    values: {
      flipkartSourceUrl: data.flipkartSourceUrl || null,
      flipkartAffiliateUrl: data.flipkartAffiliateUrl || null,
      flipkartCurrentPrice: data.flipkartCurrentPrice || null,
      flipkartOriginalPrice: data.flipkartOriginalPrice || null,
      flipkartDiscountPercentage: data.flipkartDiscountPercentage || null,
    },
  });

  console.log("[scrape-product] Shared:", {
    present: shared.present,
    missing: shared.missing,
    values: {
      name: data.name || null,
      brand: data.brand || null,
      category: data.category || null,
      imageCount: data.imageUrls.length,
      rating: data.rating || null,
      totalReviews: data.totalReviews || null,
      shortDescriptionLength: data.shortDescription.trim().length,
      currency: data.currency || null,
    },
  });

  if (warnings.length > 0) {
    console.warn("[scrape-product] Warnings:", warnings);
  }
}
