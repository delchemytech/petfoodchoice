"use client";

import Link from "next/link";
import { Input } from "@/modules/common/ui/input";
import { Label } from "@/modules/common/ui/label";
import { Textarea } from "@/modules/common/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/common/ui/select";
import { Checkbox } from "@/modules/common/ui/checkbox";
import { ROBOTS_META_OPTIONS } from "../lib/blog-seo";
import type { BlogFormValues } from "../types";
import { BlogSidebarPanel } from "./blog-sidebar-panel";

interface BlogSeoPanelProps {
  values: BlogFormValues;
  fieldErrors: Partial<Record<keyof BlogFormValues, string>>;
  onFieldChange: <K extends keyof BlogFormValues>(
    key: K,
    value: BlogFormValues[K],
  ) => void;
}

export function BlogSeoPanel({
  values,
  fieldErrors,
  onFieldChange,
}: BlogSeoPanelProps) {
  return (
    <>
      <BlogSidebarPanel title="SEO">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="blog-h1" className="text-xs text-[#646970]">
              H1 heading
            </Label>
            <Input
              id="blog-h1"
              value={values.h1}
              onChange={(event) => onFieldChange("h1", event.target.value)}
              placeholder="Defaults to title"
              aria-invalid={Boolean(fieldErrors.h1)}
              className="h-8 rounded-sm border-[#c3c4c7] bg-white text-xs shadow-none"
            />
            {fieldErrors.h1 ? (
              <p className="text-xs text-destructive">{fieldErrors.h1}</p>
            ) : (
              <p className="text-[11px] text-[#646970]">
                Visible page heading. Leave blank to use the post title.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="blog-meta-title" className="text-xs text-[#646970]">
              Meta title
            </Label>
            <Input
              id="blog-meta-title"
              value={values.metaTitle}
              onChange={(event) =>
                onFieldChange("metaTitle", event.target.value)
              }
              placeholder="Defaults to title"
              aria-invalid={Boolean(fieldErrors.metaTitle)}
              className="h-8 rounded-sm border-[#c3c4c7] bg-white text-xs shadow-none"
            />
            {fieldErrors.metaTitle ? (
              <p className="text-xs text-destructive">{fieldErrors.metaTitle}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="blog-meta-description"
              className="text-xs text-[#646970]"
            >
              Meta description
            </Label>
            <Textarea
              id="blog-meta-description"
              value={values.metaDescription}
              onChange={(event) =>
                onFieldChange("metaDescription", event.target.value)
              }
              placeholder="Short summary for search results"
              rows={3}
              aria-invalid={Boolean(fieldErrors.metaDescription)}
              className="min-h-20 rounded-sm border-[#c3c4c7] bg-white text-xs shadow-none"
            />
            {fieldErrors.metaDescription ? (
              <p className="text-xs text-destructive">
                {fieldErrors.metaDescription}
              </p>
            ) : (
              <p className="text-[11px] text-[#646970]">
                {values.metaDescription.length}/320 characters
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="blog-canonical-url"
              className="text-xs text-[#646970]"
            >
              Canonical URL
            </Label>
            <Input
              id="blog-canonical-url"
              value={values.canonicalUrl}
              onChange={(event) =>
                onFieldChange("canonicalUrl", event.target.value)
              }
              placeholder="https://petfoodchoice.com/blogs/your-slug"
              aria-invalid={Boolean(fieldErrors.canonicalUrl)}
              className="h-8 rounded-sm border-[#c3c4c7] bg-white text-xs shadow-none"
            />
            {fieldErrors.canonicalUrl ? (
              <p className="text-xs text-destructive">
                {fieldErrors.canonicalUrl}
              </p>
            ) : (
              <p className="text-[11px] text-[#646970]">
                Auto-generated from slug when left blank.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="blog-robots" className="text-xs text-[#646970]">
              Robots meta
            </Label>
            <Select
              value={values.robotsMeta}
              onValueChange={(value) => {
                if (value) onFieldChange("robotsMeta", value);
              }}
            >
              <SelectTrigger
                id="blog-robots"
                className="h-8 w-full rounded-sm border-[#c3c4c7] bg-white text-xs shadow-none"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROBOTS_META_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="blog-author" className="text-xs text-[#646970]">
              Author
            </Label>
            <Input
              id="blog-author"
              value={values.author}
              onChange={(event) => onFieldChange("author", event.target.value)}
              placeholder="Author name"
              aria-invalid={Boolean(fieldErrors.author)}
              className="h-8 rounded-sm border-[#c3c4c7] bg-white text-xs shadow-none"
            />
            {fieldErrors.author ? (
              <p className="text-xs text-destructive">{fieldErrors.author}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="blog-featured-alt"
              className="text-xs text-[#646970]"
            >
              Featured image alt text
            </Label>
            <Input
              id="blog-featured-alt"
              value={values.featuredImageAlt}
              onChange={(event) =>
                onFieldChange("featuredImageAlt", event.target.value)
              }
              placeholder="Describe the cover image"
              aria-invalid={Boolean(fieldErrors.featuredImageAlt)}
              className="h-8 rounded-sm border-[#c3c4c7] bg-white text-xs shadow-none"
            />
            {fieldErrors.featuredImageAlt ? (
              <p className="text-xs text-destructive">
                {fieldErrors.featuredImageAlt}
              </p>
            ) : null}
          </div>

          <label className="flex items-start gap-2 text-xs text-[#646970]">
            <Checkbox
              checked={values.includeInSitemap}
              onCheckedChange={(checked) =>
                onFieldChange("includeInSitemap", checked === true)
              }
              className="mt-0.5"
            />
            <span>Include this post in the sitemap</span>
          </label>
        </div>
      </BlogSidebarPanel>

      <BlogSidebarPanel title="Schema JSON-LD">
        <div className="space-y-2">
          <Textarea
            id="blog-schema-json-ld"
            value={values.schemaJsonLd}
            onChange={(event) =>
              onFieldChange("schemaJsonLd", event.target.value)
            }
            placeholder="Leave blank to auto-generate BlogPosting schema on publish"
            rows={8}
            aria-invalid={Boolean(fieldErrors.schemaJsonLd)}
            className="min-h-40 rounded-sm border-[#c3c4c7] bg-white font-mono text-[11px] shadow-none"
          />
          {fieldErrors.schemaJsonLd ? (
            <p className="text-xs text-destructive">{fieldErrors.schemaJsonLd}</p>
          ) : (
            <p className="text-[11px] leading-relaxed text-[#646970]">
              Optional structured data. Auto-filled from post details when empty.{" "}
              <Link
                href="https://schema.org/BlogPosting"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2271b1] hover:underline"
              >
                Learn more
              </Link>
            </p>
          )}
        </div>
      </BlogSidebarPanel>
    </>
  );
}
