import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DebuggerPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DebuggerPanel({ open, onOpenChange }: DebuggerPanelProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-debugger">
        <DialogHeader>
          <DialogTitle>Debugger (Coming Week 3)</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96">
          <div className="pr-4 space-y-4">
            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-2">Features Coming Soon</h4>
              <ul className="text-xs space-y-1 text-secondary">
                <li>✓ Breakpoint management</li>
                <li>✓ Step over/into/out</li>
                <li>✓ Variable inspection</li>
                <li>✓ Call stack view</li>
                <li>✓ Conditional breakpoints</li>
                <li>✓ Watch expressions</li>
              </ul>
            </Card>

            <Card className="p-4 border-blue-200 dark:border-blue-800">
              <Badge className="mb-2">BETA</Badge>
              <p className="text-xs text-secondary">
                Full debugger with breakpoints and variable inspection coming in Week 3. In the meantime, use console.log() for debugging.
              </p>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
