import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { formatPrice, formatSavings } from "../lib/format-price";
import { getProductBadgeLabel } from "../lib/store-offers";
import type { StorefrontProduct } from "../types";

interface ProductCardProps {
  product: StorefrontProduct;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const hasDiscount =
    product.discountPercentage !== null && product.discountPercentage > 0;
  const savings = formatSavings(
    product.currentPrice,
    product.originalPrice,
    product.currency,
  );

  return (
    <Link href={`/products/${product.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#f3ecdf]">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              priority={priority}
              loading={priority ? "eager" : "lazy"}
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}

          {hasDiscount ? (
            <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
              {product.discountPercentage}% OFF
            </span>
          ) : null}

          <span className="absolute bottom-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-foreground uppercase backdrop-blur">
            {getProductBadgeLabel(product)}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-2 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            <span className="truncate">{product.brand || product.category}</span>
            {product.petType ? (
              <span className="shrink-0 rounded-full border border-border px-2 py-0.5">
                {product.petType}
              </span>
            ) : (
              <span className="shrink-0 rounded-full border border-border px-2 py-0.5">
                {product.category}
              </span>
            )}
          </div>

          <h3 className="line-clamp-2 min-h-[2.75rem] font-heading text-lg leading-snug font-semibold">
            {product.name}
          </h3>

          {product.rating !== null ? (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">
                {product.rating.toFixed(1)}
              </span>
              {product.totalReviews !== null ? (
                <span>({product.totalReviews.toLocaleString()})</span>
              ) : null}
            </div>
          ) : null}

          <div className="mt-auto space-y-2 border-t border-border/70 pt-3">
            <div className="flex flex-wrap items-end gap-2">
              <span className="text-2xl font-semibold tabular-nums">
                {formatPrice(product.currentPrice, product.currency)}
              </span>
              {product.originalPrice !== null &&
              product.originalPrice > product.currentPrice ? (
                <span className="pb-0.5 text-sm text-muted-foreground line-through tabular-nums">
                  {formatPrice(product.originalPrice, product.currency)}
                </span>
              ) : null}
            </div>
            {savings ? (
              <p className="text-sm font-medium text-primary">
                You save {savings}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">In stock</p>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
