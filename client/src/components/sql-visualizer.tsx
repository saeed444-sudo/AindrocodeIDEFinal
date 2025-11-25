import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play } from "lucide-react";
import { useState } from "react";

interface SQLVisualizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SQLVisualizer({ open, onOpenChange }: SQLVisualizerProps) {
  const [query, setQuery] = useState("SELECT * FROM users LIMIT 10;");
  const [results, setResults] = useState<any[]>([]);
  const [executing, setExecuting] = useState(false);

  const handleExecute = async () => {
    setExecuting(true);
    setTimeout(() => {
      setResults([
        { id: 1, name: "Alice", email: "alice@example.com", created: "2024-01-15" },
        { id: 2, name: "Bob", email: "bob@example.com", created: "2024-01-20" },
        { id: 3, name: "Charlie", email: "charlie@example.com", created: "2024-02-01" },
      ]);
      setExecuting(false);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-3/4 flex flex-col" data-testid="dialog-sql-visualizer">
        <DialogHeader>
          <DialogTitle>SQL Query Visualizer</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              placeholder="SELECT * FROM table..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              data-testid="input-sql-query"
              className="flex-1"
            />
            <Button onClick={handleExecute} disabled={executing} data-testid="button-execute-sql">
              <Play className="w-4 h-4 mr-2" />
              Execute
            </Button>
          </div>

          <div className="flex-1 overflow-hidden">
            {results.length === 0 ? (
              <Card className="h-full flex items-center justify-center">
                <p className="text-secondary text-sm">Run a query to see results</p>
              </Card>
            ) : (
              <ScrollArea className="h-full">
                <div className="pr-4">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b">
                        {Object.keys(results[0]).map((key) => (
                          <th key={key} className="p-2 text-left font-semibold">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((row, idx) => (
                        <tr key={idx} className="border-b hover:bg-secondary/50">
                          {Object.values(row).map((val: any, i) => (
                            <td key={i} className="p-2">{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
