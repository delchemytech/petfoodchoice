import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getStorefrontProductBySlug,
  getStorefrontProductPreviewBySlug,
} from "../../actions/get-product";
import { getStorefrontProducts } from "../../actions/get-products";
import { ProductDetailView } from "../../components/product-detail-view";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "true";

  const result = isPreview
    ? await getStorefrontProductPreviewBySlug(slug)
    : await getStorefrontProductBySlug(slug).then((product) =>
        product ? { product, status: "active" as const } : null,
      );

  if (!result) {
    return { title: "Product Not Found" };
  }

  return {
    title: `${result.product.name} | PETFOODCHOICE`,
    description: result.product.shortDescription,
  };
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "true";

  if (isPreview) {
    const result = await getStorefrontProductPreviewBySlug(slug);

    if (!result) {
      notFound();
    }

    return (
      <ProductDetailView
        product={result.product}
        preview={{
          status: result.status,
          editHref: `/admin/products/edit/${result.product.id}`,
          backHref: "/admin/products",
        }}
      />
    );
  }

  const product = await getStorefrontProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const allProducts = await getStorefrontProducts();
  const relatedProducts = allProducts
    .filter((item) => item.id !== product.id)
    .slice(0, 3);

  return <ProductDetailView product={product} relatedProducts={relatedProducts} />;
}
