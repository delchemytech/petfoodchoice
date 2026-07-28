import Link from "next/link";
import { ArrowRight, Stethoscope } from "lucide-react";
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
            <Stethoscope className="size-3.5" />
            Curated picks · Updated weekly
          </div>

          <div className="space-y-3">
            <h1 className="font-heading text-4xl leading-[1.05] font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Better deals for{" "}
              <span className="text-primary">smart shoppers.</span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              We compare prices across partner stores so you don&apos;t have to —
              then link you to the best live deal on products worth buying.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              size="lg"
              className="h-12 rounded-full px-6"
              render={<Link href="/#picks" />}
            >
              Shop this week&apos;s picks
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-foreground/15 bg-background/80 px-6"
              render={<Link href="/#trust" />}
            >
              How we pick
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/80 bg-card/80 p-4 backdrop-blur sm:grid-cols-4">
            {[
              { value: "120+", label: "Products reviewed" },
              { value: "4.5★", label: "Average rating" },
              { value: "0", label: "Sponsored placements" },
              { value: "Daily", label: "Price checks" },
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
