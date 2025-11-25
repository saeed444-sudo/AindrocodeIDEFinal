import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { gitManager } from "@/lib/ide-features/git-manager";

interface GitPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GitPanel({ open, onOpenChange }: GitPanelProps) {
  const status = gitManager.getStatus();
  const commits = gitManager.getCommits();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-git">
        <DialogHeader>
          <DialogTitle>Git Integration (Coming Week 3)</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96">
          <div className="pr-4 space-y-4">
            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-3">Status</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <Badge variant="secondary">Staged: {status.staged.length}</Badge>
                </div>
                <div>
                  <Badge variant="secondary">Modified: {status.modified.length}</Badge>
                </div>
                <div>
                  <Badge variant="secondary">Untracked: {status.untracked.length}</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-3">Recent Commits ({commits.length})</h4>
              {commits.length === 0 ? (
                <p className="text-xs text-secondary">No commits yet</p>
              ) : (
                <div className="space-y-2">
                  {commits.map((commit) => (
                    <div key={commit.hash} className="text-xs">
                      <p className="font-mono font-semibold">{commit.hash.substring(0, 7)}</p>
                      <p>{commit.message}</p>
                      <p className="text-secondary">{commit.author} · {commit.date.toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-4 border-blue-200 dark:border-blue-800">
              <p className="text-xs text-secondary">
                Full Git integration with commit, push, and branch management coming in Week 3.
              </p>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
