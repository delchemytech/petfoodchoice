"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { StorefrontProduct } from "../types";

const STORAGE_KEY = "pfc-compare-products";
const MAX_COMPARE = 2;

interface CompareContextValue {
  /** Whether compare mode is active (checkboxes visible) */
  compareMode: boolean;
  /** Toggle compare mode on/off */
  setCompareMode: (on: boolean) => void;
  /** Currently selected products (max 2) */
  selectedProducts: StorefrontProduct[];
  /** Toggle a product in / out of the compare list */
  toggle: (product: StorefrontProduct) => void;
  /** Whether a given product is currently selected */
  isSelected: (id: string) => boolean;
  /** Remove a specific product from the compare list */
  remove: (id: string) => void;
  /** Clear all selected products and exit compare mode */
  clearAll: () => void;
  /** Whether the compare list is full (2 selected) */
  isFull: boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

function readStorage(): StorefrontProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_COMPARE) : [];
  } catch {
    return [];
  }
}

function writeStorage(products: StorefrontProduct[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareMode, setCompareMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<StorefrontProduct[]>(
    [],
  );

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = readStorage();
    setSelectedProducts(stored);
    // If there were stored products, re-enter compare mode
    if (stored.length > 0) {
      setCompareMode(true);
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    writeStorage(selectedProducts);
  }, [selectedProducts]);

  const toggle = useCallback((product: StorefrontProduct) => {
    setSelectedProducts((prev) => {
      if (prev.some((p) => p.id === product.id)) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= MAX_COMPARE) {
        // Replace the oldest selection
        return [prev[1]!, product];
      }
      return [...prev, product];
    });
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedProducts.some((p) => p.id === id),
    [selectedProducts],
  );

  const remove = useCallback((id: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setSelectedProducts([]);
    setCompareMode(false);
  }, []);

  const value = useMemo<CompareContextValue>(
    () => ({
      compareMode,
      setCompareMode,
      selectedProducts,
      toggle,
      isSelected,
      remove,
      clearAll,
      isFull: selectedProducts.length >= MAX_COMPARE,
    }),
    [compareMode, selectedProducts, toggle, isSelected, remove, clearAll],
  );

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) {
    throw new Error("useCompare must be used within a <CompareProvider>");
  }
  return ctx;
}
