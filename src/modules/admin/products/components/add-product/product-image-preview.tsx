"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus } from "lucide-react";
import {
  MAX_PRODUCT_IMAGES,
  normalizeProductImageUrls,
} from "@/modules/common/lib/product-images";
import { FormMessage } from "@/modules/common/ui/form-message";
import { Label } from "@/modules/common/ui/label";
import { Textarea } from "@/modules/common/ui/textarea";
import { cn } from "@/modules/common/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/common/ui/card";

interface ProductImagePreviewProps {
  imageUrls: string[];
  productName: string;
  error?: string;
  onImageUrlsChange: (urls: string[]) => void;
}

export function ProductImagePreview({
  imageUrls,
  productName,
  error,
  onImageUrlsChange,
}: ProductImagePreviewProps) {
  const normalizedUrls = normalizeProductImageUrls(imageUrls);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeUrl = normalizedUrls[activeIndex] ?? normalizedUrls[0] ?? "";

  function handleUrlsChange(value: string) {
    const urls = value
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);

    onImageUrlsChange(normalizeProductImageUrls(urls));
    setActiveIndex(0);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Images</CardTitle>
        <CardDescription>
          Gallery images fetched from the store. One URL per line (up to{" "}
          {MAX_PRODUCT_IMAGES}).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted/30">
          {activeUrl ? (
            <Image
              src={activeUrl}
              alt={productName || "Product preview"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 320px"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImagePlus className="size-10" />
              <span className="text-xs">No image available</span>
            </div>
          )}
        </div>

        {normalizedUrls.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {normalizedUrls.map((url, index) => (
              <button
                key={`${url}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "relative size-16 overflow-hidden rounded-lg border",
                  index === activeIndex
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border",
                )}
              >
                <Image
                  src={url}
                  alt={`${productName} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="imageUrls">Image URLs</Label>
          <Textarea
            id="imageUrls"
            value={normalizedUrls.join("\n")}
            onChange={(event) => handleUrlsChange(event.target.value)}
            rows={Math.min(Math.max(normalizedUrls.length, 3), 8)}
            placeholder={"https://...\nhttps://..."}
            aria-invalid={Boolean(error)}
            className={cn("font-mono text-xs", error && "border-destructive")}
          />
          <FormMessage message={error} />
        </div>
      </CardContent>
    </Card>
  );
}
