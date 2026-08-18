import Link from "next/link";
import { sortCategoryNames } from "@/modules/common/lib/category-match";
import { getStorefrontCategories } from "../actions/get-categories";

const companyLinks = [
  { label: "About us", href: "/#trust" },
  { label: "Customer care", href: "mailto:hello@petfoodchoice.com" },
  { label: "Contact", href: "mailto:hello@petfoodchoice.com" },
];

const fallbackShopLinks = ["Food", "Toys", "Others"];

export async function SiteFooter() {
  const categories = await getStorefrontCategories();
  const shopLinks = sortCategoryNames(
    categories.length > 0
      ? categories.map((category) => category.name)
      : fallbackShopLinks,
  );

  return (
    <footer className="mt-auto border-t border-border/70 bg-[#f6f1e8]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <p className="font-heading text-2xl font-semibold">
            PET<span className="text-primary">FOODCHOICE</span>
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Your online pet store for food, treats, and everyday essentials —
            curated for dogs, cats, and more.
          </p>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold">Shop</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {shopLinks.map((link) => (
              <li key={link}>
                <Link
                  href="/#picks"
                  className="transition-colors hover:text-foreground"
                >
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold">Company</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {companyLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60 px-4 py-5 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} PETFOODCHOICE. All rights reserved.
      </div>
    </footer>
  );
}
