import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllSnippets } from "@/lib/ide-features/snippets";
import { Snippet } from "@/lib/ide-features/snippets";

interface SnippetsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: string;
  onInsert: (snippet: Snippet) => void;
}

export function SnippetsPanel({ open, onOpenChange, language, onInsert }: SnippetsPanelProps) {
  const snippets = getAllSnippets().filter(s => s.language === language);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-snippets">
        <DialogHeader>
          <DialogTitle>Code Snippets for {language}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96">
          <div className="pr-4 space-y-3">
            {snippets.length === 0 ? (
              <p className="text-secondary text-sm">No snippets available for {language}</p>
            ) : (
              snippets.map((snippet) => (
                <Card key={snippet.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{snippet.label}</h4>
                      <p className="text-xs text-secondary mt-1">{snippet.description}</p>
                      <code className="text-xs bg-secondary p-2 mt-2 block rounded overflow-x-auto">
                        {snippet.body.substring(0, 100)}...
                      </code>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        onInsert(snippet);
                        onOpenChange(false);
                      }}
                      data-testid={`button-insert-snippet-${snippet.id}`}
                    >
                      Insert
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
