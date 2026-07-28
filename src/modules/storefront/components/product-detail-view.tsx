import Link from "next/link";
import { ArrowLeft, Check, ExternalLink, Star } from "lucide-react";
import { Button } from "@/modules/common/ui/button";
import { formatPrice, formatReviewCount, formatSavings } from "../lib/format-price";
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

export function ProductDetailView({
  product,
  relatedProducts = [],
  preview,
}: ProductDetailViewProps) {
  const savings = formatSavings(
    product.currentPrice,
    product.originalPrice,
    product.currency,
  );
  const backHref = preview?.backHref ?? "/";

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
          {preview ? "Back to admin products" : "Back to the store"}
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
                  {product.store}
                </span>
                <span className="rounded-full border border-border px-3 py-1 text-xs font-medium">
                  {product.category}
                </span>
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
                        · {formatReviewCount(product.totalReviews)} ratings
                      </span>
                    ) : null}
                  </div>
                  <span className="text-primary">✓ Curated pick</span>
                </div>
              ) : null}

              <p className="leading-relaxed text-muted-foreground">
                {product.shortDescription || "No description available."}
              </p>
            </div>

            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
              <div className="space-y-1">
                <p className="text-3xl font-semibold tabular-nums sm:text-4xl">
                  {formatPrice(product.currentPrice, product.currency)}
                </p>
                {product.originalPrice !== null &&
                product.originalPrice > product.currentPrice ? (
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="line-through tabular-nums">
                      {formatPrice(product.originalPrice, product.currency)}
                    </span>
                    {savings ? <span className="font-medium text-primary">Save {savings}</span> : null}
                  </div>
                ) : null}
              </div>

              <Button
                size="lg"
                className="mt-5 h-12 w-full rounded-full"
                nativeButton={false}
                render={
                  <a
                    href={product.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                  />
                }
              >
                Buy on {product.store}
                <ExternalLink data-icon="inline-end" />
              </Button>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                Price last checked today · affiliate link
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Why we picked it
              </h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  "Strong ratings from verified buyers",
                  "Competitive price across partner stores",
                  "Clear product details and trustworthy seller",
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
              More from the store
            </h2>
            <ProductGrid products={relatedProducts} />
          </section>
        ) : null}
      </div>
    </div>
  );
}
