"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState, useRef } from "react";
import { Bold, Italic, Strikethrough, Code, Heading1, Heading2, List, ListOrdered, Quote, Undo, Redo, Save, CheckCircle } from "lucide-react";

interface RichTextEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
  taskId: string;
}

export default function RichTextEditor({ initialContent, onSave, taskId }: RichTextEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveTime, setSaveTime] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[180px] text-slate-200 p-4 font-heading leading-relaxed overflow-y-auto max-h-[300px]",
      },
    },
    onUpdate: ({ editor }) => {
      // Autosave logic: debounce saving by 1.5 seconds
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      setIsSaving(true);
      saveTimeoutRef.current = setTimeout(() => {
        const html = editor.getHTML();
        onSave(html);
        setIsSaving(false);
        setSaveTime(new Date().toLocaleTimeString());
      }, 1500);
    },
  });

  // Reload editor content when task ID changes
  useEffect(() => {
    if (editor && initialContent !== undefined) {
      if (editor.getHTML() !== initialContent) {
        editor.commands.setContent(initialContent);
      }
    }
  }, [taskId, editor]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-[180px] bg-white/[0.01] border border-white/5 rounded-2xl">
        <div className="w-6 h-6 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleStrike = () => editor.chain().focus().toggleStrike().run();
  const toggleCode = () => editor.chain().focus().toggleCode().run();
  const toggleH1 = () => editor.chain().focus().toggleHeading({ level: 1 }).run();
  const toggleH2 = () => editor.chain().focus().toggleHeading({ level: 2 }).run();
  const toggleBullet = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrdered = () => editor.chain().focus().toggleOrderedList().run();
  const toggleBlockquote = () => editor.chain().focus().toggleBlockquote().run();
  const handleUndo = () => editor.chain().focus().undo().run();
  const handleRedo = () => editor.chain().focus().redo().run();

  return (
    <div className="border border-white/10 rounded-2xl bg-white/[0.01] overflow-hidden backdrop-blur-xl">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 items-center p-2 bg-white/[0.02] border-b border-white/10 select-none">
        <button
          onClick={toggleBold}
          className={`p-1.5 rounded-lg transition-all ${editor.isActive("bold") ? "bg-accent-purple/20 text-accent-purple border border-accent-purple/30" : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"}`}
          title="Bold"
        >
          <Bold size={15} />
        </button>
        <button
          onClick={toggleItalic}
          className={`p-1.5 rounded-lg transition-all ${editor.isActive("italic") ? "bg-accent-purple/20 text-accent-purple border border-accent-purple/30" : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"}`}
          title="Italic"
        >
          <Italic size={15} />
        </button>
        <button
          onClick={toggleStrike}
          className={`p-1.5 rounded-lg transition-all ${editor.isActive("strike") ? "bg-accent-purple/20 text-accent-purple border border-accent-purple/30" : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"}`}
          title="Strike"
        >
          <Strikethrough size={15} />
        </button>
        <button
          onClick={toggleCode}
          className={`p-1.5 rounded-lg transition-all ${editor.isActive("code") ? "bg-accent-purple/20 text-accent-purple border border-accent-purple/30" : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"}`}
          title="Code Inline"
        >
          <Code size={15} />
        </button>

        <div className="w-[1px] h-4 bg-white/10 mx-1" />

        <button
          onClick={toggleH1}
          className={`p-1.5 rounded-lg transition-all ${editor.isActive("heading", { level: 1 }) ? "bg-accent-purple/20 text-accent-purple border border-accent-purple/30" : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"}`}
          title="Heading 1"
        >
          <Heading1 size={15} />
        </button>
        <button
          onClick={toggleH2}
          className={`p-1.5 rounded-lg transition-all ${editor.isActive("heading", { level: 2 }) ? "bg-accent-purple/20 text-accent-purple border border-accent-purple/30" : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"}`}
          title="Heading 2"
        >
          <Heading2 size={15} />
        </button>

        <div className="w-[1px] h-4 bg-white/10 mx-1" />

        <button
          onClick={toggleBullet}
          className={`p-1.5 rounded-lg transition-all ${editor.isActive("bulletList") ? "bg-accent-purple/20 text-accent-purple border border-accent-purple/30" : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"}`}
          title="Bullet List"
        >
          <List size={15} />
        </button>
        <button
          onClick={toggleOrdered}
          className={`p-1.5 rounded-lg transition-all ${editor.isActive("orderedList") ? "bg-accent-purple/20 text-accent-purple border border-accent-purple/30" : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"}`}
          title="Ordered List"
        >
          <ListOrdered size={15} />
        </button>
        <button
          onClick={toggleBlockquote}
          className={`p-1.5 rounded-lg transition-all ${editor.isActive("blockquote") ? "bg-accent-purple/20 text-accent-purple border border-accent-purple/30" : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"}`}
          title="Quote Block"
        >
          <Quote size={15} />
        </button>

        <div className="w-[1px] h-4 bg-white/10 mx-1" />

        <button
          onClick={handleUndo}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white border border-transparent disabled:opacity-30 disabled:hover:bg-transparent"
          title="Undo"
        >
          <Undo size={15} />
        </button>
        <button
          onClick={handleRedo}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white border border-transparent disabled:opacity-30 disabled:hover:bg-transparent"
          title="Redo"
        >
          <Redo size={15} />
        </button>

        {/* Saved Status badge */}
        <div className="ml-auto flex items-center gap-1.5 text-[9px] font-mono px-3 text-slate-500">
          {isSaving ? (
            <span className="flex items-center gap-1 text-accent-purple animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-ping" />
              Autosaving...
            </span>
          ) : saveTime ? (
            <span className="flex items-center gap-1 text-accent-emerald">
              <CheckCircle size={10} />
              Saved at {saveTime}
            </span>
          ) : (
            <span>Changes autosaved</span>
          )}
        </div>
      </div>

      {/* Editor Body */}
      <div className="bg-black/10">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
