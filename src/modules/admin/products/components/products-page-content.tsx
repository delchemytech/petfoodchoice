"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "../../components/page-header";
import { Button } from "@/modules/common/ui/button";
import { Input } from "@/modules/common/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/common/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/common/ui/table";
import { deleteProduct } from "../actions/delete-product";
import {
  getAmazonDisplayPrice,
  getFlipkartDisplayPrice,
  getProductStoreLabel,
} from "../lib/product-display";
import { filterProducts } from "../hooks/use-products";
import {
  PRODUCT_STATUSES,
  type Product,
  type ProductStatus,
} from "../types";
import { DeleteProductDialog } from "./delete-product-dialog";
import { ProductStatusBadge } from "./product-status-badge";

function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatOptionalPrice(
  value: number | null,
  currency: string,
  hasListing: boolean,
) {
  if (!hasListing) {
    return "—";
  }

  if (value === null) {
    return "—";
  }

  return formatPrice(value, currency);
}

function ProductStorePrices({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const hasAmazon = product.amazonAffiliateUrl.trim().length > 0;
  const hasFlipkart = product.flipkartAffiliateUrl.trim().length > 0;
  const amazonPrice = getAmazonDisplayPrice(product);
  const flipkartPrice = getFlipkartDisplayPrice(product);

  return (
    <div className={className}>
      <div className="tabular-nums">
        <span className="text-muted-foreground">Amazon </span>
        <span className="font-medium">
          {formatOptionalPrice(amazonPrice, product.currency, hasAmazon)}
        </span>
      </div>
      <div className="tabular-nums">
        <span className="text-muted-foreground">Flipkart </span>
        <span className="font-medium">
          {formatOptionalPrice(flipkartPrice, product.currency, hasFlipkart)}
        </span>
      </div>
    </div>
  );
}

interface ProductsPageContentProps {
  initialProducts: Product[];
  categories: string[];
}

function ProductActions({
  product,
  onDelete,
}: {
  product: Product;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        nativeButton={false}
        render={
          <Link
            href={`/products/${product.slug}?preview=true`}
            target="_blank"
            rel="noopener noreferrer"
          />
        }
        aria-label={`Preview ${product.name}`}
      >
        <Eye />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        nativeButton={false}
        render={<Link href={`/admin/products/edit/${product.id}`} />}
        aria-label={`Edit ${product.name}`}
      >
        <Pencil />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-destructive hover:text-destructive"
        aria-label={`Delete ${product.name}`}
        onClick={onDelete}
      >
        <Trash2 />
      </Button>
    </div>
  );
}

export function ProductsPageContent({
  initialProducts,
  categories,
}: ProductsPageContentProps) {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ProductStatus | "all">("all");
  const [category, setCategory] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const filteredProducts = useMemo(
    () => filterProducts(products, query, status, category, categories),
    [products, query, status, category, categories],
  );

  function handleDelete() {
    if (!deleteTarget) return;

    startDeleteTransition(async () => {
      try {
        await deleteProduct(deleteTarget.id);
        setProducts((current) =>
          current.filter((product) => product.id !== deleteTarget.id),
        );
        setDeleteTarget(null);
      } catch (error) {
        console.error(error);
      }
    });
  }

  const emptyMessage =
    products.length === 0
      ? "No products yet. Add your first product to get started."
      : "No products match your filters.";

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage your affiliate product catalog."
        actions={
          <Button
            className="w-full sm:w-auto"
            render={<Link href="/admin/products/add" />}
          >
            <Plus data-icon="inline-start" />
            Add Product
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:flex xl:flex-row">
        <Input
          placeholder="Search by name, brand, or category..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="xl:max-w-xs"
        />

        <Select
          value={status}
          onValueChange={(value) => {
            if (value) setStatus(value as ProductStatus | "all");
          }}
        >
          <SelectTrigger className="w-full xl:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {PRODUCT_STATUSES.map((item) => (
              <SelectItem key={item} value={item}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={category}
          onValueChange={(value) => {
            if (value) setCategory(value);
          }}
        >
          <SelectTrigger className="w-full xl:w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 lg:hidden">
        {filteredProducts.length === 0 ? (
          <div className="rounded-xl border px-4 py-10 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="flex gap-3 rounded-xl border p-3"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="min-w-0 space-y-1">
                  <p className="line-clamp-2 font-medium leading-snug">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {product.brand || "No brand"} · {getProductStoreLabel(product)} ·{" "}
                    {product.category}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-2">
                    <ProductStatusBadge status={product.status} />
                    <ProductStorePrices product={product} className="text-sm" />
                  </div>
                  <ProductActions
                    product={product}
                    onDelete={() =>
                      setDeleteTarget({
                        id: product.id,
                        name: product.name,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-hidden rounded-xl border lg:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden lg:table-cell">Store</TableHead>
                <TableHead className="hidden lg:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden text-right xl:table-cell">
                  Amazon Price
                </TableHead>
                <TableHead className="hidden text-right xl:table-cell">
                  Flipkart Price
                </TableHead>
                <TableHead className="text-right xl:hidden">Prices</TableHead>
                <TableHead className="w-28 text-right xl:w-36">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] whitespace-normal xl:max-w-[240px]">
                      <div className="min-w-0 space-y-0.5">
                        <p
                          className="truncate font-medium"
                          title={product.name}
                        >
                          {product.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {product.brand || "No brand"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground lg:hidden">
                          {getProductStoreLabel(product)} · {product.category}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden max-w-[120px] truncate lg:table-cell">
                      {getProductStoreLabel(product)}
                    </TableCell>
                    <TableCell className="hidden max-w-[140px] truncate lg:table-cell">
                      {product.category}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <ProductStatusBadge status={product.status} />
                    </TableCell>
                    <TableCell className="hidden text-right tabular-nums xl:table-cell">
                      {formatOptionalPrice(
                        getAmazonDisplayPrice(product),
                        product.currency,
                        product.amazonAffiliateUrl.trim().length > 0,
                      )}
                    </TableCell>
                    <TableCell className="hidden text-right tabular-nums xl:table-cell">
                      {formatOptionalPrice(
                        getFlipkartDisplayPrice(product),
                        product.currency,
                        product.flipkartAffiliateUrl.trim().length > 0,
                      )}
                    </TableCell>
                    <TableCell className="text-right xl:hidden">
                      <ProductStorePrices
                        product={product}
                        className="text-sm"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        <ProductActions
                          product={product}
                          onDelete={() =>
                            setDeleteTarget({
                              id: product.id,
                              name: product.name,
                            })
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredProducts.length} of {products.length} products
      </p>

      <DeleteProductDialog
        open={!!deleteTarget}
        productName={deleteTarget?.name ?? ""}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteTarget(null);
        }}
      />
    </>
  );
}
