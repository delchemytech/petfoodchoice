"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/modules/common/utils";
import { getDisplayImageUrls } from "@/modules/common/lib/product-images";

interface ProductImageGalleryProps {
  imageUrl: string;
  imageUrls: string[];
  productName: string;
  discountPercentage?: number | null;
}

export function ProductImageGallery({
  imageUrl,
  imageUrls,
  productName,
  discountPercentage = null,
}: ProductImageGalleryProps) {
  const images = getDisplayImageUrls(imageUrl, imageUrls);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0] ?? "";
  const hasDiscount = discountPercentage !== null && discountPercentage > 0;

  if (!activeImage) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-[2rem] border border-border/70 bg-[#f3ecdf] text-muted-foreground">
        No image available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-border/70 bg-[#f3ecdf]">
        <Image
          key={activeImage}
          src={activeImage}
          alt={productName}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
        {hasDiscount ? (
          <span className="absolute top-4 left-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            {discountPercentage}% OFF
          </span>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {images.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={index === activeIndex}
              className={cn(
                "relative size-20 overflow-hidden rounded-xl border bg-[#f3ecdf]",
                index === activeIndex
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border/70",
              )}
            >
              <Image
                src={url}
                alt={`${productName} ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
