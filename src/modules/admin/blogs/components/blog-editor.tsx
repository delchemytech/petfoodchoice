"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { Loader2 } from "lucide-react";
import { uploadBlogImage } from "../actions/upload-blog-image";
import { createBlogEditorExtensions } from "../lib/blog-editor-config";
import { BlogEditorToolbar } from "./blog-editor-toolbar";

interface BlogEditorProps {
  value: string;
  onChange: (html: string) => void;
  error?: string;
}

export function BlogEditor({ value, onChange, error }: BlogEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const editor = useEditor({
    extensions: createBlogEditorExtensions(),
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "blog-editor-prose min-h-[min(70vh,720px)] px-6 py-6 focus:outline-none",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const currentHtml = editor.getHTML();
    if (value !== currentHtml && value !== editor.getText()) {
      editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
    }
  }, [editor, value]);

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !editor) return;

    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadBlogImage(formData);
      editor.chain().focus().setImage({ src: result.url }).run();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingImage(false);
    }
  }

  if (!editor) {
    return (
      <div className="flex min-h-[min(70vh,720px)] items-center justify-center bg-white">
        <Loader2 className="size-5 animate-spin text-[#646970]" />
      </div>
    );
  }

  return (
    <div>
      <BlogEditorToolbar
        editor={editor}
        onImageClick={() => imageInputRef.current?.click()}
        imageUploading={isUploadingImage}
      />

      <div className="relative bg-white">
        {isUploadingImage ? (
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-center gap-2 bg-white/90 px-4 py-2 text-sm text-[#646970]">
            <Loader2 className="size-4 animate-spin" />
            Uploading image...
          </div>
        ) : null}
        <EditorContent editor={editor} />
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {error ? (
        <p className="border-t border-[#c3c4c7] bg-white px-6 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
