"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/modules/common/utils";
import { formatPrice } from "../lib/format-price";
import { getProductBadgeLabel } from "../lib/store-offers";
import type { StorefrontProduct } from "../types";

const SLIDE_INTERVAL_MS = 4500;

interface HeroProductSliderProps {
  products: StorefrontProduct[];
}

function HeroSliderFallback() {
  return (
    <div className="flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[2rem] border border-border/70 bg-gradient-to-br from-amber-50 via-background to-primary/10 p-8 shadow-xl">
      <p className="font-heading text-3xl font-semibold leading-tight text-foreground">
        Fresh picks for
        <br />
        <span className="text-primary">happy pets.</span>
      </p>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground">
        Browse top-rated food, treats, and care essentials curated for every
        pet and life stage.
      </p>
    </div>
  );
}

export function HeroProductSlider({ products }: HeroProductSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (products.length <= 1 || isPaused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % products.length);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isPaused, products.length]);

  if (products.length === 0) {
    return <HeroSliderFallback />;
  }

  return (
    <div
      className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-border/70 bg-[#f3ecdf] shadow-xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {products.map((product, index) => {
        const isActive = index === activeIndex;
        const hasDiscount =
          product.discountPercentage !== null && product.discountPercentage > 0;

        return (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            aria-hidden={!isActive}
            tabIndex={isActive ? 0 : -1}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-in-out",
              isActive
                ? "z-10 opacity-100"
                : "pointer-events-none z-0 opacity-0",
            )}
          >
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 480px"
                priority={index === 0}
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-muted text-sm text-muted-foreground">
                No image
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5" />

            {hasDiscount ? (
              <span className="absolute top-5 left-5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                {product.discountPercentage}% OFF
              </span>
            ) : null}

            <div className="absolute inset-x-0 bottom-0 space-y-2 p-8 text-white">
              <p className="text-xs font-semibold tracking-[0.18em] text-white/75 uppercase">
                {getProductBadgeLabel(product)}
              </p>
              <h3 className="font-heading line-clamp-2 text-2xl leading-tight font-semibold">
                {product.name}
              </h3>
              <p className="text-xl font-semibold tabular-nums">
                {formatPrice(product.currentPrice, product.currency)}
              </p>
            </div>
          </Link>
        );
      })}

      <div className="pointer-events-none absolute top-5 right-5 z-20 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-white uppercase backdrop-blur">
        Featured
      </div>

      {products.length > 1 ? (
        <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center gap-2">
          {products.map((product, index) => (
            <button
              key={product.id}
              type="button"
              aria-label={`Show ${product.name}`}
              aria-current={index === activeIndex}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "size-2 rounded-full transition-all",
                index === activeIndex
                  ? "w-6 bg-white"
                  : "bg-white/45 hover:bg-white/70",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
