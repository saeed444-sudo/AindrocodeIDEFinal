import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, X } from "lucide-react";
import { useState } from "react";

interface Comment {
  id: string;
  line: number;
  author: string;
  text: string;
  timestamp: Date;
}

interface CodeCommentsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filename: string;
}

export function CodeComments({ open, onOpenChange, filename }: CodeCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([
    { id: "1", line: 5, author: "You", text: "Need to refactor this function", timestamp: new Date() },
    { id: "2", line: 12, author: "You", text: "Add error handling here", timestamp: new Date(Date.now() - 3600000) },
  ]);
  const [newText, setNewText] = useState("");
  const [selectedLine, setSelectedLine] = useState(1);

  const handleAddComment = () => {
    if (newText.trim()) {
      setComments([...comments, {
        id: String(comments.length + 1),
        line: selectedLine,
        author: "You",
        text: newText,
        timestamp: new Date(),
      }]);
      setNewText("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-3/4 flex flex-col" data-testid="dialog-code-comments">
        <DialogHeader>
          <DialogTitle>Code Comments - {filename}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Line number"
              value={selectedLine}
              onChange={(e) => setSelectedLine(parseInt(e.target.value) || 1)}
              className="w-24"
              data-testid="input-line-number"
            />
            <Textarea
              placeholder="Add a comment..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="flex-1 resize-none"
              data-testid="textarea-new-comment"
            />
            <Button
              onClick={handleAddComment}
              disabled={!newText.trim()}
              data-testid="button-add-comment"
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="pr-4 space-y-2">
              {comments.map((comment) => (
                <Card key={comment.id} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold">Line {comment.line}</span>
                        <span className="text-xs text-secondary">{comment.author}</span>
                        <span className="text-xs text-tertiary">{comment.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm">{comment.text}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setComments(comments.filter(c => c.id !== comment.id))}
                      data-testid={`button-delete-comment-${comment.id}`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
