import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";

const THEMES = [
  { id: 'light', name: 'Light', colors: '#fff bg-gray-900' },
  { id: 'dark', name: 'Dark', colors: '#000 bg-white' },
  { id: 'blue', name: 'Blue Accent', colors: '#007AFF bg-f5f5f5' },
  { id: 'purple', name: 'Purple Accent', colors: '#A855F7 bg-f9f5ff' },
  { id: 'green', name: 'Green Accent', colors: '#10B981 bg-f0fdf4' },
];

interface ThemeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

export function ThemeSelector({ open, onOpenChange, currentTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-theme-selector">
        <DialogHeader>
          <DialogTitle>Theme & Color Customization</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-96">
          <div className="pr-4 grid grid-cols-2 gap-3">
            {THEMES.map((theme) => (
              <Card
                key={theme.id}
                className={`p-4 cursor-pointer hover-elevate transition-all ${
                  currentTheme === theme.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onThemeChange(theme.id)}
                data-testid={`card-theme-${theme.id}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">{theme.name}</h4>
                  {currentTheme === theme.id && <Check className="w-4 h-4 text-primary" />}
                </div>
                <div className="flex gap-2 h-12">
                  <div className="flex-1 rounded bg-white border border-gray-200" />
                  <div className="flex-1 rounded bg-gray-900" />
                </div>
                {theme.id !== 'light' && theme.id !== 'dark' && (
                  <Badge className="mt-2 text-xs">Coming Soon</Badge>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
