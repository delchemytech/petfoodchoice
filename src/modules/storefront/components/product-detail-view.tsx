import Link from "next/link";
import { ArrowLeft, Check, ShoppingBag, Star } from "lucide-react";
import { Button } from "@/modules/common/ui/button";
import {
  formatPrice,
  formatReviewCount,
  formatSavings,
} from "../lib/format-price";
import {
  getListingPrice,
  getPrimaryBuyUrl,
} from "../lib/store-offers";
import type { StorefrontProduct } from "../types";
import { ProductImageGallery } from "./product-image-gallery";
import { ProductPreviewBanner } from "./product-preview-banner";
import { ProductGrid } from "./product-grid";

interface ProductDetailPreviewOptions {
  status: "active" | "inactive";
  editHref: string;
  backHref: string;
}

interface ProductDetailViewProps {
  product: StorefrontProduct;
  relatedProducts?: StorefrontProduct[];
  preview?: ProductDetailPreviewOptions;
}

function formatAttributeLabel(value: string | null) {
  return value?.trim() || null;
}

export function ProductDetailView({
  product,
  relatedProducts = [],
  preview,
}: ProductDetailViewProps) {
  const backHref = preview?.backHref ?? "/";
  const buyUrl = getPrimaryBuyUrl(product);
  const { currentPrice, originalPrice } = getListingPrice(product);
  const savings = formatSavings(currentPrice, originalPrice, product.currency);

  const attributeTags = [
    formatAttributeLabel(product.petType),
    formatAttributeLabel(product.lifeStage),
    formatAttributeLabel(product.foodType),
    formatAttributeLabel(product.flavor),
  ].filter(Boolean) as string[];

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
        {preview ? (
          <ProductPreviewBanner
            status={preview.status}
            editHref={preview.editHref}
            backHref={preview.backHref}
          />
        ) : null}

        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {preview ? "Back to admin products" : "Continue shopping"}
        </Link>

        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <ProductImageGallery
            imageUrl={product.imageUrl}
            imageUrls={product.imageUrls}
            productName={product.name}
            discountPercentage={product.discountPercentage}
          />

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-border px-3 py-1 text-xs font-medium">
                  {product.category}
                </span>
                {attributeTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border px-3 py-1 text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {product.brand ? (
                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  {product.brand}
                </p>
              ) : null}

              <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                {product.name}
              </h1>

              {product.rating !== null ? (
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{product.rating.toFixed(1)}</span>
                    {product.totalReviews !== null ? (
                      <span className="text-muted-foreground">
                        · {formatReviewCount(product.totalReviews)} reviews
                      </span>
                    ) : null}
                  </div>
                  <span className="text-primary">✓ In stock</span>
                </div>
              ) : (
                <p className="text-sm font-medium text-primary">✓ In stock</p>
              )}

              <p className="leading-relaxed text-muted-foreground">
                {product.shortDescription || "No description available."}
              </p>
            </div>

            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  Price
                </p>
                <p className="text-3xl font-semibold tabular-nums sm:text-4xl">
                  {formatPrice(currentPrice, product.currency)}
                </p>
                {originalPrice !== null && originalPrice > currentPrice ? (
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="line-through tabular-nums">
                      MRP {formatPrice(originalPrice, product.currency)}
                    </span>
                    {savings ? (
                      <span className="font-medium text-primary">
                        Save {savings}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {product.packWeight !== null ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Pack size: {product.packWeight}
                  {product.packWeightUnit ? ` ${product.packWeightUnit}` : ""}
                  {product.packCount && product.packCount > 1
                    ? ` · ${product.packCount} packs`
                    : ""}
                </p>
              ) : null}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                {buyUrl ? (
                  <Button
                    size="lg"
                    className="h-12 flex-1 rounded-full"
                    nativeButton={false}
                    render={
                      <a
                        href={buyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <ShoppingBag data-icon="inline-start" />
                    Buy now
                  </Button>
                ) : (
                  <Button size="lg" className="h-12 flex-1 rounded-full" disabled>
                    <ShoppingBag data-icon="inline-start" />
                    Buy now
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 flex-1 rounded-full"
                  render={<Link href="/#picks" />}
                >
                  Keep shopping
                </Button>
              </div>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                Secure checkout · Easy returns on eligible items
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Product highlights
              </h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  "Trusted brand with strong customer ratings",
                  "Suitable for everyday feeding routines",
                  "Clear ingredients and nutrition information",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 ? (
          <section className="space-y-6 border-t border-border/70 pt-10">
            <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
              You may also like
            </h2>
            <ProductGrid products={relatedProducts} />
          </section>
        ) : null}
      </div>
    </div>
  );
}
