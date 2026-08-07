"use client";

import { Link2, Loader2 } from "lucide-react";
import { Button } from "@/modules/common/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/common/ui/card";
import { FormMessage } from "@/modules/common/ui/form-message";
import { Input } from "@/modules/common/ui/input";
import { Label } from "@/modules/common/ui/label";
import { cn } from "@/modules/common/utils";

interface AffiliateUrlStepProps {
  amazonUrl: string;
  flipkartUrl: string;
  generatedAmazonAffiliateUrl?: string;
  generatedFlipkartAffiliateUrl?: string;
  onAmazonUrlChange: (value: string) => void;
  onFlipkartUrlChange: (value: string) => void;
  onFetch: () => void;
  isLoading: boolean;
  amazonError?: string;
  flipkartError?: string;
}

export function AffiliateUrlStep({
  amazonUrl,
  flipkartUrl,
  generatedAmazonAffiliateUrl,
  generatedFlipkartAffiliateUrl,
  onAmazonUrlChange,
  onFlipkartUrlChange,
  onFetch,
  isLoading,
  amazonError,
  flipkartError,
}: AffiliateUrlStepProps) {
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!amazonUrl.trim() || isLoading) return;
    onFetch();
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Link2 className="size-6" />
        </div>
        <CardTitle>Product URLs</CardTitle>
        <CardDescription>
          Paste Amazon and Flipkart links. We fetch details from Amazon and
          store both affiliate URLs for price comparison on the shop.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-2">
            <Label htmlFor="amazonUrl">Amazon Product URL</Label>
            <Input
              id="amazonUrl"
              type="url"
              value={amazonUrl}
              onChange={(event) => onAmazonUrlChange(event.target.value)}
              placeholder="https://www.amazon.in/dp/..."
              disabled={isLoading}
              aria-invalid={Boolean(amazonError)}
              className={cn(amazonError && "border-destructive")}
            />
            <FormMessage message={amazonError} />
          </div>

          {generatedAmazonAffiliateUrl ? (
            <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
              <Label htmlFor="generatedAmazonAffiliateUrl">
                Generated Amazon affiliate URL
              </Label>
              <Input
                id="generatedAmazonAffiliateUrl"
                type="url"
                value={generatedAmazonAffiliateUrl}
                readOnly
                className="bg-background font-mono text-xs"
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="flipkartUrl">Flipkart Product URL</Label>
            <Input
              id="flipkartUrl"
              type="url"
              value={flipkartUrl}
              onChange={(event) => onFlipkartUrlChange(event.target.value)}
              placeholder="https://www.flipkart.com/..."
              disabled={isLoading}
              aria-invalid={Boolean(flipkartError)}
              className={cn(flipkartError && "border-destructive")}
            />
            <p className="text-xs text-muted-foreground">
            Optional at fetch time. Prices are auto-fetched when you provide a
            valid Flipkart link.
            </p>
            <FormMessage message={flipkartError} />
          </div>

          {generatedFlipkartAffiliateUrl ? (
            <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
              <Label htmlFor="generatedFlipkartAffiliateUrl">
                Generated Flipkart affiliate URL
              </Label>
              <Input
                id="generatedFlipkartAffiliateUrl"
                type="url"
                value={generatedFlipkartAffiliateUrl}
                readOnly
                className="bg-background font-mono text-xs"
              />
            </div>
          ) : null}

          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={!amazonUrl.trim() || isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" data-icon="inline-start" />
                  Fetching Details...
                </>
              ) : (
                "Fetch Details"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
