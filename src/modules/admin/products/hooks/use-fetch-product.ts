"use client";

import { useCallback, useState } from "react";
import type {
  AddProductFormValues,
  FetchProductStatus,
} from "../types/add-product";

interface ScrapeProductApiSuccess {
  success: true;
  data: AddProductFormValues;
  warnings?: string[];
}

interface ScrapeProductApiError {
  success: false;
  error: string;
}

type ScrapeProductApiResponse =
  | ScrapeProductApiSuccess
  | ScrapeProductApiError;

interface FetchProductInput {
  amazonUrl: string;
  flipkartUrl?: string;
}

interface UseFetchProductResult {
  status: FetchProductStatus;
  fetchedData: AddProductFormValues | null;
  errorMessage: string | null;
  fetchWarnings: string[];
  fetchProduct: (input: FetchProductInput) => Promise<void>;
  reset: () => void;
}

export function useFetchProduct(): UseFetchProductResult {
  const [status, setStatus] = useState<FetchProductStatus>("idle");
  const [fetchedData, setFetchedData] = useState<AddProductFormValues | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fetchWarnings, setFetchWarnings] = useState<string[]>([]);

  const fetchProduct = useCallback(async (input: FetchProductInput) => {
    setStatus("loading");
    setFetchedData(null);
    setErrorMessage(null);
    setFetchWarnings([]);

    try {
      const response = await fetch("/api/scrape-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amazonUrl: input.amazonUrl.trim(),
          flipkartUrl: input.flipkartUrl?.trim() || undefined,
        }),
      });

      const result = (await response.json()) as ScrapeProductApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.success ? "Failed to fetch product details." : result.error,
        );
      }

      setFetchedData(result.data);
      setFetchWarnings(result.warnings ?? []);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to fetch product details.",
      );
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setFetchedData(null);
    setErrorMessage(null);
    setFetchWarnings([]);
  }, []);

  return {
    status,
    fetchedData,
    errorMessage,
    fetchWarnings,
    fetchProduct,
    reset,
  };
}
