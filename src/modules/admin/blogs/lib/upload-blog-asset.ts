import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/modules/common/types/database";

const BUCKET = "blog-images";
const MAX_BYTES = 5 * 1024 * 1024;

type AdminSupabase = SupabaseClient<Database>;

function extensionFromMime(mime: string) {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";
  return "jpg";
}

async function uploadBuffer(
  supabase: AdminSupabase,
  buffer: Buffer,
  mime: string,
  extension: string,
) {
  const path = `${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: mime,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadImageReference(
  supabase: AdminSupabase,
  url: string,
): Promise<string> {
  if (!url.startsWith("data:image/")) {
    return url;
  }

  const [meta, base64] = url.split(",");
  if (!base64) {
    throw new Error("Invalid image data.");
  }

  const mime = meta.match(/data:(.*?);/)?.[1] ?? "image/jpeg";
  const buffer = Buffer.from(base64, "base64");

  if (buffer.byteLength > MAX_BYTES) {
    throw new Error("Image must be 5MB or smaller.");
  }

  return uploadBuffer(
    supabase,
    buffer,
    mime,
    extensionFromMime(mime),
  );
}

export async function uploadContentImageReferences(
  supabase: AdminSupabase,
  html: string,
): Promise<string> {
  const pattern = /<img\b[^>]*\bsrc=(["'])(data:image\/[^"']+)\1/gi;
  const matches = [...html.matchAll(pattern)];

  if (matches.length === 0) {
    return html;
  }

  let nextHtml = html;

  for (const match of matches) {
    const dataUrl = match[2];
    const uploadedUrl = await uploadImageReference(supabase, dataUrl);
    nextHtml = nextHtml.replace(dataUrl, uploadedUrl);
  }

  return nextHtml;
}

export async function normalizeBlogValuesForSave(
  supabase: AdminSupabase,
  values: {
    title: string;
    slug: string;
    content: string;
    coverImageUrl: string;
    categoryId: string;
  },
) {
  const coverImageUrl = await uploadImageReference(
    supabase,
    values.coverImageUrl,
  );
  const content = await uploadContentImageReferences(
    supabase,
    values.content,
  );

  return {
    ...values,
    coverImageUrl,
    content,
  };
}
