"use client";

import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Eraser,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  SquareCode,
  Strikethrough,
  Table2,
  Underline,
  Undo2,
  Unlink,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/common/ui/select";
import { cn } from "@/modules/common/utils";

const HEADING_OPTIONS = [
  { value: "paragraph", label: "Paragraph" },
  { value: "h1", label: "Heading 1" },
  { value: "h2", label: "Heading 2" },
  { value: "h3", label: "Heading 3" },
  { value: "h4", label: "Heading 4" },
  { value: "h5", label: "Heading 5" },
  { value: "h6", label: "Heading 6" },
] as const;

type HeadingValue = (typeof HEADING_OPTIONS)[number]["value"];

function getCurrentHeading(editor: Editor): HeadingValue {
  for (const level of [1, 2, 3, 4, 5, 6] as const) {
    if (editor.isActive("heading", { level })) {
      return `h${level}` as HeadingValue;
    }
  }

  return "paragraph";
}

function applyHeading(editor: Editor, value: HeadingValue) {
  if (value === "paragraph") {
    editor.chain().focus().setParagraph().run();
    return;
  }

  const level = Number(value.replace("h", "")) as 1 | 2 | 3 | 4 | 5 | 6;
  editor.chain().focus().toggleHeading({ level }).run();
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  children,
  label,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-sm text-[#1d2327] transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "bg-[#2271b1] text-white"
          : "hover:bg-[#dcdcde]",
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-0.5 h-5 w-px shrink-0 bg-[#c3c4c7]" aria-hidden />;
}

interface BlogEditorToolbarProps {
  editor: Editor;
  onImageClick: () => void;
  imageUploading?: boolean;
}

export function BlogEditorToolbar({
  editor,
  onImageClick,
  imageUploading = false,
}: BlogEditorToolbarProps) {
  const [, setRevision] = useState(0);

  useEffect(() => {
    const refresh = () => setRevision((current) => current + 1);

    editor.on("transaction", refresh);
    editor.on("selectionUpdate", refresh);

    return () => {
      editor.off("transaction", refresh);
      editor.off("selectionUpdate", refresh);
    };
  }, [editor]);

  const currentHeading = getCurrentHeading(editor);
  const isInTable = editor.isActive("table");

  function insertLink() {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter link URL", previousUrl ?? "https://");

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function clearFormatting() {
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  }

  return (
    <div className="sticky top-0 z-10 border-b border-[#c3c4c7] bg-[#f6f7f7]">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5">
        <Select
          value={currentHeading}
          onValueChange={(value) => {
            if (value) applyHeading(editor, value as HeadingValue);
          }}
        >
          <SelectTrigger
            size="sm"
            className="h-8 min-w-[8.5rem] rounded-sm border-[#c3c4c7] bg-white text-xs shadow-none"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HEADING_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ToolbarDivider />

        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Inline code"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Clear formatting" onClick={clearFormatting}>
          <Eraser className="size-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          label="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Task checklist"
          active={editor.isActive("taskList")}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        >
          <ListChecks className="size-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          label="Align left"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Align center"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Align right"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Justify"
          active={editor.isActive({ textAlign: "justify" })}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <AlignJustify className="size-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          label="Blockquote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Code block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <SquareCode className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Horizontal rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="size-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton label="Insert link" onClick={insertLink}>
          <Link2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Remove link"
          disabled={!editor.isActive("link")}
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <Unlink className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Upload image"
          disabled={imageUploading}
          onClick={onImageClick}
        >
          <ImagePlus className="size-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          label="Insert table"
          active={isInTable}
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          <Table2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Add row above"
          disabled={!isInTable}
          onClick={() => editor.chain().focus().addRowBefore().run()}
        >
          <span className="text-[10px] font-semibold">R+</span>
        </ToolbarButton>
        <ToolbarButton
          label="Add row below"
          disabled={!isInTable}
          onClick={() => editor.chain().focus().addRowAfter().run()}
        >
          <span className="text-[10px] font-semibold">R↓</span>
        </ToolbarButton>
        <ToolbarButton
          label="Delete row"
          disabled={!isInTable}
          onClick={() => editor.chain().focus().deleteRow().run()}
        >
          <span className="text-[10px] font-semibold text-destructive">R×</span>
        </ToolbarButton>
        <ToolbarButton
          label="Add column left"
          disabled={!isInTable}
          onClick={() => editor.chain().focus().addColumnBefore().run()}
        >
          <span className="text-[10px] font-semibold">C+</span>
        </ToolbarButton>
        <ToolbarButton
          label="Add column right"
          disabled={!isInTable}
          onClick={() => editor.chain().focus().addColumnAfter().run()}
        >
          <span className="text-[10px] font-semibold">C→</span>
        </ToolbarButton>
        <ToolbarButton
          label="Delete column"
          disabled={!isInTable}
          onClick={() => editor.chain().focus().deleteColumn().run()}
        >
          <span className="text-[10px] font-semibold text-destructive">C×</span>
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          label="Undo"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="size-4" />
        </ToolbarButton>
      </div>
    </div>
  );
}
