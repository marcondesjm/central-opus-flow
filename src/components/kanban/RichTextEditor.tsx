import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import CodeBlock from '@tiptap/extension-code-block';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Code, Link as LinkIcon, Type, Undo2, Redo2,
  Image as ImageIcon, Plus, Quote, Video, FileUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RichTextEditorProps {
  content: string;
  onSave: (html: string) => void;
  onCancel: () => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onSave, onCancel, placeholder }: RichTextEditorProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: placeholder || '@ para mencionar e notificar alguém.',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline cursor-pointer' },
      }),
      Underline,
      CodeBlock.configure({
        HTMLAttributes: { class: 'bg-muted rounded-md p-3 font-mono text-sm' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'rounded-lg max-w-full h-auto my-2' },
        allowBase64: true,
      }),
      Youtube.configure({
        HTMLAttributes: { class: 'rounded-lg my-2 w-full aspect-video' },
        width: 640,
        height: 360,
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[120px] p-3 text-sm',
      },
    },
  });

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, []);

  if (!editor) return null;

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    children, 
    title,
    disabled,
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    children: React.ReactNode; 
    title?: string;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={cn(
        'p-1.5 rounded hover:bg-muted/80 transition-colors',
        isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
        disabled && 'opacity-50 pointer-events-none'
      )}
    >
      {children}
    </button>
  );

  const handleAddLink = () => {
    const url = prompt('URL do link:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleAddImage = () => {
    fileInputRef.current?.click();
  };

  const handleAddImageUrl = () => {
    const url = prompt('URL da imagem:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Apenas imagens são suportadas', variant: 'destructive' });
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Imagem muito grande (máx. 5MB)', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      // Convert to base64 for simplicity
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        editor.chain().focus().setImage({ src: base64 }).run();
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast({ title: 'Erro ao carregar imagem', variant: 'destructive' });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast({ title: 'Erro ao carregar imagem', variant: 'destructive' });
      setIsUploading(false);
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddVideo = () => {
    const url = prompt('Cole a URL do YouTube:');
    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Toolbar top row */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b bg-muted/20 flex-wrap">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Título"
        >
          <Type className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-0.5" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Negrito"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Itálico"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Sublinhado"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-0.5" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Lista"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Lista numerada"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-0.5" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Citação"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Bloco de código"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton onClick={handleAddLink} isActive={editor.isActive('link')} title="Link">
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-0.5" />

        <ToolbarButton onClick={handleAddImage} title="Upload de imagem" disabled={isUploading}>
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton onClick={handleAddImageUrl} title="Imagem por URL">
          <FileUp className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton onClick={handleAddVideo} title="Vídeo do YouTube">
          <Video className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-0.5" />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Desfazer">
          <Undo2 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Refazer">
          <Redo2 className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Bottom bar with tooltip + actions */}
      <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/10">
        <span className="text-xs text-muted-foreground">@ para mencionar e notificar alguém.</span>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button size="sm" onClick={() => onSave(editor.getHTML())}>Salvar</Button>
        </div>
      </div>
    </div>
  );
}

/** Render saved HTML content (read-only) */
export function RichTextDisplay({ content }: { content: string }) {
  if (!content) return null;
  return (
    <div
      className="prose prose-sm dark:prose-invert max-w-none text-sm [&_img]:rounded-lg [&_img]:max-w-full [&_iframe]:rounded-lg [&_iframe]:w-full [&_iframe]:aspect-video"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
