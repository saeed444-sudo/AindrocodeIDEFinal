import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  HomeIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  CodeBracketIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { aiClient } from "@/lib/ai-client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface AgentPlan {
  id: string;
  title: string;
  steps: string[];
  status: "pending" | "approved" | "rejected" | "executing" | "completed";
  fileChanges?: {
    path: string;
    action: "create" | "modify" | "delete";
  }[];
}

export default function AI() {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agentMode, setAgentMode] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<AgentPlan | null>(null);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Initialize AI client on page load
  useEffect(() => {
    const initAI = () => {
      const savedKey = localStorage.getItem("openai-api-key");
      if (savedKey && savedKey.trim()) {
        console.log("Initializing aiClient with saved API key...");
        aiClient.init(savedKey.trim());
        setHasApiKey(true);
      } else {
        console.log("No API key found in localStorage");
        setHasApiKey(false);
      }
    };

    initAI();

    // Also listen for API key updates from Settings page
    const handleApiKeyUpdate = () => {
      initAI();
    };

    window.addEventListener('apikey-updated', handleApiKeyUpdate);
    window.addEventListener('ai-client-updated', handleApiKeyUpdate);
    window.addEventListener('storage', handleApiKeyUpdate);

    return () => {
      window.removeEventListener('apikey-updated', handleApiKeyUpdate);
      window.removeEventListener('ai-client-updated', handleApiKeyUpdate);
      window.removeEventListener('storage', handleApiKeyUpdate);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Check if aiClient is ready
    if (!aiClient.isInitialized()) {
      const errorMsg: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: "API key not configured. Please go to Settings and add your OpenAI API key.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      return;
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Build message history for context
      const messageHistory = [
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
        { role: "user" as const, content: userMessage.content },
      ];

      console.log("Sending message via aiClient...");
      const response = await aiClient.chat(messageHistory);

      const aiMessage: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMsg: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Failed to get AI response. Check your API key and try again."}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgentRequest = async () => {
    // Check if we have API key for Agent Mode
    if (!aiClient.isInitialized()) {
      const errorMsg: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: "Agent Mode requires API key. Please add your OpenAI API key in Settings.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      return;
    }

    setIsLoading(true);

    try {
      // Ask the user what they want to do
      const userInput =
        inputValue.trim() ||
        "Help me implement a user authentication system with login and signup.";

      if (inputValue.trim()) {
        const userMessage: Message = {
          id: `msg-${Date.now()}`,
          role: "user",
          content: userInput,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
      }

      // Generate plan via aiClient
      console.log("Generating agent plan...");
      const plan = await aiClient.generatePlan(userInput, {
        files: [],
        projectName: "Current Project",
      });

      const agentPlan: AgentPlan = {
        id: `plan-${Date.now()}`,
        title: plan.title,
        steps: plan.steps,
        status: "pending",
        fileChanges: plan.fileChanges,
      };

      setCurrentPlan(agentPlan);
      setShowPlanDialog(true);

      const planMsg: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `I've created a plan for: "${plan.title}". Please review and approve it in the dialog.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, planMsg]);
    } catch (error) {
      console.error("Error generating plan:", error);
      const errorMsg: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `Agent error: ${error instanceof Error ? error.message : "Failed to generate plan. Check your API key."}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovePlan = () => {
    if (currentPlan) {
      setCurrentPlan({ ...currentPlan, status: "approved" });
      setShowPlanDialog(false);
      const approvalMsg: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `Plan approved! Executing: ${currentPlan.title}\n\nChanges will be made to:\n${currentPlan.fileChanges?.map((f) => `• ${f.action}: ${f.path}`).join("\n") || "N/A"}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, approvalMsg]);
    }
  };

  const handleRejectPlan = () => {
    if (currentPlan) {
      setCurrentPlan({ ...currentPlan, status: "rejected" });
      setShowPlanDialog(false);
      const rejectMsg: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: "Plan rejected. Ask me to create a different plan.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, rejectMsg]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Bar */}
      <div className="h-14 flex items-center justify-between px-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <SparklesIcon className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-base font-medium">AI Assistant</h1>
          <span className="text-xs text-muted-foreground">
            {hasApiKey ? "Ready" : "Need API Key"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            data-testid="button-home"
          >
            <HomeIcon className="h-5 w-5" />
          </Button>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Mode Toggle */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <Button
                variant={!agentMode ? "default" : "secondary"}
                size="sm"
                onClick={() => setAgentMode(false)}
                data-testid="button-chat-mode"
              >
                Chat Mode
              </Button>
              <Button
                variant={agentMode ? "default" : "secondary"}
                size="sm"
                onClick={() => setAgentMode(true)}
                data-testid="button-agent-mode"
              >
                Agent Mode
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {agentMode
                ? "AI Agent can read, create, modify, and delete files with your approval"
                : "Chat with AI for code generation, debugging, and explanations"}
            </p>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <SparklesIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium">
                  {hasApiKey ? "AI Assistant Ready" : "Configure API Key"}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
                  {hasApiKey
                    ? agentMode
                      ? "Ask the AI Agent to help build features, refactor code, or fix bugs. It can modify your project files with your approval."
                      : "Ask questions, generate code, debug issues, or get explanations."
                    : "Please go to Settings and add your OpenAI API key to use AI features."}
                </p>
                {agentMode && hasApiKey && (
                  <Button
                    variant="default"
                    className="mt-6 gap-2"
                    onClick={handleAgentRequest}
                    data-testid="button-example-agent-request"
                  >
                    <SparklesIcon className="h-4 w-4" />
                    Generate Project Plan
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={message.role === "user" ? "ml-8" : "mr-8"}
                    data-testid={`message-${message.role}-${message.id}`}
                  >
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={message.role === "user" ? "secondary" : "default"}>
                            {message.role === "user" ? "You" : "AI"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
                {isLoading && (
                  <div className="mr-8">
                    <Card>
                      <CardHeader className="pb-3">
                        <Badge variant="default">AI</Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <div className="animate-pulse">Thinking...</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          {hasApiKey && (
            <div className="p-4 border-t">
              <div className="max-w-3xl mx-auto space-y-3">
                <Textarea
                  placeholder={
                    agentMode
                      ? "Ask the AI Agent to build a feature, refactor code, or fix bugs..."
                      : "Ask a question or request code generation..."
                  }
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      agentMode ? handleAgentRequest() : handleSendMessage();
                    }
                  }}
                  className="min-h-24 resize-none"
                  data-testid="input-ai-message"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                  <Button
                    onClick={agentMode ? handleAgentRequest : handleSendMessage}
                    disabled={!inputValue.trim() && !agentMode || isLoading}
                    className="gap-2"
                    data-testid="button-send-message"
                  >
                    <PaperAirplaneIcon className="h-4 w-4" />
                    {agentMode ? "Generate Plan" : "Send"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Agent Plan Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="max-w-2xl" data-testid="dialog-agent-plan">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-primary" />
              Agent Plan Review
            </DialogTitle>
            <DialogDescription>Review the AI Agent's plan before execution</DialogDescription>
          </DialogHeader>

          {currentPlan && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="text-lg font-medium mb-2">{currentPlan.title}</h3>
                <Badge variant="secondary">{currentPlan.status}</Badge>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-3">Execution Steps</h4>
                <div className="space-y-2">
                  {currentPlan.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary">{index + 1}</span>
                      </div>
                      <p className="text-sm flex-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {currentPlan.fileChanges && currentPlan.fileChanges.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-3">File Changes</h4>
                    <div className="space-y-1">
                      {currentPlan.fileChanges.map((change, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Badge
                            variant={
                              change.action === "create"
                                ? "default"
                                : change.action === "modify"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="text-xs"
                          >
                            {change.action}
                          </Badge>
                          <span className="font-mono text-xs">{change.path}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={handleRejectPlan}
              className="gap-2"
              data-testid="button-reject-plan"
            >
              <XCircleIcon className="h-4 w-4" />
              Reject
            </Button>
            <Button
              onClick={handleApprovePlan}
              className="gap-2"
              data-testid="button-approve-plan"
            >
              <CheckCircleIcon className="h-4 w-4" />
              Approve & Execute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
