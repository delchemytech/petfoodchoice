import Link from "next/link";
import { ArrowLeft, Check, ExternalLink, Star } from "lucide-react";
import { Button } from "@/modules/common/ui/button";
import { formatPrice, formatReviewCount, formatSavings } from "../lib/format-price";
import {
  hasAmazonOffer,
  hasFlipkartOffer,
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

function StorePriceRow({
  storeName,
  currentPrice,
  originalPrice,
  currency,
}: {
  storeName: string;
  currentPrice: number | null;
  originalPrice: number | null;
  currency: string;
}) {
  if (currentPrice === null) {
    return null;
  }

  const savings = formatSavings(currentPrice, originalPrice, currency);

  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
      <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        {storeName}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums sm:text-3xl">
        {formatPrice(currentPrice, currency)}
      </p>
      {originalPrice !== null && originalPrice > currentPrice ? (
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="line-through tabular-nums">
            {formatPrice(originalPrice, currency)}
          </span>
          {savings ? (
            <span className="font-medium text-primary">Save {savings}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function ProductDetailView({
  product,
  relatedProducts = [],
  preview,
}: ProductDetailViewProps) {
  const backHref = preview?.backHref ?? "/";
  const showAmazon = hasAmazonOffer(product);
  const showFlipkart = hasFlipkartOffer(product);

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
                {showAmazon ? (
                  <span className="rounded-full border border-border px-3 py-1 text-xs font-medium">
                    Amazon
                  </span>
                ) : null}
                {showFlipkart ? (
                  <span className="rounded-full border border-border px-3 py-1 text-xs font-medium">
                    Flipkart
                  </span>
                ) : null}
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
              <h2 className="text-sm font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Compare prices
              </h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {showAmazon ? (
                  <StorePriceRow
                    storeName="Amazon"
                    currentPrice={product.amazonCurrentPrice}
                    originalPrice={product.amazonOriginalPrice}
                    currency={product.currency}
                  />
                ) : null}
                {showFlipkart ? (
                  <StorePriceRow
                    storeName="Flipkart"
                    currentPrice={product.flipkartCurrentPrice}
                    originalPrice={product.flipkartOriginalPrice}
                    currency={product.currency}
                  />
                ) : null}
              </div>

              <div className="mt-5 flex flex-col gap-3">
                {showAmazon ? (
                  <Button
                    size="lg"
                    className="h-12 w-full rounded-full"
                    nativeButton={false}
                    render={
                      <a
                        href={product.amazonAffiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                      />
                    }
                  >
                    Buy from Amazon
                    <ExternalLink data-icon="inline-end" />
                  </Button>
                ) : null}

                {showFlipkart ? (
                  <Button
                    size="lg"
                    variant={showAmazon ? "outline" : "default"}
                    className="h-12 w-full rounded-full"
                    nativeButton={false}
                    render={
                      <a
                        href={product.flipkartAffiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                      />
                    }
                  >
                    Buy from Flipkart
                    <ExternalLink data-icon="inline-end" />
                  </Button>
                ) : null}
              </div>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                Price last checked today · affiliate links
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
