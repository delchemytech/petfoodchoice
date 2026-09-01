import type { BlogFormValues } from "../types";

export const ROBOTS_META_OPTIONS = [
  { value: "index,follow", label: "Index, Follow" },
  { value: "noindex,follow", label: "No Index, Follow" },
  { value: "index,nofollow", label: "Index, No Follow" },
  { value: "noindex,nofollow", label: "No Index, No Follow" },
] as const;

export function getSiteBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://petfoodchoice.com"
  );
}

export function buildDefaultCanonicalUrl(slug: string) {
  return `${getSiteBaseUrl()}/blogs/${slug}`;
}

export function buildArticleSchemaJsonLd(values: {
  title: string;
  h1: string;
  slug: string;
  metaDescription: string;
  author: string;
  coverImageUrl: string;
  publishedAt: string | null;
  updatedAt: string;
}) {
  const headline = values.h1.trim() || values.title.trim();
  const url = buildDefaultCanonicalUrl(values.slug);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline,
    name: headline,
    description: values.metaDescription.trim() || headline,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    image: values.coverImageUrl ? [values.coverImageUrl] : undefined,
    author: values.author.trim()
      ? {
          "@type": "Person",
          name: values.author.trim(),
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "Petfoodchoice",
    },
    datePublished: values.publishedAt || values.updatedAt,
    dateModified: values.updatedAt,
  };
}

export function stringifySchemaJsonLd(schema: Record<string, unknown>) {
  return JSON.stringify(schema, null, 2);
}

export function parseSchemaJsonLdInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    throw new Error("Schema JSON-LD must be valid JSON.");
  }
}

export function applySeoDefaults(values: BlogFormValues): BlogFormValues {
  const title = values.title.trim();
  const slug = values.slug.trim().toLowerCase();

  return {
    ...values,
    slug,
    h1: values.h1.trim() || title,
    metaTitle: values.metaTitle.trim() || title,
    metaDescription: values.metaDescription.trim(),
    canonicalUrl: values.canonicalUrl.trim() || buildDefaultCanonicalUrl(slug),
    featuredImageAlt:
      values.featuredImageAlt.trim() || title || "Blog featured image",
  };
}

export function ensureSchemaJsonLd(
  values: BlogFormValues,
  publishedAt: string | null,
  updatedAt: string,
) {
  if (values.schemaJsonLd.trim()) {
    return values.schemaJsonLd.trim();
  }

  const withDefaults = applySeoDefaults(values);
  const schema = buildArticleSchemaJsonLd({
    title: withDefaults.title,
    h1: withDefaults.h1,
    slug: withDefaults.slug,
    metaDescription: withDefaults.metaDescription,
    author: withDefaults.author,
    coverImageUrl: withDefaults.coverImageUrl,
    publishedAt,
    updatedAt,
  });

  return stringifySchemaJsonLd(schema);
}
