import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";

interface Version {
  id: string;
  timestamp: Date;
  preview: string;
  size: number;
}

interface VersionHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filename: string;
  onRestore: (version: Version) => void;
}

export function VersionHistory({ open, onOpenChange, filename, onRestore }: VersionHistoryProps) {
  const [versions] = useState<Version[]>([
    { id: "v1", timestamp: new Date(Date.now() - 3600000), preview: "function main() { ... }", size: 245 },
    { id: "v2", timestamp: new Date(Date.now() - 7200000), preview: "const x = 10; ...", size: 198 },
    { id: "v3", timestamp: new Date(Date.now() - 86400000), preview: "old version content...", size: 156 },
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-version-history">
        <DialogHeader>
          <DialogTitle>Version History - {filename}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-96">
          <div className="pr-4 space-y-2">
            {versions.map((version) => (
              <Card key={version.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{version.id}</Badge>
                      <span className="text-xs text-secondary">
                        {version.timestamp.toLocaleString()}
                      </span>
                      <span className="text-xs text-tertiary">{version.size} bytes</span>
                    </div>
                    <code className="text-xs bg-secondary p-2 block rounded overflow-x-auto">
                      {version.preview}
                    </code>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRestore(version)}
                      data-testid={`button-restore-version-${version.id}`}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
