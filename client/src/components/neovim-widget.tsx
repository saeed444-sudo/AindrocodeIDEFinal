import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XMarkIcon, CodeBracketIcon } from "@heroicons/react/24/outline";
import { getNeovimConfig, saveNeovimConfig, type NeovimConfig } from "@/lib/executor";

interface NeovimWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NeovimWidget({ isOpen, onClose }: NeovimWidgetProps) {
  const [config, setConfig] = useState<NeovimConfig>(getNeovimConfig());

  const handleSaveConfig = () => {
    saveNeovimConfig(config);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96 max-h-96 overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="flex items-center gap-2">
            <CodeBracketIcon className="h-5 w-5" />
            <div>
              <CardTitle>Neovim WASM Mode</CardTitle>
              <CardDescription>Configure your Neovim experience</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
            <XMarkIcon className="h-3 w-3" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <Badge variant="outline">Coming Soon</Badge>

          <div className="space-y-3">
            <div className="text-sm">
              <label className="font-medium">Theme</label>
              <select
                value={config.theme}
                onChange={(e) => setConfig({ ...config, theme: e.target.value })}
                className="w-full mt-1 px-2 py-1 border rounded text-sm"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="nord">Nord</option>
                <option value="dracula">Dracula</option>
              </select>
            </div>

            <div className="text-sm">
              <label className="font-medium">Key Bindings</label>
              <select
                value={config.keybindings}
                onChange={(e) =>
                  setConfig({ ...config, keybindings: e.target.value as "vim" | "vscode" })
                }
                className="w-full mt-1 px-2 py-1 border rounded text-sm"
              >
                <option value="vim">Vim</option>
                <option value="vscode">VSCode</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={config.runOnLeaderR}
                onChange={(e) => setConfig({ ...config, runOnLeaderR: e.target.checked })}
                id="leader-r"
              />
              <label htmlFor="leader-r" className="font-medium">
                Run file with &lt;leader&gt;r
              </label>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
            <p className="font-medium">Features Coming:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Full Neovim 0.9+ instance</li>
              <li>.lua configuration and plugins</li>
              <li>LSP integration via nvim-lspconfig</li>
              <li>Run current file with &lt;leader&gt;r</li>
              <li>Terminal split for command execution</li>
            </ul>
          </div>

          <Button onClick={handleSaveConfig} className="w-full">
            Save Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
