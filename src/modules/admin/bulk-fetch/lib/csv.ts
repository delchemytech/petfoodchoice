import type { BulkFetchedProduct } from "../types";

const HEADERS = [
  "ASIN",
  "Name",
  "Slug",
  "Brand",
  "Category",
  "Amazon Source URL",
  "Amazon Affiliate URL",
  "Amazon Current Price",
  "Amazon Original Price",
  "Amazon Discount %",
  "Currency",
  "Rating",
  "Total Reviews",
  "Image URL",
  "Image URLs",
  "Short Description",
  "Pet Type",
  "Life Stage",
  "Breed Size",
  "Food Type",
  "Flavor",
  "Pack Weight",
  "Pack Weight Unit",
  "Pack Count",
  "Status",
] as const;

function escapeCell(value: string | number | boolean | null): string {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function productRow(product: BulkFetchedProduct): string[] {
  return [
    product.asin,
    product.name,
    product.slug,
    product.brand,
    product.category,
    product.amazonSourceUrl,
    product.amazonAffiliateUrl,
    product.amazonCurrentPrice,
    product.amazonOriginalPrice,
    product.amazonDiscountPercentage,
    product.currency,
    product.rating,
    product.totalReviews,
    product.imageUrl,
    product.imageUrls.join(" | "),
    product.shortDescription,
    product.petType,
    product.lifeStage,
    product.breedSize,
    product.foodType,
    product.flavor,
    product.packWeight,
    product.packWeightUnit,
    product.packCount,
    product.status,
  ].map(escapeCell);
}

export function productsToCsv(products: BulkFetchedProduct[]): string {
  const lines = [HEADERS.join(","), ...products.map((p) => productRow(p).join(","))];
  return `\uFEFF${lines.join("\n")}`;
}

export function downloadProductsCsv(
  products: BulkFetchedProduct[],
  keyword: string,
): void {
  const slug = keyword.trim().toLowerCase().replace(/\s+/g, "-") || "products";
  const date = new Date().toISOString().slice(0, 10);
  const blob = new Blob([productsToCsv(products)], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `amazon-${slug}-${date}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
