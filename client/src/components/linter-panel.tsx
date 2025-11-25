import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { lintCode } from "@/lib/ide-features/linter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

interface LinterPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
  language: string;
}

export function LinterPanel({ open, onOpenChange, code, language }: LinterPanelProps) {
  const errors = lintCode(code, language);
  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = errors.filter(e => e.severity === 'warning').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-linter">
        <DialogHeader>
          <DialogTitle>Code Analysis</DialogTitle>
        </DialogHeader>
        <div className="mb-4 flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{errorCount} errors</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span>{warningCount} warnings</span>
          </div>
        </div>

        <ScrollArea className="h-96">
          <div className="pr-4 space-y-2">
            {errors.length === 0 ? (
              <Card className="p-4">
                <p className="text-xs text-secondary text-center py-4">No issues found!</p>
              </Card>
            ) : (
              errors.map((error, idx) => (
                <Card key={idx} className="p-3">
                  <div className="flex items-start gap-2">
                    {error.severity === 'error' && <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />}
                    {error.severity === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />}
                    {error.severity === 'info' && <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <p className="text-xs font-semibold">{error.message}</p>
                      <p className="text-xs text-secondary mt-1">Line {error.line + 1}, Column {error.column}</p>
                    </div>
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
