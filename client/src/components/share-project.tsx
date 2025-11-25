import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Share2, Github } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ShareProjectProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
}

export function ShareProject({ open, onOpenChange, projectId, projectName }: ShareProjectProps) {
  const { toast } = useToast();
  const [shareUrl] = useState(`${window.location.origin}?shared=${projectId}`);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link copied!", description: "Shareable link copied to clipboard" });
  };

  const handleExportGist = () => {
    toast({ title: "Coming Soon", description: "GitHub Gist export coming in Week 4", variant: "default" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-share-project">
        <DialogHeader>
          <DialogTitle>Share Project - {projectName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="p-4">
            <h4 className="font-semibold text-sm mb-3">Shareable Link</h4>
            <div className="flex gap-2">
              <Input
                readOnly
                value={shareUrl}
                data-testid="input-share-url"
              />
              <Button
                onClick={handleCopyLink}
                size="sm"
                data-testid="button-copy-share-link"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-secondary mt-2">Anyone with this link can view your project</p>
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold text-sm mb-3">Export Options</h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={handleExportGist}
                disabled
                data-testid="button-export-gist"
              >
                <Github className="w-4 h-4" />
                Export to GitHub Gist
                <Badge variant="secondary" className="ml-auto">Week 4</Badge>
              </Button>
            </div>
          </Card>

          <Card className="p-4 bg-blue-50 dark:bg-blue-950">
            <p className="text-xs text-secondary">
              Shared projects are read-only. Only you can edit the original project.
            </p>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
