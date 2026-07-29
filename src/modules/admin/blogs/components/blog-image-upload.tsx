"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Replace, X } from "lucide-react";
import { uploadBlogImage } from "../actions/upload-blog-image";
import { Button } from "@/modules/common/ui/button";

interface BlogImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  error?: string;
  variant?: "default" | "sidebar";
}

export function BlogImageUpload({
  value,
  onChange,
  error,
  variant = "default",
}: BlogImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Only image files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be 5MB or smaller.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadBlogImage(formData);
      onChange(result.url);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Failed to load image.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  const message = error ?? uploadError;
  const isRemoteImage =
    value.startsWith("http://") || value.startsWith("https://");

  if (variant === "sidebar") {
    return (
      <div className="space-y-3">
        {value ? (
          <div className="space-y-2">
            <div className="relative aspect-[16/10] overflow-hidden rounded-sm border border-[#c3c4c7] bg-[#f0f0f1]">
              <Image
                src={value}
                alt="Featured image"
                fill
                className="object-cover"
                sizes="280px"
                unoptimized={!isRemoteImage}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 flex-1 rounded-sm border-[#c3c4c7] bg-white text-xs shadow-none"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <>
                    <Replace className="size-3.5" />
                    Replace
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-sm border-[#c3c4c7] bg-white text-xs shadow-none"
                onClick={() => onChange("")}
                aria-label="Remove featured image"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-[#c3c4c7] bg-[#f6f7f7] px-3 py-8 text-xs text-[#646970] transition-colors hover:border-[#2271b1] hover:text-[#2271b1] disabled:opacity-60"
          >
            {isUploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ImagePlus className="size-4" />
                Set featured image
              </>
            )}
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {message ? (
          <p className="text-xs text-destructive">{message}</p>
        ) : (
          <p className="text-[11px] leading-relaxed text-[#646970]">
            JPG, PNG, or WebP up to 5MB.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative aspect-video overflow-hidden rounded-xl border bg-muted">
          <Image
            src={value}
            alt="Cover preview"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            unoptimized={!isRemoteImage}
          />
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="absolute top-3 right-3"
            onClick={() => onChange("")}
            aria-label="Remove image"
          >
            <X />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/40 px-4 py-10 text-sm text-muted-foreground transition-colors hover:bg-muted/70 disabled:opacity-60"
        >
          {isUploading ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <ImagePlus className="size-5" />
              Click to upload cover image
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {message ? (
        <p className="text-sm text-destructive">{message}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          JPG, PNG, or WebP up to 5MB.
        </p>
      )}
    </div>
  );
}
