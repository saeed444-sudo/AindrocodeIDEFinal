import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface Feature {
  name: string;
  status: 'ready' | 'coming' | 'roadmap';
  description: string;
  beta?: boolean;
}

const FEATURES: Feature[] = [
  { name: 'Search & Replace', status: 'ready', description: 'Ctrl+F/H for find and replace' },
  { name: 'Go to Line', status: 'ready', description: 'Ctrl+G to jump to line' },
  { name: 'Code Snippets', status: 'ready', description: 'Quick code insertion library' },
  { name: 'Keyboard Shortcuts', status: 'ready', description: 'All shortcuts documented' },
  { name: 'Code Formatter', status: 'ready', description: 'Auto-format code' },
  { name: 'Python input()', status: 'ready', description: 'Input prompts for Python' },
  { name: 'File Import', status: 'ready', description: 'ZIP or individual files' },
  { name: 'Debugger', status: 'coming', description: 'Breakpoints & stepping (Week 3)', beta: true },
  { name: 'Linting', status: 'coming', description: 'Real-time code analysis (Week 3)' },
  { name: 'Git Integration', status: 'coming', description: 'Basic git commands (Week 3)' },
  { name: 'LSP Support', status: 'coming', description: 'Full IntelliSense (Week 4)' },
  { name: 'Package Manager', status: 'coming', description: 'Manage npm/pip (Week 4)' },
  { name: 'Database Browser', status: 'coming', description: 'SQLite/DuckDB explorer (Week 4)' },
  { name: 'REST Client', status: 'coming', description: 'Test APIs visually (Week 5)' },
  { name: 'Android APK', status: 'roadmap', description: 'Native mobile app (Q2 2026)' },
];

interface AdvancedFeaturesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdvancedFeaturesPanel({ open, onOpenChange }: AdvancedFeaturesPanelProps) {
  const ready = FEATURES.filter(f => f.status === 'ready');
  const coming = FEATURES.filter(f => f.status === 'coming');
  const roadmap = FEATURES.filter(f => f.status === 'roadmap');

  const FeatureItem = ({ feature }: { feature: Feature }) => (
    <Card className="p-3 hover-elevate">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{feature.name}</span>
            {feature.beta && <Badge variant="secondary" className="text-xs">BETA</Badge>}
          </div>
          <p className="text-xs text-secondary mt-1">{feature.description}</p>
        </div>
        {feature.status === 'ready' && <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />}
        {feature.status === 'coming' && <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />}
        {feature.status === 'roadmap' && <AlertCircle className="w-4 h-4 text-gray-600 flex-shrink-0 mt-1" />}
      </div>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-96 overflow-y-auto" data-testid="dialog-advanced-features">
        <DialogHeader>
          <DialogTitle>Advanced IDE Features</DialogTitle>
          <DialogDescription>32 features across 5 tiers - some ready now, others coming soon</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" /> Ready Now
            </h4>
            <div className="space-y-2">
              {ready.map(f => <FeatureItem key={f.name} feature={f} />)}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> Coming This Month
            </h4>
            <div className="space-y-2">
              {coming.map(f => <FeatureItem key={f.name} feature={f} />)}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-gray-600" /> Roadmap
            </h4>
            <div className="space-y-2">
              {roadmap.map(f => <FeatureItem key={f.name} feature={f} />)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
