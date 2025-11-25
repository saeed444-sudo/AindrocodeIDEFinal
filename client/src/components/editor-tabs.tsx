import { XMarkIcon } from "@heroicons/react/24/outline";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  name: string;
  path: string;
  isDirty?: boolean;
}

interface EditorTabsProps {
  tabs: Tab[];
  activeTabId?: string;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

export function EditorTabs({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
}: EditorTabsProps) {
  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="h-10 border-b bg-background">
      <ScrollArea className="w-full h-full">
        <div className="flex items-center h-10">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={cn(
                "group flex items-center gap-2 px-4 py-2 border-r cursor-pointer hover-elevate transition-colors min-w-32 max-w-48",
                activeTabId === tab.id ? "bg-card" : "bg-background"
              )}
              onClick={() => onTabSelect(tab.id)}
              data-testid={`tab-${tab.name}`}
            >
              <DocumentTextIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm truncate flex-1">
                {tab.name}
                {tab.isDirty && <span className="ml-1">•</span>}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                data-testid={`button-close-tab-${tab.name}`}
              >
                <XMarkIcon className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
