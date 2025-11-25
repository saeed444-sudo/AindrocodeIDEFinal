import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap, Code2 } from "lucide-react";
import { useState } from "react";

interface CompletionSuggestion {
  text: string;
  description: string;
}

interface AICompletionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: string;
  language: string;
  onInsert: (suggestion: string) => void;
}

export function AICompletion({ open, onOpenChange, context, language, onInsert }: AICompletionProps) {
  const [suggestions, setSuggestions] = useState<CompletionSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGetSuggestions = () => {
    setLoading(true);
    setTimeout(() => {
      setSuggestions([
        { text: "async function fetchData() { const res = await fetch(...); return res.json(); }", description: "Async fetch wrapper" },
        { text: "const handleClick = () => { /* handler */ }", description: "Event handler" },
        { text: "const data = useMemo(() => compute(), [deps])", description: "Memoized computation" },
      ]);
      setLoading(false);
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-3/4 flex flex-col" data-testid="dialog-ai-completion">
        <DialogHeader>
          <DialogTitle>AI Code Completion (Week 6)</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <div className="flex gap-2">
            <Button
              onClick={handleGetSuggestions}
              disabled={loading || !context.trim()}
              data-testid="button-get-completions"
            >
              <Zap className="w-4 h-4 mr-2" />
              {loading ? "Analyzing..." : "Get Suggestions"}
            </Button>
          </div>

          {suggestions.length > 0 && (
            <ScrollArea className="flex-1">
              <div className="pr-4 space-y-2">
                {suggestions.map((suggestion, idx) => (
                  <Card key={idx} className="p-3 hover-elevate cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-xs font-semibold mb-1">{suggestion.description}</p>
                        <code className="text-xs bg-secondary p-2 block rounded overflow-x-auto">
                          {suggestion.text}
                        </code>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          onInsert(suggestion.text);
                          onOpenChange(false);
                        }}
                        data-testid={`button-insert-completion-${idx}`}
                      >
                        <Code2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}

          {!suggestions && !loading && (
            <Card className="flex-1 flex items-center justify-center">
              <p className="text-secondary text-sm">Get AI-powered code suggestions</p>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
