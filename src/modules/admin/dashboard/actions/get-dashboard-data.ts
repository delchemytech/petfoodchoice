"use server";

import { getProducts } from "@/modules/admin/products/actions/get-products";
import type { Product } from "@/modules/admin/products/types";
import {
  getProductListingPrice,
  getProductStoreLabel,
} from "@/modules/admin/products/lib/product-display";
import { formatRelativeTime } from "../lib/format-date";
import type {
  DashboardData,
  DashboardStat,
  RecentActivity,
  RecentProduct,
} from "../types";

function formatPrice(value: number, currency: string) {
  const locale = currency === "INR" ? "en-IN" : "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function buildStats(products: Product[]): DashboardStat[] {
  const total = products.length;
  const active = products.filter((product) => product.status === "active").length;
  const inactive = total - active;
  const activePercent = total > 0 ? Math.round((active / total) * 100) : 0;

  return [
    {
      id: "total-products",
      label: "Total Products",
      value: String(total),
      change: `${inactive} inactive`,
      trend: "neutral",
    },
    {
      id: "active-products",
      label: "Active Products",
      value: String(active),
      change: `${activePercent}% of catalog`,
      trend: active > 0 ? "up" : "neutral",
    },
  ];
}

function buildRecentProducts(products: Product[]): RecentProduct[] {
  return products.slice(0, 5).map((product) => ({
    id: product.id,
    name: product.name,
    store: getProductStoreLabel(product),
    category: product.category,
    status: product.status,
    price: formatPrice(getProductListingPrice(product), product.currency),
  }));
}

function buildRecentActivity(products: Product[]): RecentActivity[] {
  return [...products]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 5)
    .map((product) => {
      const created = new Date(product.createdAt).getTime();
      const updated = new Date(product.updatedAt).getTime();
      const isNew = Math.abs(updated - created) < 60_000;

      return {
        id: product.id,
        action: isNew ? "Product added" : "Product updated",
        target: product.name,
        timestamp: formatRelativeTime(product.updatedAt),
      };
    });
}

export async function getDashboardData(): Promise<DashboardData> {
  const products = await getProducts();

  return {
    stats: buildStats(products),
    recentProducts: buildRecentProducts(products),
    recentActivity: buildRecentActivity(products),
  };
}
