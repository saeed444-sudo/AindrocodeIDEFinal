import { useState } from "react";
import {
  FolderIcon,
  FolderOpenIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  language?: string;
}

interface FileTreeProps {
  files: FileNode[];
  activeFile?: string;
  onFileSelect: (file: FileNode) => void;
  onFileCreate: (parentPath?: string) => void;
  onFolderCreate: (parentPath?: string) => void;
  onFileDelete: (file: FileNode) => void;
  onFolderDelete?: (folder: FileNode) => void;
  parentPath?: string;
}

function FileTreeNode({
  node,
  level = 0,
  activeFile,
  onFileSelect,
  onFileDelete,
  onFileCreate,
  onFolderDelete,
  expandedFolders,
  toggleFolder,
}: {
  node: FileNode;
  level?: number;
  activeFile?: string;
  onFileSelect: (file: FileNode) => void;
  onFileDelete: (file: FileNode) => void;
  onFileCreate: (parentPath?: string) => void;
  onFolderDelete?: (folder: FileNode) => void;
  expandedFolders: Set<string>;
  toggleFolder: (path: string) => void;
}) {
  const isFolder = node.type === "folder";
  const isExpanded = expandedFolders.has(node.path);
  const isActive = activeFile === node.path;

  const handleClick = () => {
    if (isFolder) {
      toggleFolder(node.path);
    } else {
      onFileSelect(node);
    }
  };

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-2 px-3 py-1.5 cursor-pointer hover-elevate transition-colors rounded-md",
          isActive && "bg-accent",
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={handleClick}
        data-testid={`file-tree-${node.type}-${node.name}`}
      >
        {isFolder && (
          <ChevronRightIcon
            className={cn(
              "h-4 w-4 transition-transform text-muted-foreground",
              isExpanded && "rotate-90"
            )}
          />
        )}
        {isFolder ? (
          isExpanded ? (
            <FolderOpenIcon className="h-4 w-4 text-primary" />
          ) : (
            <FolderIcon className="h-4 w-4 text-muted-foreground" />
          )
        ) : (
          <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
        )}
        <span className={cn(
          "flex-1 text-sm truncate",
          isActive ? "font-medium" : "font-normal"
        )}>
          {node.name}
        </span>
        
        {isFolder ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
                data-testid={`button-folder-menu-${node.name}`}
              >
                <EllipsisVerticalIcon className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onFileCreate(node.path);
                }}
                data-testid={`menu-create-file-in-${node.name}`}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create File
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onFolderDelete?.(node);
                }}
                data-testid={`menu-delete-folder-${node.name}`}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onFileDelete(node);
            }}
            data-testid={`button-delete-${node.name}`}
          >
            <TrashIcon className="h-3 w-3" />
          </Button>
        )}
      </div>
      {isFolder && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              activeFile={activeFile}
              onFileSelect={onFileSelect}
              onFileDelete={onFileDelete}
              onFileCreate={onFileCreate}
              onFolderDelete={onFolderDelete}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({
  files,
  activeFile,
  onFileSelect,
  onFileCreate,
  onFolderCreate,
  onFileDelete,
  onFolderDelete,
}: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["/"]));

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full border-r bg-card">
      <div className="h-10 flex items-center justify-between px-4 border-b gap-1">
        <span className="text-sm font-medium">Files</span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onFolderCreate()}
            data-testid="button-create-folder"
            title="Create folder"
          >
            <FolderIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onFileCreate()}
            data-testid="button-create-file"
            title="Create file"
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <DocumentTextIcon className="h-12 w-12 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground mt-3 text-center">
                No files yet
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFileCreate()}
                className="mt-2"
                data-testid="button-create-first-file"
              >
                Create a file
              </Button>
            </div>
          ) : (
            files.map((node) => (
              <FileTreeNode
                key={node.id}
                node={node}
                activeFile={activeFile}
                onFileSelect={onFileSelect}
                onFileDelete={onFileDelete}
                onFileCreate={onFileCreate}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
