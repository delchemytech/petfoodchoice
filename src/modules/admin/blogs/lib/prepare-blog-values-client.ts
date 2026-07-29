"use client";

import { uploadBlogImage } from "../actions/upload-blog-image";

async function uploadDataUrlImage(dataUrl: string) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const extension = blob.type.split("/")[1] || "jpg";
  const formData = new FormData();
  formData.append("file", blob, `image.${extension}`);
  const result = await uploadBlogImage(formData);
  return result.url;
}

async function uploadContentImages(html: string) {
  const pattern = /<img\b[^>]*\bsrc=(["'])(data:image\/[^"']+)\1/gi;
  const matches = [...html.matchAll(pattern)];

  if (matches.length === 0) {
    return html;
  }

  let nextHtml = html;

  for (const match of matches) {
    const dataUrl = match[2];
    const uploadedUrl = await uploadDataUrlImage(dataUrl);
    nextHtml = nextHtml.replace(dataUrl, uploadedUrl);
  }

  return nextHtml;
}

export async function prepareBlogValuesClient(values: {
  title: string;
  slug: string;
  content: string;
  coverImageUrl: string;
  categoryId: string;
}) {
  let coverImageUrl = values.coverImageUrl;

  if (coverImageUrl.startsWith("data:image/")) {
    coverImageUrl = await uploadDataUrlImage(coverImageUrl);
  }

  const content = await uploadContentImages(values.content);

  return {
    ...values,
    coverImageUrl,
    content,
  };
}
