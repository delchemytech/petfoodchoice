import Link from "next/link";
import { ArrowRight, PawPrint } from "lucide-react";
import { Button } from "@/modules/common/ui/button";
import type { StorefrontProduct } from "../types";
import { HeroProductSlider } from "./hero-product-slider";

interface HeroSectionProps {
  products: StorefrontProduct[];
}

export function HeroSection({ products }: HeroSectionProps) {
  return (
    <section className="storefront-grid-bg relative overflow-hidden border-b border-border/60">
      <div className="pointer-events-none absolute -right-16 top-8 size-72 rounded-full bg-primary/10 blur-3xl sm:size-96" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 size-64 rounded-full bg-amber-100/60 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground">
            <PawPrint className="size-3.5" />
            Premium pet nutrition · New arrivals weekly
          </div>

          <div className="space-y-3">
            <h1 className="font-heading text-4xl leading-[1.05] font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Everything your pet{" "}
              <span className="text-primary">loves to eat.</span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Shop trusted brands for dogs, cats, and more — dry food, wet food,
              treats, and everyday essentials in one place.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              size="lg"
              className="h-12 rounded-full px-6"
              render={<Link href="/#picks" />}
            >
              Shop all products
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-foreground/15 bg-background/80 px-6"
              render={<Link href="/#trust" />}
            >
              Why shop with us
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/80 bg-card/80 p-4 backdrop-blur sm:grid-cols-4">
            {[
              { value: "120+", label: "Products in store" },
              { value: "4.5★", label: "Customer rating" },
              { value: "50+", label: "Trusted brands" },
              { value: "Fast", label: "Dispatch" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1 px-1 text-center sm:text-left">
                <p className="font-heading text-xl font-semibold sm:text-2xl">
                  {stat.value}
                </p>
                <p className="text-xs leading-snug text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <HeroProductSlider products={products} />
        </div>
      </div>
    </section>
  );
}
