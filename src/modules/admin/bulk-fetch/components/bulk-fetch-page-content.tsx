"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Download, Loader2, Pencil, Save, Square } from "lucide-react";
import { PageHeader } from "@/modules/admin/components/page-header";
import { Button } from "@/modules/common/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/modules/common/ui/dialog";
import { Input } from "@/modules/common/ui/input";
import { Label } from "@/modules/common/ui/label";
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
import { saveBulkProducts } from "../actions/save-bulk-products";
import { formatPetFoodAttributeSummary } from "@/modules/common/lib/product-attribute-options";
import { AMAZON_SEARCH } from "../lib/amazon/config";
import { downloadProductsCsv } from "../lib/csv";
import { mergeFetchedProduct } from "../lib/map-fetched-product";
import { BulkFetchPetFoodEditDialog } from "./bulk-fetch-pet-food-edit-dialog";
import type {
  BulkFetchedProduct,
  ProductDetailResult,
  SearchPageResult,
} from "../types";

function formatMoney(value: string, currency: string): string {
  if (!value.trim()) return "—";
  const amount = Number.parseFloat(value);
  if (Number.isNaN(amount)) return "—";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return value;
  }
}

function formatCount(value: string): string {
  if (!value.trim()) return "—";
  const amount = Number.parseInt(value, 10);
  if (Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("en-IN").format(amount);
}

function discountLabel(product: BulkFetchedProduct): string {
  if (product.amazonDiscountPercentage.trim()) {
    return `-${product.amazonDiscountPercentage}%`;
  }
  return "—";
}

async function readApiError(response: Response): Promise<string> {
  const data: unknown = await response.json().catch(() => null);
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof data.error === "string"
  ) {
    return data.error;
  }
  return "Request failed.";
}

async function requestSearchPage(
  keyword: string,
  page: number,
  signal: AbortSignal,
): Promise<SearchPageResult> {
  const response = await fetch("/api/amazon/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keyword, page }),
    signal,
  });
  if (!response.ok) throw new Error(await readApiError(response));
  return (await response.json()) as SearchPageResult;
}

async function requestProductDetail(
  asin: string,
  signal: AbortSignal,
): Promise<ProductDetailResult> {
  const response = await fetch("/api/amazon/product", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ asin }),
    signal,
  });
  if (!response.ok) throw new Error(await readApiError(response));
  return (await response.json()) as ProductDetailResult;
}

interface BulkFetchPageContentProps {
  categories: string[];
}

function saveSummary(result: {
  saved: number;
  skippedExisting: number;
  skippedInvalid: number;
}): string {
  const parts = [`Saved ${result.saved} product${result.saved === 1 ? "" : "s"} to the catalog.`];
  if (result.skippedExisting > 0) {
    parts.push(`${result.skippedExisting} already in the catalog.`);
  }
  if (result.skippedInvalid > 0) {
    parts.push(
      `${result.skippedInvalid} skipped (missing price, name, or other required fields).`,
    );
  }
  return parts.join(" ");
}

export function BulkFetchPageContent({ categories }: BulkFetchPageContentProps) {
  const [isSaving, startSaveTransition] = useTransition();
  const [keyword, setKeyword] = useState("");
  const [saveCategory, setSaveCategory] = useState(
    categories.length === 1 ? categories[0] : "",
  );
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [products, setProducts] = useState<BulkFetchedProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [completedMessage, setCompletedMessage] = useState("");
  const [saveSuccessOpen, setSaveSuccessOpen] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState("");
  const [editingProduct, setEditingProduct] = useState<BulkFetchedProduct | null>(
    null,
  );
  const [showFetchMore, setShowFetchMore] = useState(false);
  const [nextPage, setNextPage] = useState(1);
  const abortRef = useRef<AbortController | null>(null);
  const productsRef = useRef<BulkFetchedProduct[]>([]);

  const resultCount = products.length;

  const subtitle = useMemo(() => {
    if (!hasSearched) {
      return "Enter a brand or product name. Fetch from amazon.in, then save to the catalog.";
    }
    if (isSearching) return status || "Fetching…";
    return `${resultCount} unique products for “${submittedKeyword}”`;
  }, [hasSearched, isSearching, resultCount, status, submittedKeyword]);

  function clearFetchedResults() {
    abortRef.current?.abort();
    productsRef.current = [];
    setProducts([]);
    setKeyword("");
    setSubmittedKeyword("");
    setHasSearched(false);
    setCompletedMessage("");
    setShowFetchMore(false);
    setNextPage(1);
    setStatus("");
    setError("");
  }

  function updateProductAttributes(updated: BulkFetchedProduct) {
    const nextProducts = productsRef.current.map((product) =>
      product.asin === updated.asin ? updated : product,
    );
    productsRef.current = nextProducts;
    setProducts(nextProducts);
  }

  async function enrichProducts(
    listings: BulkFetchedProduct[],
    signal: AbortSignal,
  ): Promise<{ products: BulkFetchedProduct[]; blocked: boolean }> {
    const existing = productsRef.current;
    const enriched: BulkFetchedProduct[] = [];

    const commit = (extra: BulkFetchedProduct[] = []) => {
      productsRef.current = [...existing, ...enriched, ...extra];
    };

    for (let index = 0; index < listings.length; index += 1) {
      if (signal.aborted) {
        commit(listings.slice(index));
        return {
          products: productsRef.current.slice(existing.length),
          blocked: false,
        };
      }

      const listing = listings[index];
      setStatus(`Fetching product details ${index + 1} of ${listings.length}…`);

      try {
        const result = await requestProductDetail(listing.asin, signal);
        if (result.blocked) {
          commit([listing, ...listings.slice(index + 1)]);
          return {
            products: productsRef.current.slice(existing.length),
            blocked: true,
          };
        }
        enriched.push(mergeFetchedProduct(listing, result.product));
        commit();
      } catch (caught) {
        if (
          signal.aborted ||
          (caught instanceof DOMException && caught.name === "AbortError")
        ) {
          commit(listings.slice(index));
          return {
            products: productsRef.current.slice(existing.length),
            blocked: false,
          };
        }
        throw caught;
      }
    }

    commit();
    return { products: enriched, blocked: false };
  }

  async function runBatch(
    query: string,
    startPage: number,
    signal: AbortSignal,
    reset: boolean,
  ) {
    if (reset) {
      productsRef.current = [];
      setProducts([]);
    }

    setIsSearching(true);
    setShowFetchMore(false);
    setCompletedMessage("");
    setError("");

    const seen = new Set(productsRef.current.map((product) => product.asin));
    const endPage = Math.min(
      startPage + AMAZON_SEARCH.batchPages - 1,
      AMAZON_SEARCH.maxPage,
    );

    let lastHasNext = false;
    let stoppedForRepeats = false;
    let blocked = false;
    const newListings: BulkFetchedProduct[] = [];

    for (let page = startPage; page <= endPage; page += 1) {
      if (signal.aborted) break;

      setStatus(`Fetching search page ${page} of ${endPage}…`);

      const result = await requestSearchPage(query, page, signal);
      if (result.blocked) {
        blocked = true;
        setError(
          "Amazon paused the request (bot check or rate limit). Wait a few minutes, then try again.",
        );
        break;
      }

      const uniqueNew = result.products.filter(
        (product) => !seen.has(product.asin),
      );
      const pageCount = result.products.length;

      if (pageCount === 0) {
        lastHasNext = false;
        break;
      }

      const duplicateRatio = 1 - uniqueNew.length / pageCount;
      for (const product of uniqueNew) {
        seen.add(product.asin);
        newListings.push(product);
      }

      lastHasNext = result.hasNext;

      if (
        uniqueNew.length === 0 ||
        duplicateRatio >= AMAZON_SEARCH.duplicateStopRatio
      ) {
        stoppedForRepeats = true;
        lastHasNext = false;
        break;
      }

      if (!result.hasNext) {
        break;
      }
    }

    if (newListings.length > 0 && !blocked) {
      const detailed = await enrichProducts(newListings, signal);
      if (detailed.blocked) {
        blocked = true;
        setError(
          "Amazon paused while loading product details. Showing what we collected.",
        );
      }
    } else if (newListings.length > 0) {
      productsRef.current = [...productsRef.current, ...newListings];
    }

    setProducts(productsRef.current);

    const canFetchMore =
      !signal.aborted &&
      !blocked &&
      !stoppedForRepeats &&
      lastHasNext &&
      endPage < AMAZON_SEARCH.maxPage;

    if (canFetchMore) {
      setNextPage(endPage + 1);
      setShowFetchMore(true);
    } else {
      setShowFetchMore(false);
    }

    if (!signal.aborted && productsRef.current.length > 0) {
      setCompletedMessage(
        `Fetch completed. ${productsRef.current.length} products ready to save.`,
      );
    }

    setStatus("");
    setIsSearching(false);
  }

  async function startSearch(query: string, startPage: number, reset: boolean) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setHasSearched(true);
    setSubmittedKeyword(query);

    try {
      await runBatch(query, startPage, controller.signal, reset);
    } catch (caught) {
      if (controller.signal.aborted) return;
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      const message =
        caught instanceof Error ? caught.message : "Search failed.";
      setError(message);
      setIsSearching(false);
      setStatus("");
    }
  }

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = keyword.trim();
    if (!query || isSearching || isSaving) return;
    void startSearch(query, 1, true);
  }

  function handleFetchMore() {
    if (isSearching || isSaving || !submittedKeyword) return;
    void startSearch(submittedKeyword, nextPage, false);
  }

  function handleStop() {
    abortRef.current?.abort();
    setIsSearching(false);
    setStatus("");
    if (productsRef.current.length > 0) {
      setProducts(productsRef.current);
      setCompletedMessage("Fetch stopped. Showing products collected so far.");
    }
  }

  function handleDownload() {
    if (!products.length) return;
    downloadProductsCsv(products, submittedKeyword || keyword);
  }

  function handleSave() {
    if (!products.length || isSearching || isSaving) return;
    if (!saveCategory) {
      setError("Select a catalog category before saving.");
      return;
    }

    setError("");
    setCompletedMessage("");
    startSaveTransition(async () => {
      const result = await saveBulkProducts(products, saveCategory);
      if (!result.success) {
        setError(result.error);
        return;
      }
      if (result.saved === 0 && result.skippedExisting === 0 && result.skippedInvalid === 0) {
        setError("Nothing to save.");
        return;
      }

      if (result.saved > 0) {
        clearFetchedResults();
        setSaveSuccessMessage(saveSummary(result));
        setSaveSuccessOpen(true);
        return;
      }

      setError(saveSummary(result));
    });
  }

  function handleSaveSuccessClose(open: boolean) {
    setSaveSuccessOpen(open);
    if (!open) {
      setSaveSuccessMessage("");
    }
  }

  return (
    <>
      <PageHeader
        title="Bulk Fetch"
        description={subtitle}
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            {isSearching ? (
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleStop}
              >
                <Square data-icon="inline-start" className="size-3.5" />
                Stop
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleDownload}
              disabled={!products.length || isSearching || isSaving}
            >
              <Download data-icon="inline-start" />
              Download CSV
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={handleSave}
              disabled={
                !products.length ||
                isSearching ||
                isSaving ||
                categories.length === 0
              }
            >
              {isSaving ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <Save data-icon="inline-start" />
              )}
              {isSaving ? "Saving…" : "Save to catalog"}
            </Button>
          </div>
        }
      />

      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <Label className="sr-only" htmlFor="bulk-fetch-keyword">
          Search keyword
        </Label>
        <Input
          id="bulk-fetch-keyword"
          type="search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Brand or product, e.g. pedigree dog food"
          autoComplete="off"
          maxLength={AMAZON_SEARCH.maxKeywordLength}
          className="h-9 sm:max-w-md"
        />
        <Button
          type="submit"
          size="lg"
          disabled={!keyword.trim() || isSearching || isSaving}
          className="w-full sm:w-auto"
        >
          {isSearching ? "Fetching…" : "Search amazon.in"}
        </Button>
        <Select
          value={saveCategory}
          onValueChange={(value) => {
            setSaveCategory(value ?? "");
          }}
          disabled={isSearching || isSaving || categories.length === 0}
        >
          <SelectTrigger className="h-9 w-full sm:w-56">
            <SelectValue placeholder="Category to save" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </form>

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {error}
        </div>
      ) : null}

      {completedMessage && !isSearching ? (
        <div
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          {completedMessage}
        </div>
      ) : null}

      {showFetchMore && !isSearching ? (
        <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <p>
            There may be more products after page {nextPage - 1}. Fetch the next{" "}
            {AMAZON_SEARCH.batchPages} pages?
          </p>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={handleFetchMore} disabled={isSaving}>
              Fetch more
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowFetchMore(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border">
        {isSearching ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
            <Loader2 className="size-10 animate-spin text-primary" />
            <div>
              <p className="font-medium">{status || "Fetching from amazon.in…"}</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Slow on purpose: one page at a time, with a pause between each
                request. The table appears when this batch is finished.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[1480px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>ASIN</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Pet food</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>List price</TableHead>
                  <TableHead>Off</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Reviews</TableHead>
                  <TableHead>Images</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>URL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={13}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {hasSearched
                        ? "No products found for this keyword."
                        : "Search a brand or product to fill this table."}
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.asin}>
                      <TableCell className="max-w-[280px] whitespace-normal">
                        <div className="flex items-center gap-3">
                          <ProductThumb
                            title={product.name}
                            imageUrl={product.imageUrl}
                          />
                          <span
                            className="line-clamp-2 font-medium leading-snug"
                            title={product.name}
                          >
                            {product.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {product.asin}
                      </TableCell>
                      <TableCell>{product.brand || "—"}</TableCell>
                      <TableCell className="max-w-[160px] truncate">
                        {product.category || "—"}
                      </TableCell>
                      <TableCell className="max-w-[220px] whitespace-normal">
                        <div className="space-y-2">
                          <p
                            className="line-clamp-3 text-xs text-muted-foreground"
                            title={formatPetFoodAttributeSummary(product)}
                          >
                            {formatPetFoodAttributeSummary(product) || "—"}
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => setEditingProduct(product)}
                          >
                            <Pencil data-icon="inline-start" />
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatMoney(
                          product.amazonCurrentPrice,
                          product.currency,
                        )}
                      </TableCell>
                      <TableCell className="tabular-nums text-muted-foreground line-through">
                        {formatMoney(
                          product.amazonOriginalPrice,
                          product.currency,
                        )}
                      </TableCell>
                      <TableCell>{discountLabel(product)}</TableCell>
                      <TableCell>
                        {product.rating.trim()
                          ? Number.parseFloat(product.rating).toFixed(1)
                          : "—"}
                      </TableCell>
                      <TableCell>{formatCount(product.totalReviews)}</TableCell>
                      <TableCell>
                        <ImageList
                          urls={product.imageUrls}
                          title={product.name}
                        />
                      </TableCell>
                      <TableCell className="max-w-[280px]">
                        <p
                          className="truncate text-muted-foreground"
                          title={product.shortDescription}
                        >
                          {product.shortDescription || "—"}
                        </p>
                      </TableCell>
                      <TableCell>
                        {product.amazonSourceUrl ? (
                          <a
                            href={product.amazonSourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline-offset-2 hover:underline"
                          >
                            Open
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <BulkFetchPetFoodEditDialog
        product={editingProduct}
        open={editingProduct !== null}
        onOpenChange={(open) => {
          if (!open) setEditingProduct(null);
        }}
        onSave={updateProductAttributes}
      />

      <Dialog open={saveSuccessOpen} onOpenChange={handleSaveSuccessClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-600" />
              Products saved
            </DialogTitle>
            <DialogDescription>{saveSuccessMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              render={<Link href="/admin/products" />}
            >
              View products
            </Button>
            <Button onClick={() => handleSaveSuccessClose(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ImageList({ urls, title }: { urls: string[]; title: string }) {
  if (!urls.length) return <span className="text-muted-foreground">—</span>;

  return (
    <div className="flex max-w-[220px] flex-col gap-1">
      <p className="text-[11px] text-muted-foreground">{urls.length} images</p>
      <div className="flex flex-wrap gap-1">
        {urls.map((url) => (
          <a key={url} href={url} target="_blank" rel="noreferrer" title={title}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              referrerPolicy="no-referrer"
              className="size-10 rounded border bg-muted object-contain"
            />
          </a>
        ))}
      </div>
    </div>
  );
}

function ProductThumb({
  title,
  imageUrl,
}: {
  title: string;
  imageUrl: string;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        referrerPolicy="no-referrer"
        className="size-12 shrink-0 rounded-md border bg-muted object-contain"
      />
    );
  }

  const initial = title.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      aria-hidden
      className="flex size-12 shrink-0 items-center justify-center rounded-md border bg-muted text-sm font-semibold text-muted-foreground"
    >
      {initial}
    </div>
  );
}
