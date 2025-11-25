import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

interface Shortcut {
  keys: string;
  action: string;
  category: string;
}

const SHORTCUTS: Shortcut[] = [
  // Navigation
  { keys: 'Ctrl+F', action: 'Find in file', category: 'Navigation' },
  { keys: 'Ctrl+H', action: 'Find and replace', category: 'Navigation' },
  { keys: 'Ctrl+G', action: 'Go to line', category: 'Navigation' },
  { keys: 'Ctrl+P', action: 'Quick file open', category: 'Navigation' },
  
  // Editing
  { keys: 'Ctrl+/', action: 'Toggle comment', category: 'Editing' },
  { keys: 'Ctrl+Z', action: 'Undo', category: 'Editing' },
  { keys: 'Ctrl+Shift+Z', action: 'Redo', category: 'Editing' },
  { keys: 'Ctrl+X', action: 'Cut line', category: 'Editing' },
  { keys: 'Alt+Up', action: 'Move line up', category: 'Editing' },
  { keys: 'Alt+Down', action: 'Move line down', category: 'Editing' },
  { keys: 'Ctrl+D', action: 'Delete line', category: 'Editing' },
  
  // Execution
  { keys: 'Ctrl+Enter', action: 'Run code', category: 'Execution' },
  { keys: 'Ctrl+Shift+Enter', action: 'Run with input', category: 'Execution' },
  
  // UI
  { keys: 'Ctrl+B', action: 'Toggle sidebar', category: 'UI' },
  { keys: 'Ctrl+Shift+P', action: 'Command palette', category: 'UI' },
  { keys: 'Ctrl+K Ctrl+S', action: 'Show shortcuts', category: 'UI' },
];

interface KeyboardShortcutsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcuts({ open, onOpenChange }: KeyboardShortcutsProps) {
  const categories = Array.from(new Set(SHORTCUTS.map(s => s.category)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-keyboard-shortcuts">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96">
          <div className="pr-4">
            {categories.map((category) => (
              <div key={category} className="mb-6">
                <h3 className="font-semibold text-sm mb-3">{category}</h3>
                <div className="space-y-2">
                  {SHORTCUTS.filter(s => s.category === category).map((shortcut, idx) => (
                    <Card key={idx} className="p-3 flex items-center justify-between">
                      <span className="text-sm">{shortcut.action}</span>
                      <kbd className="px-3 py-1 bg-secondary rounded text-xs font-mono font-semibold">
                        {shortcut.keys}
                      </kbd>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
