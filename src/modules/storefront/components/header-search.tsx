"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/modules/common/ui/button";
import { Input } from "@/modules/common/ui/input";

const MIN_SEARCH_LENGTH = 3;

function HeaderSearchForm({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  function navigateWithQuery(nextQuery: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextQuery) {
      params.set("q", nextQuery);
    } else {
      params.delete("q");
    }
    params.delete("page");

    const queryString = params.toString();
    const target =
      pathname === "/"
        ? queryString
          ? `/?${queryString}#picks`
          : "/#picks"
        : queryString
          ? `/?${queryString}#picks`
          : "/#picks";

    router.push(target);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = query.trim();
    if (trimmed.length < MIN_SEARCH_LENGTH) {
      return;
    }

    navigateWithQuery(trimmed);
  }

  function handleChange(value: string) {
    setQuery(value);

    if (value === "") {
      navigateWithQuery("");
    }
  }

  const trimmed = query.trim();
  const canSearch = trimmed.length >= MIN_SEARCH_LENGTH;

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex w-full items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => handleChange(event.target.value)}
            placeholder="Search pet food, brands..."
            className="h-9 rounded-full pr-3 pl-9"
            aria-label="Search products"
          />
        </div>
        <Button
          type="submit"
          size="sm"
          className="h-9 shrink-0 rounded-full px-4"
          disabled={!canSearch}
        >
          Search
        </Button>
      </div>
    </form>
  );
}

export function HeaderSearch() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full max-w-sm items-center gap-2">
          <div className="h-9 min-w-0 flex-1 animate-pulse rounded-full bg-muted" />
          <div className="h-9 w-20 animate-pulse rounded-full bg-muted" />
        </div>
      }
    >
      <HeaderSearchForm className="w-full min-w-0 flex-1 lg:max-w-md" />
    </Suspense>
  );
}
