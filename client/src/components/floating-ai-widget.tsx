import { useState } from "react";
import { SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface FloatingAIWidgetProps {
  enabled: boolean;
}

export function FloatingAIWidget({ enabled }: FloatingAIWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!enabled) return null;

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputValue,
    };

    setMessages([...messages, userMsg]);
    setInputValue("");
    setIsLoading(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: "AI features require OpenAI API key. Add one in Settings to enable.",
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
          size="icon"
          data-testid="button-ai-widget"
        >
          <SparklesIcon className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-96 shadow-2xl flex flex-col">
          <div className="h-12 flex items-center justify-between px-4 border-b bg-background">
            <span className="text-sm font-medium flex items-center gap-2">
              <SparklesIcon className="h-4 w-4" />
              AI Assistant
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsOpen(false)}
              data-testid="button-close-ai-widget"
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">
                  Ask me anything about your code!
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`text-sm ${
                    msg.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block max-w-xs p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="text-sm text-muted-foreground">
                  AI is thinking...
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-3 border-t bg-background space-y-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask AI..."
              className="min-h-12 resize-none"
              data-testid="input-ai-message"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              className="w-full"
              size="sm"
              data-testid="button-send-ai-message"
            >
              Send
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
