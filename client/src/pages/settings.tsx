import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  HomeIcon,
  CodeBracketIcon,
  KeyIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTheme as useThemeHook } from "@/lib/theme";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { storage } from "@/lib/storage";
import { aiClient } from "@/lib/ai-client";
import type { Settings as SettingsType } from "@shared/schema";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { effectiveTheme, theme, setTheme } = useThemeHook();
  
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };
  const [apiKey, setApiKey] = useState("");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [fontSize, setFontSize] = useState("14");
  const [tabSize, setTabSize] = useState("2");
  const [keyBindings, setKeyBindings] = useState<"vscode" | "vim">("vscode");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      await storage.init();
      const settings = await storage.getSettings();
      setFontSize(settings.fontSize.toString());
      setTabSize(settings.tabSize.toString());
      setKeyBindings(settings.keyBindings);
      setAiEnabled(settings.aiEnabled);

      // Check for stored API key
      const storedKey = localStorage.getItem("openai-api-key");
      if (storedKey) {
        setApiKey(storedKey);
        setAiEnabled(true);
        aiClient.init(storedKey);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const handleSaveApiKey = async () => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    // Basic validation: OpenAI keys start with 'sk-'
    if (!trimmedKey.startsWith('sk-')) {
      toast({
        title: "Invalid API Key",
        description: "OpenAI API keys should start with 'sk-'. Please check your key.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save to localStorage first
      localStorage.setItem("openai-api-key", trimmedKey);
      
      // Verify it was saved
      const verified = localStorage.getItem("openai-api-key");
      if (!verified || verified !== trimmedKey) {
        throw new Error("Failed to save API key to local storage");
      }

      // Initialize aiClient with the key
      aiClient.init(trimmedKey);
      setAiEnabled(true);
      setApiKey(trimmedKey);

      const settings = await storage.getSettings();
      await storage.updateSettings({ ...settings, aiEnabled: true });

      // Dispatch events to notify all components immediately
      window.dispatchEvent(new CustomEvent('apikey-updated', { detail: { apiKey: trimmedKey } }));
      window.dispatchEvent(new CustomEvent('ai-client-updated', { detail: { apiKey: trimmedKey } }));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'openai-api-key',
        newValue: trimmedKey,
        url: window.location.href,
      }));

      toast({
        title: "Success!",
        description: "API key saved successfully. AI features are now enabled!",
      });
    } catch (error) {
      console.error("Save API key error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save API key",
        variant: "destructive",
      });
    }
  };

  const handleRemoveApiKey = async () => {
    try {
      localStorage.removeItem("openai-api-key");
      setApiKey("");
      setAiEnabled(false);

      const settings = await storage.getSettings();
      await storage.updateSettings({ ...settings, aiEnabled: false });

      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('apikey-updated', { detail: { apiKey: null } }));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'openai-api-key',
        newValue: null,
        url: window.location.href,
      }));

      toast({
        title: "API Key Removed",
        description: "Your OpenAI API key has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove API key",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSettings = async (updates: Partial<SettingsType>) => {
    try {
      const settings = await storage.getSettings();
      await storage.updateSettings({ ...settings, ...updates });
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Bar */}
      <div className="h-14 flex items-center justify-between px-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <CodeBracketIcon className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-base font-medium">Settings</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
          data-testid="button-home"
        >
          <HomeIcon className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Future APK Banner */}
          <Alert className="border-2 border-primary/20">
            <InformationCircleIcon className="h-5 w-5 text-primary" />
            <AlertTitle className="flex items-center gap-2">
              <Badge variant="default">Future Release</Badge>
              <span>Native Android APK Coming Soon</span>
            </AlertTitle>
            <AlertDescription className="mt-2 text-sm leading-relaxed">
              <p className="mb-2">
                A future native Android APK will embed a minimal Linux userspace (PRoot-style runtime),
                removing many current browser limitations:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Full compiler and interpreter support</li>
                <li>Package managers (apt, pip, npm) with local installs</li>
                <li>LSP servers for code intelligence</li>
                <li>Persistent filesystem with true process spawn</li>
                <li>Native toolchains without WebAssembly constraints</li>
              </ul>
              <p className="mt-2">
                Projects will be fully migratable from this PWA to the native build via export/import or
                automatic migration tools.
              </p>
            </AlertDescription>
          </Alert>

          {/* Theme */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {effectiveTheme === "dark" ? (
                  <MoonIcon className="h-5 w-5" />
                ) : (
                  <SunIcon className="h-5 w-5" />
                )}
                Appearance
              </CardTitle>
              <CardDescription>Customize how the app looks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    {effectiveTheme === "dark" ? "Currently enabled" : "Currently disabled"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={toggleTheme}
                  data-testid="button-toggle-theme"
                >
                  {effectiveTheme === "dark" ? "Light" : "Dark"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CodeBracketIcon className="h-5 w-5" />
                Advanced Editor Features
              </CardTitle>
              <CardDescription>Enable experimental and advanced capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Neovim WASM Mode */}
              <div className="space-y-3 pb-4 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">Neovim WASM Mode</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Run a real Neovim instance directly in your browser with .lua script support and &lt;leader&gt;r execution
                    </p>
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Full Neovim keybindings and plugin system</p>
                  <p>• .lua runner scripts with LSP integration</p>
                  <p>• &lt;leader&gt;r keyboard shortcut to execute code</p>
                  <p>• Access to nvim-lspconfig for language servers</p>
                </div>
              </div>

              {/* Collaborative Features */}
              <div className="space-y-3 pb-4 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">Collaborative Workspace</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Share projects and collaborate in real-time using WebRTC peer-to-peer connections
                    </p>
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Share projects via export links with read/write permissions</p>
                  <p>• Real-time code synchronization using WebRTC</p>
                  <p>• Cursor tracking and presence awareness</p>
                  <p>• Server-less collaboration - no central server required</p>
                </div>
              </div>

              {/* Advanced Runner */}
              <div className="space-y-3 pb-4 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">Advanced Runtime Capabilities</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enhanced execution environment with filesystem simulation and network detection
                    </p>
                  </div>
                  <Badge variant="outline">Implemented</Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Per-language capability detection (compilers, interpreters, package managers)</p>
                  <p>• Simulated filesystem with OPFS fallback storage</p>
                  <p>• Network access detection with graceful degradation</p>
                  <p>• LSP support detection for code intelligence</p>
                  <p>• WebAssembly runtime availability flags</p>
                </div>
              </div>

              {/* Native Android APK */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">Native Android APK</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Standalone Android app with embedded Linux userspace for full compiler/package manager support
                    </p>
                  </div>
                  <Badge variant="outline">Roadmap</Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Embedded PRoot-style Linux runtime for native compilation</p>
                  <p>• Full support for gcc, rustc, python, npm, pip, apt</p>
                  <p>• LSP binaries (clangd, pylsp, gopls) integrated</p>
                  <p>• Automatic PWA → APK project migration</p>
                  <p>• True offline-first with persistent workspace storage</p>
                  <p>• Touch-optimized IDE interface for mobile</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyIcon className="h-5 w-5" />
                AI Super-Agent Configuration
              </CardTitle>
              <CardDescription>
                Configure AI features with your OpenAI API key for intelligent code assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">OpenAI API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    data-testid="input-api-key"
                    className="flex-1"
                  />
                  {aiEnabled ? (
                    <Button
                      variant="destructive"
                      onClick={handleRemoveApiKey}
                      data-testid="button-remove-api-key"
                    >
                      <XMarkIcon className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      onClick={handleSaveApiKey}
                      data-testid="button-save-api-key"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Your API key is stored locally and never sent to our servers. Only used for direct OpenAI API calls.
                </p>
              </div>

              {aiEnabled && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium text-sm">AI Agent Capabilities</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Code Quality Analysis</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          AI analyzes your code for issues, metrics, and generates refactoring suggestions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Automated Testing</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          AI generates test cases and helps write comprehensive unit tests
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Refactoring Intelligence</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          AI suggests refactoring patterns, design improvements, and code optimization
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Live Chat Assistance</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Real-time conversation for explanations, debugging, and architectural guidance
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Editor Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Editor Settings</CardTitle>
              <CardDescription>
                Customize your coding experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex-1">
                  <Label className="text-base font-medium">Font Size</Label>
                  <p className="text-sm text-muted-foreground">
                    Editor font size in pixels
                  </p>
                </div>
                <Select
                  value={fontSize}
                  onValueChange={(value) => {
                    setFontSize(value);
                    handleUpdateSettings({ fontSize: parseInt(value, 10) });
                  }}
                >
                  <SelectTrigger className="w-32" data-testid="select-font-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12px</SelectItem>
                    <SelectItem value="13">13px</SelectItem>
                    <SelectItem value="14">14px</SelectItem>
                    <SelectItem value="15">15px</SelectItem>
                    <SelectItem value="16">16px</SelectItem>
                    <SelectItem value="18">18px</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex-1">
                  <Label className="text-base font-medium">Tab Size</Label>
                  <p className="text-sm text-muted-foreground">
                    Number of spaces per tab
                  </p>
                </div>
                <Select
                  value={tabSize}
                  onValueChange={(value) => {
                    setTabSize(value);
                    handleUpdateSettings({ tabSize: parseInt(value, 10) });
                  }}
                >
                  <SelectTrigger className="w-32" data-testid="select-tab-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 spaces</SelectItem>
                    <SelectItem value="4">4 spaces</SelectItem>
                    <SelectItem value="8">8 spaces</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <Label className="text-base font-medium">Key Bindings</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred keyboard shortcuts
                  </p>
                </div>
                <Select
                  value={keyBindings}
                  onValueChange={(value: "vscode" | "vim") => {
                    setKeyBindings(value);
                    handleUpdateSettings({ keyBindings: value });
                  }}
                >
                  <SelectTrigger className="w-32" data-testid="select-keybindings">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vscode">VSCode</SelectItem>
                    <SelectItem value="vim">Vim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Limitations Notice */}
          <Card className="border-2 border-muted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <InformationCircleIcon className="h-5 w-5" />
                Browser Execution Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">
                AindroCode runs entirely in your browser using WebAssembly and JavaScript interpreters.
                This enables offline functionality but comes with some limitations:
              </p>
              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-medium">✓ Fully Supported</h4>
                  <ul className="text-xs text-muted-foreground list-disc list-inside ml-2 mt-1 space-y-0.5">
                    <li>Pure code execution (Python via Pyodide, JavaScript, TypeScript, Lua, etc.)</li>
                    <li>Small standard library usage</li>
                    <li>Basic file operations (in-browser filesystem)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium">⚠ Limited Support</h4>
                  <ul className="text-xs text-muted-foreground list-disc list-inside ml-2 mt-1 space-y-0.5">
                    <li>Package installations (limited to browser-compatible libraries)</li>
                    <li>npm packages (CDN/ESM-based only)</li>
                    <li>pip packages (Pyodide-supported wheels via micropip only)</li>
                    <li>Network requests (CORS restrictions apply)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium">✗ Not Supported</h4>
                  <ul className="text-xs text-muted-foreground list-disc list-inside ml-2 mt-1 space-y-0.5">
                    <li>Full frameworks (React dev server, Flask, Django, Laravel, Spring Boot)</li>
                    <li>Native binaries and system calls</li>
                    <li>Docker containers</li>
                    <li>Database servers (except in-browser SQL engines)</li>
                  </ul>
                </div>
              </div>
              <Alert>
                <InformationCircleIcon className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  These limitations exist because AindroCode runs entirely in the browser without a real OS.
                  The future native APK will remove most of these restrictions.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About AindroCode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Version</span>
                <span className="font-mono">1.0.0-beta</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="secondary">Progressive Web App</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Languages Supported</span>
                <span className="font-medium">50+</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Storage</span>
                <span>IndexedDB / OPFS (Local)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
