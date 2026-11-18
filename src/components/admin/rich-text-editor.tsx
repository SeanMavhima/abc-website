"use client";

import * as React from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form-controls";
import { MediaPicker } from "./media/media-picker";

function ToolButton({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "flex size-8 items-center justify-center rounded-md text-charcoal/70 transition hover:bg-muted hover:text-charcoal disabled:opacity-40",
        active && "bg-forest/10 text-forest",
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

function Toolbar({ editor, onImage }: { editor: Editor; onImage: () => void }) {
  const [linkOpen, setLinkOpen] = React.useState(false);
  const [href, setHref] = React.useState("");
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      p: e.isActive("paragraph"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  function applyLink() {
    const v = href.trim();
    if (!v) editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else if (/^(https?:\/\/|mailto:|tel:|\/|#)/.test(v)) editor.chain().focus().extendMarkRange("link").setLink({ href: v }).run();
    setLinkOpen(false);
  }

  return (
    <div className="sticky top-0 z-10 rounded-t-lg border-b border-border bg-white/95 backdrop-blur">
      <div className="flex flex-wrap items-center gap-0.5 p-1.5" role="toolbar" aria-label="Text formatting">
        <ToolButton icon={Pilcrow} label="Paragraph" active={state.p} onClick={() => editor.chain().focus().setParagraph().run()} />
        <ToolButton icon={Heading2} label="Heading" active={state.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <ToolButton icon={Heading3} label="Subheading" active={state.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
        <ToolButton icon={Bold} label="Bold" active={state.bold} onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolButton icon={Italic} label="Italic" active={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolButton icon={Underline} label="Underline" active={state.underline} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <ToolButton icon={Strikethrough} label="Strikethrough" active={state.strike} onClick={() => editor.chain().focus().toggleStrike().run()} />
        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
        <ToolButton icon={List} label="Bulleted list" active={state.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolButton icon={ListOrdered} label="Numbered list" active={state.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <ToolButton icon={Quote} label="Quote" active={state.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <ToolButton icon={Minus} label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
        <ToolButton
          icon={Link2}
          label="Add link"
          active={state.link}
          onClick={() => {
            setHref((editor.getAttributes("link").href as string) ?? "");
            setLinkOpen((v) => !v);
          }}
        />
        <ToolButton icon={Link2Off} label="Remove link" disabled={!state.link} onClick={() => editor.chain().focus().unsetLink().run()} />
        <ToolButton icon={ImagePlus} label="Insert image" onClick={onImage} />
        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
        <ToolButton icon={Undo2} label="Undo" disabled={!state.canUndo} onClick={() => editor.chain().focus().undo().run()} />
        <ToolButton icon={Redo2} label="Redo" disabled={!state.canRedo} onClick={() => editor.chain().focus().redo().run()} />
      </div>
      {linkOpen ? (
        <div className="flex items-center gap-2 border-t border-border p-2">
          <Input
            autoFocus
            value={href}
            onChange={(e) => setHref(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
              if (e.key === "Escape") setLinkOpen(false);
            }}
            placeholder="https://example.org or /about"
            className="h-9"
            aria-label="Link address"
          />
          <Button type="button" size="sm" onClick={applyLink}>
            Apply
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing",
  id,
  minimal = false,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  id?: string;
  minimal?: boolean;
}) {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } },
      }),
      Image.configure({ HTMLAttributes: { loading: "lazy" } }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: cn("prose prose-abc max-w-none focus:outline-none", minimal ? "prose-sm min-h-[8rem]" : "min-h-[14rem]"),
        ...(id ? { id } : {}),
        "aria-label": "Rich text editor",
      },
    },
    onUpdate: ({ editor: e }) => onChangeRef.current(e.isEmpty ? "" : e.getHTML()),
  });

  React.useEffect(() => {
    editor?.view.dom.setAttribute("data-placeholder", placeholder);
  }, [editor, placeholder]);

  return (
    <div className="tiptap-content rounded-lg border border-input bg-white focus-within:border-evergreen focus-within:ring-3 focus-within:ring-evergreen/15">
      {editor ? <Toolbar editor={editor} onImage={() => setPickerOpen(true)} /> : <div className="h-11 border-b border-border" />}
      <EditorContent editor={editor} />
      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(asset) => editor?.chain().focus().setImage({ src: asset.url, alt: asset.alt_text }).run()}
      />
    </div>
  );
}
