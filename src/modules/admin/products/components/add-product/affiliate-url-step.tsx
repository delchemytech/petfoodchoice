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
  value: string;
  onChange: (value: string) => void;
  onFetch: () => void;
  isLoading: boolean;
  error?: string;
}

export function AffiliateUrlStep({
  value,
  onChange,
  onFetch,
  isLoading,
  error,
}: AffiliateUrlStepProps) {
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!value.trim() || isLoading) return;
    onFetch();
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Link2 className="size-6" />
        </div>
        <CardTitle>Affiliate Product URL</CardTitle>
        <CardDescription>
          Paste an Amazon affiliate link to fetch product details automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-2">
            <Label htmlFor="affiliateUrl">Affiliate Product URL</Label>
            <Input
              id="affiliateUrl"
              type="url"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="https://www.amazon.in/dp/..."
              disabled={isLoading}
              aria-invalid={Boolean(error)}
              className={cn(error && "border-destructive")}
            />
            <FormMessage message={error} />
          </div>

          <div className="flex justify-center">
            <Button type="submit" disabled={!value.trim() || isLoading} size="lg">
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
