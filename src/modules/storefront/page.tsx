import { getStorefrontCategories } from "./actions/get-categories";
import {
  getStorefrontFilterFacets,
  getStorefrontProductsFiltered,
} from "./actions/get-catalog";
import { getStorefrontProducts } from "./actions/get-products";
import { HeroSection } from "./components/hero-section";
import { ProductCatalog } from "./components/product-catalog";
import { TrustSection } from "./components/trust-section";
import { ValueTicker } from "./components/value-ticker";
import {
  parseCatalogFilters,
  parseCatalogPage,
} from "./lib/catalog-search-params";

const HERO_PRODUCTS_LIMIT = 7;

interface StorefrontPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function StorefrontPage({
  searchParams = {},
}: StorefrontPageProps) {
  const filters = parseCatalogFilters(searchParams);
  const page = parseCatalogPage(searchParams);

  const [heroProducts, categories] = await Promise.all([
    getStorefrontProducts(HERO_PRODUCTS_LIMIT),
    getStorefrontCategories(),
  ]);

  const categoryNames = categories.map((category) => category.name);

  const [catalog, facets] = await Promise.all([
    getStorefrontProductsFiltered(filters, categoryNames, page),
    getStorefrontFilterFacets(filters, categoryNames),
  ]);

  return (
    <>
      <h1 className="sr-only">Buy premium Pet food for Dogs & Cats</h1>
      <HeroSection products={heroProducts} />
      <ValueTicker />
      <ProductCatalog
        products={catalog.products}
        total={catalog.total}
        page={catalog.page}
        totalPages={catalog.totalPages}
        categories={categoryNames}
        facets={facets}
      />
      <TrustSection />
    </>
  );
}
