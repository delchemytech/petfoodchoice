"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/modules/common/ui/dialog";
import type { BlogFormValues } from "../types";

interface BlogPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: BlogFormValues;
}

export function BlogPreviewDialog({
  open,
  onOpenChange,
  values,
}: BlogPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Preview</DialogTitle>
          <DialogDescription>
            This is how your blog post will appear on the website.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-6">
          <article className="mx-auto max-w-2xl">
            <header className="space-y-4">
              <p className="text-sm font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                /blogs/{values.slug || "your-post-slug"}
              </p>
              <h1 className="font-heading text-4xl leading-tight font-semibold">
                {values.title || "Untitled post"}
              </h1>
            </header>

            {values.coverImageUrl ? (
              <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
                <Image
                  src={values.coverImageUrl}
                  alt={values.title || "Featured image"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 672px"
                  unoptimized={values.coverImageUrl.startsWith("data:")}
                />
              </div>
            ) : null}

            <div
              className="blog-content mt-8"
              dangerouslySetInnerHTML={{ __html: values.content }}
            />
          </article>
        </div>
      </DialogContent>
    </Dialog>
  );
}
