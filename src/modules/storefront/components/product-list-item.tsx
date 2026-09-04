import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { formatPrice, formatSavings } from "../lib/format-price";
import { getProductBadgeLabel } from "../lib/store-offers";
import type { StorefrontProduct } from "../types";
import { CompareToggleButton } from "./compare-toggle-button";

interface ProductListItemProps {
  product: StorefrontProduct;
  priority?: boolean;
}

export function ProductListItem({
  product,
  priority = false,
}: ProductListItemProps) {
  const hasDiscount =
    product.discountPercentage !== null && product.discountPercentage > 0;
  const savings = formatSavings(
    product.currentPrice,
    product.originalPrice,
    product.currency,
  );

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex gap-3 rounded-3xl border border-border/80 bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative size-28 shrink-0 overflow-hidden rounded-2xl bg-[#f3ecdf]">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="112px"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
        {hasDiscount ? (
          <span className="absolute top-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
            {product.discountPercentage}% OFF
          </span>
        ) : null}
        <CompareToggleButton product={product} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 py-0.5">
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            {getProductBadgeLabel(product)}
          </p>
          <h3 className="line-clamp-2 font-heading text-base leading-snug font-semibold">
            {product.name}
          </h3>
          {product.rating !== null ? (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              {product.totalReviews !== null ? (
                <span>({product.totalReviews.toLocaleString()})</span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-lg font-semibold tabular-nums">
              {formatPrice(product.currentPrice, product.currency)}
            </p>
            {product.originalPrice !== null &&
            product.originalPrice > product.currentPrice ? (
              <p className="text-xs text-muted-foreground line-through tabular-nums">
                {formatPrice(product.originalPrice, product.currency)}
              </p>
            ) : null}
            {savings ? (
              <p className="text-xs font-medium text-primary">Save {savings}</p>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
