const items = [
  "FREE DELIVERY ON PARTNER STORES",
  "PRICE COMPARISONS DAILY",
  "FRESH PICKS EVERY WEEK",
  "HONEST AFFILIATE LINKS",
  "NO PAID PLACEMENTS",
];

export function ValueTicker() {
  return (
    <div className="overflow-hidden border-b border-border/60 bg-secondary/70 py-3">
      <div className="flex animate-[marquee_28s_linear_infinite] gap-10 whitespace-nowrap">
        {[...items, ...items].map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-primary/80 uppercase"
          >
            <span className="size-1.5 rounded-full bg-primary/60" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
