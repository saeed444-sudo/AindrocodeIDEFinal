import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import {
  HomeIcon,
  CodeBracketIcon,
  DocumentPlusIcon,
  XMarkIcon,
  PlayIcon,
  StopIcon,
  Bars3Icon,
  SparklesIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileTree } from "@/components/file-tree";
import { EditorTabs } from "@/components/editor-tabs";
import { CodeEditor } from "@/components/code-editor";
import { LimitationBadge } from "@/components/limitation-badge";
import { HTMLPreview } from "@/components/html-preview";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { SnippetsPanel } from "@/components/snippets-panel";
import { AdvancedFeaturesPanel } from "@/components/advanced-features-panel";
import { DebuggerPanel } from "@/components/debugger-panel";
import { LinterPanel } from "@/components/linter-panel";
import { GitPanel } from "@/components/git-panel";
import { PackageManagerPanel } from "@/components/package-manager-panel";
import { RESTClient } from "@/components/rest-client";
import { ThemeSelector } from "@/components/theme-selector";
import { SQLVisualizer } from "@/components/sql-visualizer";
import { VersionHistory } from "@/components/version-history";
import { ShareProject } from "@/components/share-project";
import { OfflineIndicator } from "@/components/offline-indicator";
import { CodeComments } from "@/components/code-comments";
import { TestGenerator } from "@/components/test-generator";
import { AICompletion } from "@/components/ai-completion";
import { PerformanceProfiler } from "@/components/performance-profiler";
import { DocumentationGen } from "@/components/documentation-gen";
import { EditorMinimap } from "@/components/editor-minimap";
import { useTheme } from "@/lib/theme";
import { toggleWordWrap, getWordWrapSettings } from "@/lib/ide-features/word-wrap";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { executeCode, initializeRuntimes } from "@/lib/executor-v2";
import { projectExporter } from "@/lib/project-export";
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { aiClient } from "@/lib/ai-client";

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  language?: string;
  content?: string;
}

interface Tab {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isDirty?: boolean;
}

interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

declare global {
  interface Window {
    pyodide: any;
  }
}

export default function Editor() {
  const [, setLocation] = useLocation();
  const [files, setFiles] = useState<FileNode[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | undefined>();
  const [showFileTree, setShowFileTree] = useState(true);
  const [showTerminal, setShowTerminal] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [createFileDialogOpen, setCreateFileDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileNode | null>(null);
  const [parentPathForFile, setParentPathForFile] = useState<string | undefined>();
  const [terminalOutput, setTerminalOutput] = useState<string>("");
  const [aiEnabled, setAiEnabled] = useState(localStorage.getItem("openai-api-key") !== null);
  
  // Monitor API key changes
  useEffect(() => {
    const checkApiKey = () => {
      try {
        const savedKey = localStorage.getItem("openai-api-key");
        const hasKey = savedKey !== null && savedKey.trim() !== '';
        setAiEnabled(hasKey);
        
        // Initialize AI client if key exists
        if (hasKey) {
          aiClient.init(savedKey.trim());
        }
      } catch (error) {
        console.error("Error initializing AI client:", error);
        setAiEnabled(false);
      }
    };
    
    // Check immediately
    checkApiKey();
    
    // Listen for storage changes
    window.addEventListener('storage', checkApiKey);
    // Custom event for same-tab changes
    window.addEventListener('apikey-updated', checkApiKey);
    
    return () => {
      window.removeEventListener('storage', checkApiKey);
      window.removeEventListener('apikey-updated', checkApiKey);
    };
  }, []);
  const [showAI, setShowAI] = useState(false);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [htmlPreview, setHtmlPreview] = useState<string>("");
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDebugger, setShowDebugger] = useState(false);
  const [showLinter, setShowLinter] = useState(false);
  const [showGit, setShowGit] = useState(false);
  const [showPackages, setShowPackages] = useState(false);
  const [showRESTClient, setShowRESTClient] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [showSQL, setShowSQL] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showTests, setShowTests] = useState(false);
  const [showAICompletion, setShowAICompletion] = useState(false);
  const [showProfiler, setShowProfiler] = useState(false);
  const [showDocGen, setShowDocGen] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [wordWrapEnabled, setWordWrapEnabled] = useState(() => getWordWrapSettings().enabled);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const getProjectId = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("project") || "default";
  };

  const loadState = () => {
    const projectId = getProjectId();
    const saved = localStorage.getItem(`project-${projectId}-state`);
    if (saved) {
      try {
        const { files: savedFiles, tabs: savedTabs, activeTabId: savedActiveId } = JSON.parse(saved);
        setFiles(savedFiles || []);
        
        // Filter tabs to only include files that exist
        const fileSet = new Set<string>();
        const collectPaths = (nodes: FileNode[]) => {
          nodes.forEach((n: FileNode) => {
            if (n.type === 'file') fileSet.add(n.path);
            if (n.children) collectPaths(n.children);
          });
        };
        collectPaths(savedFiles || []);
        
        const validTabs = (savedTabs || []).filter((t: Tab) => fileSet.has(t.path));
        setTabs(validTabs);
        
        // Only set active tab if it exists
        if (savedActiveId && validTabs.some((t: Tab) => t.id === savedActiveId)) {
          setActiveTabId(savedActiveId);
        } else if (validTabs.length > 0) {
          setActiveTabId(validTabs[0].id);
        }
      } catch (e) {
        // Silently fail on restore errors
      }
    }
  };

  const saveState = () => {
    const projectId = getProjectId();
    localStorage.setItem(`project-${projectId}-state`, JSON.stringify({ files, tabs, activeTabId }));
  };

  // Memoized save to prevent re-renders
  const memoizedSaveState = useCallback(() => {
    const projectId = getProjectId();
    localStorage.setItem(`project-${projectId}-state`, JSON.stringify({ files, tabs, activeTabId }));
  }, [files, tabs, activeTabId]);

  // Load on mount
  useEffect(() => {
    loadState();
    initializeRuntimes().catch(console.error);

    // Initialize AI client if API key is stored
    const storedApiKey = localStorage.getItem("openai-api-key");
    if (storedApiKey) {
      aiClient.init(storedApiKey);
      console.log("[Editor] AI client initialized with stored API key");
    }

    // Listen for API key updates from settings page
    const handleApiKeyUpdate = (event: StorageEvent) => {
      if (event.key === "openai-api-key" && event.newValue) {
        aiClient.init(event.newValue);
        console.log("[Editor] AI client re-initialized with new API key from settings");
      }
    };

    window.addEventListener("storage", handleApiKeyUpdate);

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'k' && e.shiftKey) {
          e.preventDefault();
          setShowShortcuts(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('storage', handleApiKeyUpdate);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Save on every change and before unload
  useEffect(() => {
    memoizedSaveState();
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      memoizedSaveState();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [memoizedSaveState]);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const handleFileSelect = useCallback((file: FileNode) => {
    if (file.type === "folder") return;
    const existingTab = tabs.find((t) => t.path === file.path);
    if (existingTab) {
      setActiveTabId(existingTab.id);
    } else {
      const newTab: Tab = {
        id: file.id,
        name: file.name,
        path: file.path,
        content: file.content || "",
        language: getLanguageFromPath(file.path),
      };
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.id);
    }
  }, [tabs]);

  const handleTabClose = useCallback((tabId: string) => {
    setTabs(prev => {
      const newTabs = prev.filter((t) => t.id !== tabId);
      if (activeTabId === tabId) {
        setActiveTabId(newTabs.length > 0 ? newTabs[0].id : undefined);
      }
      return newTabs;
    });
  }, [activeTabId]);

  const handleEditorChange = useCallback((value: string) => {
    if (!activeTabId) return;
    setTabs(prev => prev.map((t) =>
      t.id === activeTabId ? { ...t, content: value, isDirty: true } : t
    ));
  }, [activeTabId]);

  const handleCreateFile = useCallback((parentPath?: string) => {
    setNewFileName("");
    setParentPathForFile(parentPath);
    setCreateFileDialogOpen(true);
  }, []);

  const confirmCreateFile = useCallback(() => {
    if (!newFileName.trim()) return;
    
    const filePath = parentPathForFile 
      ? `${parentPathForFile}/${newFileName}`
      : `/${newFileName}`;
    
    const newFile: FileNode = {
      id: `file-${Date.now()}`,
      name: newFileName,
      type: "file",
      path: filePath,
      language: getLanguageFromPath(newFileName),
      content: "",
    };
    
    if (parentPathForFile) {
      // Add file to folder using recursive search
      setFiles(prev => {
        const addToFolder = (nodes: FileNode[]): FileNode[] => {
          return nodes.map(node => {
            if (node.type === "folder" && node.path === parentPathForFile) {
              return {
                ...node,
                children: [...(node.children || []), newFile]
              };
            }
            if (node.children) {
              return {
                ...node,
                children: addToFolder(node.children)
              };
            }
            return node;
          });
        };
        return addToFolder(prev);
      });
    } else {
      // Add file to root
      setFiles(prev => [...prev, newFile]);
    }
    
    setCreateFileDialogOpen(false);
    setNewFileName("");
    setParentPathForFile(undefined);
    handleFileSelect(newFile);
  }, [newFileName, parentPathForFile, handleFileSelect]);

  const [parentPathForFolder, setParentPathForFolder] = useState<string | undefined>();
  
  const handleCreateFolder = useCallback((parentPath?: string) => {
    setNewFolderName("");
    setParentPathForFolder(parentPath);
    setCreateFolderDialogOpen(true);
  }, []);

  const confirmCreateFolder = useCallback(() => {
    if (!newFolderName.trim()) return;
    
    const folderPath = parentPathForFolder 
      ? `${parentPathForFolder}/${newFolderName}`
      : `/${newFolderName}`;
    
    const newFolder: FileNode = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      type: "folder",
      path: folderPath,
      children: [],
    };
    
    if (parentPathForFolder) {
      // Add folder to parent folder using recursive search
      setFiles(prev => {
        const addToFolder = (nodes: FileNode[]): FileNode[] => {
          return nodes.map(node => {
            if (node.type === "folder" && node.path === parentPathForFolder) {
              return {
                ...node,
                children: [...(node.children || []), newFolder]
              };
            }
            if (node.children) {
              return {
                ...node,
                children: addToFolder(node.children)
              };
            }
            return node;
          });
        };
        return addToFolder(prev);
      });
    } else {
      // Add folder to root
      setFiles(prev => [...prev, newFolder]);
    }
    
    setCreateFolderDialogOpen(false);
    setNewFolderName("");
    setParentPathForFolder(undefined);
  }, [newFolderName, parentPathForFolder]);

  const handleFileDelete = useCallback((file: FileNode) => {
    setFileToDelete(file);
    setDeleteConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!fileToDelete) return;
    
    // Recursively delete file/folder from nested structure
    const deleteFromTree = (nodes: FileNode[]): FileNode[] => {
      return nodes
        .filter((n) => n.id !== fileToDelete.id)
        .map((n) => {
          if (n.children) {
            let children = deleteFromTree(n.children);
            // Also remove any tabs from deleted subfolder
            if (fileToDelete.type === "folder") {
              children = children.filter(c => !c.path.startsWith(fileToDelete.path + "/"));
            }
            return { ...n, children };
          }
          return n;
        });
    };
    
    setFiles(prev => deleteFromTree(prev));
    
    // Remove tabs for deleted file or folder contents
    setTabs(prev => {
      if (fileToDelete.type === "folder") {
        return prev.filter((t) => !t.path.startsWith(fileToDelete.path + "/") && t.path !== fileToDelete.path);
      } else {
        return prev.filter((t) => t.path !== fileToDelete.path);
      }
    });
    
    setDeleteConfirmOpen(false);
    setFileToDelete(null);
  }, [fileToDelete]);

  const handleRun = useCallback(async () => {
    if (!activeTab) return;
    setShowTerminal(true);
    setIsRunning(true);
    
    const language = activeTab.language.toLowerCase();
    const isCompiled = ['go', 'rust', 'cpp', 'c', 'java', 'haskell', 'swift', 'csharp', 'c#', 'kotlin'].includes(language);
    
    if (isCompiled) {
      setTerminalOutput(`⏳ Compiling ${language}...\n`);
    } else {
      setTerminalOutput(`▶ Running ${activeTab.name}...\n`);
    }

    try {
      const result = await executeCode(activeTab.content, activeTab.language, activeTab.name);

      // Handle HTML preview
      if (result.preview) {
        setHtmlPreview(result.preview);
        setShowHtmlPreview(true);
        setTerminalOutput((prev) => {
          let output = prev;
          output += result.output;
          if (!result.output.endsWith("\n")) output += "\n";
          output += `\n✅ Preview ready in ${result.executionTime.toFixed(2)}ms\n`;
          return output;
        });
      } else {
        setTerminalOutput((prev) => {
          let output = prev;
          if (result.output) {
            output += result.output;
            if (!result.output.endsWith("\n")) output += "\n";
          }
          if (result.error) {
            output += `\n❌ Error: ${result.error}\n`;
          }
          const timeMsg = isCompiled ? `Compilation + execution` : `Execution`;
          output += `\n✅ ${timeMsg} completed in ${result.executionTime.toFixed(2)}ms\n`;
          return output;
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setTerminalOutput((p) => p + `\n❌ Runtime error: ${errorMsg}\n`);
    } finally {
      setIsRunning(false);
    }
  }, [activeTab]);

  const handleAISend = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const userMsg: AIMessage = { id: `msg-${Date.now()}`, role: "user", content: aiInput };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiInput("");
    setAiLoading(true);

    try {
      // Check if AI client is initialized
      if (!aiClient.isInitialized()) {
        const errorMsg: AIMessage = {
          id: `msg-${Date.now()}-error`,
          role: "assistant",
          content:
            "Add your OpenAI API key in Settings to enable AI features.",
        };
        setAiMessages((p) => [...p, errorMsg]);
        setAiLoading(false);
        return;
      }

      // Get current active file content for context
      const activeTab = tabs.find((t) => t.id === activeTabId);
      const context = activeTab ? `Current file: ${activeTab.path}\n\n${activeTab.content}` : "";

      // Build message history for the API
      const messageHistory = aiMessages
        .map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }))
        .concat([{ role: "user" as const, content: userMsg.content }]);

      // Call the AI client
      const response = await aiClient.chat(messageHistory);

      const aiMsg: AIMessage = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: response,
      };
      setAiMessages((p) => [...p, aiMsg]);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const aiErrorMsg: AIMessage = {
        id: `msg-${Date.now()}-error`,
        role: "assistant",
        content: `Error: ${errorMsg}`,
      };
      setAiMessages((p) => [...p, aiErrorMsg]);
    } finally {
      setAiLoading(false);
    }
  };

  const getLanguageFromPath = (path: string): string => {
    const ext = path.split(".").pop()?.toLowerCase() || "";
    const langMap: Record<string, string> = {
      html: "html", htm: "html", css: "css", scss: "scss", sass: "sass", less: "less",
      jsx: "javascript", tsx: "typescript",
      js: "javascript", ts: "typescript", py: "python", rb: "ruby", php: "php",
      pl: "perl", lua: "lua", r: "r", sh: "shell", bash: "shell",
      c: "c", cpp: "cpp", cc: "cpp", cxx: "cpp", h: "c", hpp: "cpp",
      java: "java", go: "go", rs: "rust", kt: "kotlin", cs: "csharp",
      json: "json", xml: "xml", yaml: "yaml", yml: "yaml", toml: "toml",
      md: "markdown", sql: "sql",
      swift: "swift", groovy: "groovy", scala: "scala",
    };
    return langMap[ext] || "plaintext";
  };

  const handleExportProject = useCallback(async () => {
    const projectId = getProjectId();
    try {
      await projectExporter.exportAsZip(projectId);
    } catch (error) {
      console.error("Export failed:", error);
    }
  }, []);

  const handleImportProject = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelected = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await projectExporter.importFromZip(file);
      setLocation("/?imported=true");
      console.log("Project imported:", result.name);
    } catch (error) {
      console.error("Import failed:", error);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [setLocation]);

  const handleMultiFileImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    try {
      const projectId = getProjectId();
      const importedCount = await projectExporter.importIndividualFiles(files, projectId);
      
      // Reload current project files
      await loadState();
      
      const message = `Imported ${importedCount} file${importedCount !== 1 ? 's' : ''}`;
      setTerminalOutput((prev) => prev + "\n✓ " + message);
    } catch (error) {
      console.error("Multi-file import failed:", error);
      setTerminalOutput((prev) => prev + "\n✗ Import failed: " + String(error));
    }

    if (multiFileInputRef.current) {
      multiFileInputRef.current.value = "";
    }
  }, []);

  const handleFormatCode = useCallback(async () => {
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (!activeTab) return;

    try {
      const formatted = formatCode(activeTab.content, activeTab.language);
      
      const updatedTabs = tabs.map((t) =>
        t.id === activeTabId ? { ...t, content: formatted, isDirty: true } : t
      );
      setTabs(updatedTabs);
      
      setTerminalOutput((prev) => prev + "\n✓ Code formatted");
    } catch (error) {
      console.error("Format failed:", error);
      setTerminalOutput((prev) => prev + "\n✗ Format error: " + String(error));
    }
  }, [tabs, activeTabId]);

  function formatCode(code: string, language: string): string {
    // Simple formatter that handles basic indentation and spacing
    const lines = code.split("\n");
    const formatted: string[] = [];
    let indentLevel = 0;
    const indentChar = "  ";

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (!trimmed) {
        formatted.push("");
        continue;
      }

      // Decrease indent for closing brackets
      if (["}", "]", ")", "end", "endif", "endwhile", "endfor"].some((c) => trimmed.startsWith(c))) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      formatted.push(indentChar.repeat(indentLevel) + trimmed);

      // Increase indent for opening brackets
      if (["if", "else", "for", "while", "def", "class", "switch", "case", "{", "[", "("].some((c) => trimmed.includes(c) || trimmed.endsWith(c))) {
        if (!["}", "]", ")", "end"].some((c) => trimmed.includes(c))) {
          indentLevel++;
        }
      }
    }

    return formatted.join("\n");
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-background overflow-hidden">
      {/* Header - Fixed */}
      <div className="h-14 flex items-center justify-between px-3 sm:px-4 border-b bg-white dark:bg-slate-950 flex-shrink-0">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFileTree(!showFileTree)}
            className="h-8 w-8 flex-shrink-0"
            data-testid="button-toggle-filetree"
          >
            <Bars3Icon className="h-4 w-4" />
          </Button>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
            <CodeBracketIcon className="h-4 w-4 text-white" />
          </div>
          <span className="text-xs sm:text-sm font-bold truncate max-w-[120px]">AindroCode</span>
          <div className="hidden sm:block">
            <LimitationBadge text="Browser" tooltip="Some limitations apply" />
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {activeTab && (
            <Button
              variant="default"
              size="sm"
              onClick={handleRun}
              disabled={isRunning}
              className="gap-1 text-xs px-2 sm:px-3 h-8 flex-shrink-0"
              data-testid="button-run-file"
            >
              <PlayIcon className="h-3 w-3" />
              <span className="hidden sm:inline">Run</span>
            </Button>
          )}

          {/* Tools Dropdown - Always Visible on All Screen Sizes */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                data-testid="button-tools-menu"
                title="Tools & Features"
              >
                <EllipsisVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Tools & Features</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Code Editing */}
              <DropdownMenuLabel className="text-xs text-muted-foreground">Code Editing</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={handleFormatCode}
                data-testid="menu-format-code"
              >
                Format Code
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowSnippets(true)}
                data-testid="menu-snippets"
              >
                Snippets
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowShortcuts(true)}
                data-testid="menu-shortcuts"
              >
                Keyboard Shortcuts
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Analysis & Debugging */}
              <DropdownMenuLabel className="text-xs text-muted-foreground">Analysis & Debug</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setShowLinter(true)}
                data-testid="menu-linter"
              >
                Code Lint
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDebugger(true)}
                data-testid="menu-debugger"
              >
                Debugger
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Project Management */}
              <DropdownMenuLabel className="text-xs text-muted-foreground">Project Management</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={handleExportProject}
                data-testid="menu-export-project"
              >
                Export as ZIP
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleImportProject}
                data-testid="menu-import-project"
              >
                Import ZIP
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => multiFileInputRef.current?.click()}
                data-testid="menu-import-files"
              >
                Import Files
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Advanced Features */}
              <DropdownMenuLabel className="text-xs text-muted-foreground">Advanced</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setShowAdvanced(true)}
                data-testid="menu-advanced-features"
              >
                Advanced Features
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowGit(true)}
                data-testid="menu-git"
              >
                Git
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowPackages(true)}
                data-testid="menu-packages"
              >
                Package Manager
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowRESTClient(true)}
                data-testid="menu-rest-client"
              >
                REST Client / API
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowTheme(true)}
                data-testid="menu-theme"
              >
                Theme
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleFileSelected}
            style={{ display: "none" }}
            data-testid="input-import-file"
          />
          <input
            ref={multiFileInputRef}
            type="file"
            multiple
            onChange={handleMultiFileImport}
            style={{ display: "none" }}
            data-testid="input-import-files"
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            className="h-8 w-8 flex-shrink-0"
            data-testid="button-home"
          >
            <HomeIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content - Fixed Layout */}
      <div className="flex flex-1 overflow-hidden gap-0">
        {/* File Tree Sidebar - Collapsible */}
        {showFileTree && (
          <div className="w-56 border-r bg-sidebar overflow-hidden flex flex-col flex-shrink-0">
            <div className="h-10 flex items-center justify-between px-3 border-b">
              <span className="text-xs font-medium">FILES</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFileTree(false)}
                className="h-6 w-6"
              >
                <XMarkIcon className="h-3 w-3" />
              </Button>
            </div>
            <FileTree
              files={files}
              onFileSelect={handleFileSelect}
              onFileCreate={handleCreateFile}
              onFolderCreate={handleCreateFolder}
              onFileDelete={handleFileDelete}
              onFolderDelete={handleFileDelete}
            />
          </div>
        )}

        {/* Editor Area - Main */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Editor Tabs */}
          <EditorTabs
            tabs={tabs}
            activeTabId={activeTabId}
            onTabSelect={setActiveTabId}
            onTabClose={handleTabClose}
          />

          {/* Editor or Empty State */}
          <div className="flex-1 overflow-hidden">
            {activeTab ? (
              <CodeEditor
                value={activeTab.content}
                language={activeTab.language}
                onChange={handleEditorChange}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6">
                <DocumentPlusIcon className="h-12 w-12 text-muted-foreground/40" />
                <h3 className="text-base font-medium mt-3">No file open</h3>
                <p className="text-xs text-muted-foreground mt-2 text-center max-w-xs">
                  Create or select a file to start coding
                </p>
                <Button
                  variant="default"
                  size="sm"
                  className="mt-4 gap-2"
                  onClick={() => setCreateFileDialogOpen(true)}
                  data-testid="button-create-file"
                >
                  <DocumentPlusIcon className="h-3 w-3" />
                  New File
                </Button>
              </div>
            )}
          </div>

          {/* Terminal - Bottom */}
          {showTerminal && (
            <div className="h-40 border-t bg-card flex flex-col flex-shrink-0">
              <div className="h-8 flex items-center justify-between px-3 border-b bg-background">
                <span className="text-xs font-medium">TERMINAL</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowTerminal(false)}
                  className="h-6 w-6"
                >
                  <XMarkIcon className="h-3 w-3" />
                </Button>
              </div>
              <div
                ref={terminalRef}
                className="flex-1 overflow-auto p-3 font-mono text-xs whitespace-pre-wrap"
              >
                {terminalOutput}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating AI Widget - Bottom Left */}
      {aiEnabled && (
        <>
          {!showAI && (
            <Button
              onClick={() => setShowAI(true)}
              className="fixed bottom-6 left-6 rounded-full w-12 h-12 shadow-lg"
              size="icon"
              data-testid="button-ai-widget"
            >
              <SparklesIcon className="h-5 w-5" />
            </Button>
          )}

          {showAI && (
            <div className="fixed bottom-6 left-6 w-80 max-h-96 bg-card border rounded-lg shadow-xl flex flex-col z-50">
              <div className="h-10 flex items-center justify-between px-3 border-b bg-background">
                <span className="text-sm font-medium flex items-center gap-2">
                  <SparklesIcon className="h-4 w-4" />
                  AI
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAI(false)}
                  className="h-6 w-6"
                >
                  <XMarkIcon className="h-3 w-3" />
                </Button>
              </div>

              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {aiMessages.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-4">
                      Ask about your code
                    </div>
                  )}
                  {aiMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`text-xs ${msg.role === "user" ? "text-right" : "text-left"}`}
                    >
                      <div
                        className={`inline-block max-w-xs p-2 rounded ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-2 border-t bg-background space-y-2">
                <Textarea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask..."
                  className="min-h-8 resize-none text-xs"
                  data-testid="input-ai-message"
                />
                <Button
                  onClick={handleAISend}
                  disabled={aiLoading || !aiInput.trim()}
                  size="sm"
                  className="w-full"
                  data-testid="button-send-ai"
                >
                  Send
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create File Dialog */}
      <Dialog open={createFileDialogOpen} onOpenChange={setCreateFileDialogOpen}>
        <DialogContent data-testid="dialog-create-file">
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
            <DialogDescription>Enter filename with extension (e.g. main.py)</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="filename">Filename</Label>
            <Input
              id="filename"
              placeholder="main.py"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmCreateFile()}
              data-testid="input-filename"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateFileDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmCreateFile} data-testid="button-create-confirm">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog open={createFolderDialogOpen} onOpenChange={setCreateFolderDialogOpen}>
        <DialogContent data-testid="dialog-create-folder">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>Enter folder name</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="foldername">Folder Name</Label>
            <Input
              id="foldername"
              placeholder="my-folder"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmCreateFolder()}
              data-testid="input-foldername"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateFolderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmCreateFolder} data-testid="button-create-folder-confirm">
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      {deleteConfirmOpen && fileToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-xl">
            <h3 className="font-medium mb-2">Delete File?</h3>
            <p className="text-sm text-muted-foreground mb-4">{fileToDelete.name}</p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                data-testid="button-confirm-delete"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* HTML Preview Modal */}
      {showHtmlPreview && (
        <HTMLPreview
          html={htmlPreview}
          onClose={() => setShowHtmlPreview(false)}
        />
      )}

      {/* REST Client Modal */}
      <RESTClient
        open={showRESTClient}
        onOpenChange={setShowRESTClient}
      />
    </div>
  );
}
