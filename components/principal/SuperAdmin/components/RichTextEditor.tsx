"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo2,
  Redo2,
  Minus,
  Highlighter,
  RemoveFormatting,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ── Props ────────────────────────────────────────────────────────────────────
interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
}

// ── Botón de toolbar ─────────────────────────────────────────────────────────
function ToolbarButton({
  onClick,
  active,
  disabled,
  tooltip,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={active ? "default" : "ghost"}
          size="icon"
          className={cn(
            "h-8 w-8 rounded",
            active && "bg-primary text-primary-foreground",
          )}
          disabled={disabled}
          onClick={onClick}
          onMouseDown={(e) => e.preventDefault()} // Evita perder el foco del editor
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Escribe el mensaje aquí...",
  minHeight = 260,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none px-4 py-3",
          "text-foreground",
        ),
        style: `min-height: ${minHeight}px`,
      },
    },
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Sincronizar value externo si cambia desde afuera (ej: limpiar formulario)
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value ?? "");
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "rounded-lg border border-input bg-background overflow-hidden",
          className,
        )}
      >
        {/* ── Toolbar ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-muted/40">

          {/* Historial */}
          <ToolbarButton
            tooltip="Deshacer (Ctrl+Z)"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Rehacer (Ctrl+Y)"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo2 className="w-4 h-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Encabezados */}
          <ToolbarButton
            tooltip="Título grande (H1)"
            active={editor.isActive("heading", { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Título mediano (H2)"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Título pequeño (H3)"
            active={editor.isActive("heading", { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Formato de texto */}
          <ToolbarButton
            tooltip="Negrita (Ctrl+B)"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Cursiva (Ctrl+I)"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Subrayado (Ctrl+U)"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Tachado"
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Resaltado"
            active={editor.isActive("highlight")}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
          >
            <Highlighter className="w-4 h-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Listas */}
          <ToolbarButton
            tooltip="Lista con viñetas"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Lista numerada"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Alineación */}
          <ToolbarButton
            tooltip="Alinear izquierda"
            active={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Centrar"
            active={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Alinear derecha"
            active={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Justificar"
            active={editor.isActive({ textAlign: "justify" })}
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          >
            <AlignJustify className="w-4 h-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Extras */}
          <ToolbarButton
            tooltip="Línea horizontal"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Minus className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Limpiar formato"
            onClick={() =>
              editor.chain().focus().clearNodes().unsetAllMarks().run()
            }
          >
            <RemoveFormatting className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* ── Área de edición ──────────────────────────────────────────── */}
        <EditorContent
          editor={editor}
          className="cursor-text"
          onClick={() => editor.commands.focus()}
        />

        {/* Placeholder manual (Tiptap no tiene placeholder nativo en StarterKit) */}
        {editor.isEmpty && (
          <p
            className="absolute pointer-events-none text-sm text-muted-foreground px-4 py-3 top-auto"
            style={{ marginTop: `-${minHeight}px` }}
          >
            {placeholder}
          </p>
        )}
      </div>
    </TooltipProvider>
  );
}
