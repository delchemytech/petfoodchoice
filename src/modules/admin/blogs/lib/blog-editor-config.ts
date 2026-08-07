import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "@tiptap/extension-table";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import type { Extensions } from "@tiptap/react";

export function createBlogEditorExtensions(): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      horizontalRule: {},
      codeBlock: {},
      link: false,
      underline: false,
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-[#2271b1] underline underline-offset-2",
      },
    }),
    Image.configure({
      HTMLAttributes: {
        class: "blog-inline-image",
      },
    }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    TaskList.configure({
      HTMLAttributes: {
        class: "blog-task-list",
      },
    }),
    TaskItem.configure({
      nested: true,
      HTMLAttributes: {
        class: "blog-task-item",
      },
    }),
    Table.configure({
      resizable: false,
      HTMLAttributes: {
        class: "blog-editor-table",
      },
    }),
    TableRow,
    TableHeader,
    TableCell,
    Placeholder.configure({
      placeholder: "Start writing your blog...",
      emptyEditorClass: "is-editor-empty",
      emptyNodeClass: "is-empty",
    }),
  ];
}
