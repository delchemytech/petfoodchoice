"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Scale, X } from "lucide-react";
import { Button } from "@/modules/common/ui/button";
import { useCompare } from "../lib/compare-context";

export function CompareFloatingBar() {
  const { compareMode, selectedProducts, remove, clearAll } = useCompare();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  // Animate in/out based on compare mode + selection count
  useEffect(() => {
    if (compareMode && selectedProducts.length > 0) {
      const t = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [compareMode, selectedProducts.length]);

  if (!compareMode || selectedProducts.length === 0) return null;

  const canCompare = selectedProducts.length === 2;

  function handleCompare() {
    if (!canCompare) return;
    router.push(`/compare`);
  }

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0"
      }`}
    >
      <div className="mx-auto max-w-2xl px-4 pb-4 sm:pb-6">
        <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card/95 p-3 shadow-xl backdrop-blur-lg sm:gap-4 sm:p-4">
          {/* Scale icon */}
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Scale className="size-5" />
          </div>

          {/* Selected product thumbnails */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {selectedProducts.map((product) => (
              <div
                key={product.id}
                className="group/thumb relative flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 p-1.5 pr-3 transition-colors"
              >
                <div className="relative size-9 shrink-0 overflow-hidden rounded-lg bg-[#f3ecdf]">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="36px"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-[8px] text-muted-foreground">
                      ?
                    </div>
                  )}
                </div>
                <span className="hidden max-w-[80px] truncate text-xs font-medium sm:block">
                  {product.name}
                </span>
                <button
                  type="button"
                  onClick={() => remove(product.id)}
                  className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Remove from comparison"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}

            {selectedProducts.length < 2 ? (
              <div className="flex h-[42px] flex-1 items-center justify-center rounded-xl border border-dashed border-border/60 px-3 text-[11px] text-muted-foreground">
                Select 1 more
              </div>
            ) : null}
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full text-muted-foreground"
              onClick={clearAll}
            >
              Clear
            </Button>
            <Button
              size="sm"
              className="rounded-full"
              disabled={!canCompare}
              onClick={handleCompare}
            >
              Compare
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
