import { Heart, Leaf, Shield, Truck } from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Made for pets",
    description:
      "Food, treats, and essentials chosen for nutrition, taste, and everyday use.",
    number: "01",
  },
  {
    icon: Leaf,
    title: "Clear pricing",
    description:
      "See the price upfront with savings highlighted when items are on offer.",
    number: "02",
  },
  {
    icon: Shield,
    title: "Trusted brands",
    description:
      "We stock familiar names pet parents already know and recommend.",
    number: "03",
  },
];

const badges = [
  { icon: Truck, label: "Fast dispatch" },
  { icon: Shield, label: "Secure checkout" },
  { icon: Leaf, label: "Fresh arrivals weekly" },
];

export function TrustSection() {
  return (
    <section id="trust" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="max-w-2xl space-y-3">
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          A pet store built for{" "}
          <span className="text-primary underline decoration-primary/30 decoration-wavy underline-offset-4">
            real routines.
          </span>
        </h2>
        <p className="text-muted-foreground">
          From puppy kibble to senior formulas, find the right products without
          the clutter of a marketplace search.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm"
          >
            <div className="mb-6 flex items-start justify-between">
              <div className="flex size-10 items-center justify-center rounded-full bg-accent text-primary">
                <feature.icon className="size-4" />
              </div>
              <span className="font-heading text-4xl font-semibold text-muted/80">
                {feature.number}
              </span>
            </div>
            <h3 className="font-heading text-xl font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {badges.map((badge) => (
          <div
            key={badge.label}
            className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background px-4 py-3"
          >
            <badge.icon className="size-4 shrink-0 text-primary" />
            <span className="text-sm font-medium">{badge.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
