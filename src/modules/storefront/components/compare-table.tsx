"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Minus, ShoppingBag, Star, Trophy, X } from "lucide-react";
import { Button } from "@/modules/common/ui/button";
import {
  formatPrice,
  formatReviewCount,
  formatSavings,
} from "../lib/format-price";
import {
  getListingPrice,
  getPrimaryBuyUrl,
  hasAmazonOffer,
  hasFlipkartOffer,
} from "../lib/store-offers";
import type { StorefrontProduct } from "../types";

interface CompareTableProps {
  products: [StorefrontProduct, StorefrontProduct];
  onRemove?: (id: string) => void;
}

function WinnerBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary uppercase">
      <Trophy className="size-3" />
      Best
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Section header row                                                 */
/* ------------------------------------------------------------------ */
function SectionHeader({ title }: { title: string }) {
  return (
    <tr>
      <td
        colSpan={3}
        className="bg-muted/40 px-5 py-2.5 text-[11px] font-bold tracking-[0.18em] text-muted-foreground uppercase sm:px-6"
      >
        {title}
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/*  Comparison data row                                                */
/* ------------------------------------------------------------------ */
interface RowProps {
  label: string;
  values: [React.ReactNode, React.ReactNode];
  highlight?: 0 | 1 | null;
}

function CompareRow({ label, values, highlight }: RowProps) {
  return (
    <tr className="group border-b border-border/40 transition-colors last:border-b-0 hover:bg-muted/20">
      <td className="w-[28%] py-3 pr-3 pl-5 text-[13px] font-medium text-muted-foreground sm:py-3.5 sm:pl-6">
        {label}
      </td>
      {values.map((value, i) => (
        <td
          key={i}
          className={`w-[36%] py-3 px-4 text-sm sm:py-3.5 sm:px-6 ${
            highlight === i ? "font-semibold text-primary" : "font-medium text-foreground"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            {value}
            {highlight === i ? <WinnerBadge /> : null}
          </div>
        </td>
      ))}
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/*  Availability pill                                                  */
/* ------------------------------------------------------------------ */
function AvailabilityPill({ available }: { available: boolean }) {
  if (available) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
        <Check className="size-3" />
        Available
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
      <Minus className="size-3" />
      N/A
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Product hero card (top of the table)                               */
/* ------------------------------------------------------------------ */
function ProductHeroCard({
  product,
  buyUrl,
  listing,
  onRemove,
}: {
  product: StorefrontProduct;
  buyUrl: string | null;
  listing: { currentPrice: number; originalPrice: number | null };
  onRemove?: () => void;
}) {
  const savings = formatSavings(
    listing.currentPrice,
    listing.originalPrice,
    product.currency,
  );

  return (
    <div className="relative flex flex-col items-center gap-4 p-4 sm:p-6">
      {/* Remove button */}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground shadow-sm transition-all hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
          aria-label={`Remove ${product.name} from comparison`}
        >
          <X className="size-4" />
        </button>
      ) : null}

      {/* Product image */}
      <Link
        href={`/products/${product.slug}`}
        className="group relative aspect-square w-full max-w-[130px] overflow-hidden rounded-2xl border border-border/40 bg-[#f3ecdf] shadow-sm sm:max-w-[170px]"
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="170px"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
        {product.discountPercentage !== null &&
        product.discountPercentage > 0 ? (
          <span className="absolute top-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
            {product.discountPercentage}% OFF
          </span>
        ) : null}
      </Link>

      {/* Product info */}
      <div className="w-full space-y-1 text-center">
        <p className="text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
          {product.brand || product.category}
        </p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 font-heading text-sm font-semibold leading-snug transition-colors hover:text-primary sm:text-base">
            {product.name}
          </h3>
        </Link>
      </div>

      {/* Price block */}
      <div className="w-full space-y-1 text-center">
        <p className="text-2xl font-bold tabular-nums sm:text-3xl">
          {listing.currentPrice > 0
            ? formatPrice(listing.currentPrice, product.currency)
            : "—"}
        </p>
        {listing.originalPrice !== null &&
        listing.originalPrice > listing.currentPrice ? (
          <div className="flex items-center justify-center gap-2 text-xs">
            <span className="tabular-nums text-muted-foreground line-through">
              MRP {formatPrice(listing.originalPrice, product.currency)}
            </span>
            {savings ? (
              <span className="font-semibold text-primary">
                Save {savings}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Rating */}
      {product.rating !== null ? (
        <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold">{product.rating.toFixed(1)}</span>
          {product.totalReviews !== null ? (
            <span className="text-muted-foreground">
              ({formatReviewCount(product.totalReviews)})
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Buy button */}
      {buyUrl ? (
        <Button
          size="lg"
          className="mt-auto w-full max-w-[180px] rounded-full"
          nativeButton={false}
          render={
            <a href={buyUrl} target="_blank" rel="noopener noreferrer" />
          }
        >
          <ShoppingBag data-icon="inline-start" />
          Buy now
        </Button>
      ) : (
        <Button
          size="lg"
          variant="outline"
          className="mt-auto w-full max-w-[180px] rounded-full"
          disabled
        >
          Not available
        </Button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main compare table                                                 */
/* ------------------------------------------------------------------ */
export function CompareTable({ products, onRemove }: CompareTableProps) {
  const [a, b] = products;
  const aListing = getListingPrice(a);
  const bListing = getListingPrice(b);
  const aBuyUrl = getPrimaryBuyUrl(a);
  const bBuyUrl = getPrimaryBuyUrl(b);

  function priceWinner(): 0 | 1 | null {
    if (aListing.currentPrice <= 0 && bListing.currentPrice <= 0) return null;
    if (aListing.currentPrice <= 0) return 1;
    if (bListing.currentPrice <= 0) return 0;
    if (aListing.currentPrice < bListing.currentPrice) return 0;
    if (bListing.currentPrice < aListing.currentPrice) return 1;
    return null;
  }

  function ratingWinner(): 0 | 1 | null {
    if (a.rating === null && b.rating === null) return null;
    if (a.rating === null) return 1;
    if (b.rating === null) return 0;
    if (a.rating > b.rating) return 0;
    if (b.rating > a.rating) return 1;
    return null;
  }

  function discountWinner(): 0 | 1 | null {
    const ad = a.discountPercentage ?? 0;
    const bd = b.discountPercentage ?? 0;
    if (ad === 0 && bd === 0) return null;
    if (ad > bd) return 0;
    if (bd > ad) return 1;
    return null;
  }

  function reviewWinner(): 0 | 1 | null {
    if (a.totalReviews === null && b.totalReviews === null) return null;
    if (a.totalReviews === null) return 1;
    if (b.totalReviews === null) return 0;
    if (a.totalReviews > b.totalReviews) return 0;
    if (b.totalReviews > a.totalReviews) return 1;
    return null;
  }

  return (
    <div className="space-y-6">
      {/* ---- Product hero cards ---- */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {products.map((product, i) => (
          <div
            key={product.id}
            className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm"
          >
            <ProductHeroCard
              product={product}
              buyUrl={i === 0 ? aBuyUrl : bBuyUrl}
              listing={i === 0 ? aListing : bListing}
              onRemove={onRemove ? () => onRemove(product.id) : undefined}
            />
          </div>
        ))}
      </div>

      {/* ---- Specifications table ---- */}
      <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm">
        <div className="border-b border-border/80 bg-muted/30 px-5 py-4 sm:px-6">
          <h2 className="font-heading text-lg font-semibold">
            Detailed comparison
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Side-by-side breakdown of pricing, attributes, and availability
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] table-fixed">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20">
                <th className="w-[28%] py-3 pl-5 text-left text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase sm:pl-6">
                  Specification
                </th>
                <th className="w-[36%] py-3 px-4 text-left text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase sm:px-6">
                  {a.name.length > 25 ? `${a.name.slice(0, 25)}…` : a.name}
                </th>
                <th className="w-[36%] py-3 px-4 text-left text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase sm:px-6">
                  {b.name.length > 25 ? `${b.name.slice(0, 25)}…` : b.name}
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Pricing section */}
              <SectionHeader title="Pricing" />

              <CompareRow
                label="Best price"
                values={[
                  <span key="a" className="tabular-nums">
                    {aListing.currentPrice > 0
                      ? formatPrice(aListing.currentPrice, a.currency)
                      : "—"}
                  </span>,
                  <span key="b" className="tabular-nums">
                    {bListing.currentPrice > 0
                      ? formatPrice(bListing.currentPrice, b.currency)
                      : "—"}
                  </span>,
                ]}
                highlight={priceWinner()}
              />

              <CompareRow
                label="Discount"
                values={[
                  a.discountPercentage !== null && a.discountPercentage > 0
                    ? `${a.discountPercentage}%`
                    : "—",
                  b.discountPercentage !== null && b.discountPercentage > 0
                    ? `${b.discountPercentage}%`
                    : "—",
                ]}
                highlight={discountWinner()}
              />

              {/* Ratings section */}
              <SectionHeader title="Ratings & reviews" />

              <CompareRow
                label="Rating"
                values={[
                  a.rating !== null ? (
                    <span key="a" className="flex items-center gap-1.5">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      {a.rating.toFixed(1)} / 5
                    </span>
                  ) : (
                    "—"
                  ),
                  b.rating !== null ? (
                    <span key="b" className="flex items-center gap-1.5">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      {b.rating.toFixed(1)} / 5
                    </span>
                  ) : (
                    "—"
                  ),
                ]}
                highlight={ratingWinner()}
              />

              <CompareRow
                label="Reviews"
                values={[
                  a.totalReviews !== null
                    ? `${formatReviewCount(a.totalReviews)}`
                    : "—",
                  b.totalReviews !== null
                    ? `${formatReviewCount(b.totalReviews)}`
                    : "—",
                ]}
                highlight={reviewWinner()}
              />

              {/* Product details section */}
              <SectionHeader title="Product details" />

              <CompareRow
                label="Brand"
                values={[a.brand || "—", b.brand || "—"]}
              />
              <CompareRow
                label="Category"
                values={[a.category || "—", b.category || "—"]}
              />
              <CompareRow
                label="Pet type"
                values={[a.petType || "—", b.petType || "—"]}
              />
              <CompareRow
                label="Life stage"
                values={[a.lifeStage || "—", b.lifeStage || "—"]}
              />
              <CompareRow
                label="Breed size"
                values={[a.breedSize || "—", b.breedSize || "—"]}
              />
              <CompareRow
                label="Food type"
                values={[a.foodType || "—", b.foodType || "—"]}
              />
              <CompareRow
                label="Flavor"
                values={[a.flavor || "—", b.flavor || "—"]}
              />
              <CompareRow
                label="Pack size"
                values={[
                  a.packWeight !== null
                    ? `${a.packWeight}${a.packWeightUnit ? ` ${a.packWeightUnit}` : ""}${a.packCount && a.packCount > 1 ? ` × ${a.packCount}` : ""}`
                    : "—",
                  b.packWeight !== null
                    ? `${b.packWeight}${b.packWeightUnit ? ` ${b.packWeightUnit}` : ""}${b.packCount && b.packCount > 1 ? ` × ${b.packCount}` : ""}`
                    : "—",
                ]}
              />

              {/* Availability section */}
              <SectionHeader title="Store availability" />

              <CompareRow
                label="Amazon"
                values={[
                  <AvailabilityPill key="a" available={hasAmazonOffer(a)} />,
                  <AvailabilityPill key="b" available={hasAmazonOffer(b)} />,
                ]}
              />
              <CompareRow
                label="Flipkart"
                values={[
                  <AvailabilityPill key="a" available={hasFlipkartOffer(a)} />,
                  <AvailabilityPill key="b" available={hasFlipkartOffer(b)} />,
                ]}
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
