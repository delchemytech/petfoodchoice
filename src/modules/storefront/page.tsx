import { getStorefrontCategories } from "./actions/get-categories";
import { getStorefrontProducts } from "./actions/get-products";
import { HeroSection } from "./components/hero-section";
import { ProductCatalog } from "./components/product-catalog";
import { TrustSection } from "./components/trust-section";
import { ValueTicker } from "./components/value-ticker";

const HERO_PRODUCTS_LIMIT = 7;

export default async function StorefrontPage() {
  const [products, categories] = await Promise.all([
    getStorefrontProducts(),
    getStorefrontCategories(),
  ]);

  return (
    <>
      <HeroSection products={products.slice(0, HERO_PRODUCTS_LIMIT)} />
      <ValueTicker />
      <ProductCatalog
        products={products}
        categories={categories.map((category) => category.name)}
      />
      <TrustSection />
    </>
  );
}
