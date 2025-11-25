import { useEffect, useRef, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useTheme } from "@/lib/theme";
import { Skeleton } from "@/components/ui/skeleton";
import { registerCompletionProviders, EDITOR_OPTIONS } from "@/lib/editor-config";

interface CodeEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function CodeEditor({
  value,
  language,
  onChange,
  readOnly = false,
}: CodeEditorProps) {
  const { effectiveTheme } = useTheme();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<any>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Delete line function
  const deleteLine = () => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const model = editor.getModel();
    const selection = editor.getSelection();
    if (model && selection) {
      const line = selection.startLineNumber;
      if (line === model.getLineCount()) {
        const range = new monaco.Range(line, 1, line, model.getLineLength(line) + 1);
        model.pushEditOperations([], [{ range, text: '' }], () => [selection]);
      } else {
        const range = new monaco.Range(line, 1, line + 1, 1);
        model.pushEditOperations([], [{ range, text: '' }], () => [selection]);
      }
    }
  };

  // Copy function
  const copySelection = () => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    const selection = editor.getSelection();
    if (selection) {
      const model = editor.getModel();
      if (model) {
        const text = model.getValueInRange(selection);
        navigator.clipboard.writeText(text);
      }
    }
  };

  // Cut function
  const cutSelection = () => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    const selection = editor.getSelection();
    if (selection) {
      const model = editor.getModel();
      if (model) {
        const text = model.getValueInRange(selection);
        navigator.clipboard.writeText(text);
        model.pushEditOperations([], [{ range: selection, text: '' }], () => [selection]);
      }
    }
  };

  // Select all function
  const selectAll = () => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    const model = editor.getModel();
    if (model) {
      const fullRange = model.getFullModelRange();
      editor.setSelection(fullRange);
    }
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Register custom completion providers
    try {
      registerCompletionProviders(monaco);
    } catch (error) {
      console.warn("Could not register completions:", error);
    }

    // Delete line with Ctrl+Shift+K
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyK, () => {
      deleteLine();
    });

    // Delete line with Ctrl+Backspace (alternate shortcut)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Backspace, () => {
      deleteLine();
    });

    // Select all with Ctrl+A
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyA, () => {
      selectAll();
    });
  };

  // Handle context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  // Handle long press on mobile
  const handleTouchStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      if (editorRef.current) {
        const rect = editorRef.current.getDomNode()?.getBoundingClientRect();
        if (rect) {
          setContextMenu({ x: rect.left + 50, y: rect.top + 50 });
        }
      }
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [contextMenu]);

  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        const currentLanguage = model.getLanguageId();
        if (currentLanguage !== language) {
          // Let Monaco handle language switching
        }
      }
    }
  }, [language]);

  return (
    <div className="relative w-full h-full" onContextMenu={handleContextMenu} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={(newValue) => onChange(newValue || "")}
        onMount={handleEditorDidMount}
        theme={effectiveTheme === "dark" ? "vs-dark" : "vs-light"}
        options={{
          ...EDITOR_OPTIONS,
          readOnly,
        }}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="space-y-2 w-full p-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        }
      />

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-card border border-border rounded-md shadow-lg z-50 min-w-40"
          style={{
            top: `${Math.min(contextMenu.y, window.innerHeight - 200)}px`,
            left: `${Math.min(contextMenu.x, window.innerWidth - 160)}px`,
          }}
          data-testid="context-menu"
        >
          <div className="py-1">
            <button
              onClick={() => {
                selectAll();
                setContextMenu(null);
              }}
              className="w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
              data-testid="menu-select-all"
            >
              <span>Select All</span>
              <span className="ml-auto text-xs text-muted-foreground">Ctrl+A</span>
            </button>
            <button
              onClick={() => {
                copySelection();
                setContextMenu(null);
              }}
              className="w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
              data-testid="menu-copy"
            >
              <span>Copy</span>
              <span className="ml-auto text-xs text-muted-foreground">Ctrl+C</span>
            </button>
            <button
              onClick={() => {
                cutSelection();
                setContextMenu(null);
              }}
              className="w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
              data-testid="menu-cut"
            >
              <span>Cut</span>
              <span className="ml-auto text-xs text-muted-foreground">Ctrl+X</span>
            </button>
            <div className="border-t border-border" />
            <button
              onClick={() => {
                deleteLine();
                setContextMenu(null);
              }}
              className="w-full px-3 py-2 text-sm text-left hover:bg-destructive hover:text-destructive-foreground flex items-center gap-2"
              data-testid="menu-delete-line"
            >
              <span>Delete Line</span>
              <span className="ml-auto text-xs text-muted-foreground">Ctrl+Shift+K</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
