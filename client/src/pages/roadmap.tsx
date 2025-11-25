import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Clock, Zap, Code2, Settings, Share2, BarChart3, Terminal } from "lucide-react";
import { useLocation } from "wouter";

interface Feature {
  id: number;
  name: string;
  description: string;
  category: string;
  status: 'completed' | 'in-progress' | 'planned';
  icon: React.ReactNode;
  eta?: string;
}

const FEATURES: Feature[] = [
  // Completed
  { id: 1, name: 'Search & Replace', description: 'Ctrl+F for find, Ctrl+H for replace', category: 'IDE', status: 'completed', icon: <Zap className="w-5 h-5" /> },
  { id: 2, name: 'Go to Line', description: 'Ctrl+G to jump to specific line', category: 'IDE', status: 'completed', icon: <Code2 className="w-5 h-5" /> },
  { id: 3, name: 'Code Formatting', description: 'Auto-indent and formatting', category: 'IDE', status: 'completed', icon: <Code2 className="w-5 h-5" /> },
  { id: 4, name: 'Python input()', description: 'Input prompts for Python scripts', category: 'Runtime', status: 'completed', icon: <Terminal className="w-5 h-5" /> },
  { id: 5, name: 'File Import', description: 'Import individual files or ZIP archives', category: 'File', status: 'completed', icon: <Zap className="w-5 h-5" /> },
  { id: 6, name: '50+ Languages', description: 'All major programming languages supported', category: 'Runtime', status: 'completed', icon: <CheckCircle2 className="w-5 h-5" /> },

  // In Progress
  { id: 7, name: 'Keyboard Shortcuts Panel', description: 'View all shortcuts and customize', category: 'IDE', status: 'in-progress', icon: <Settings className="w-5 h-5" /> },
  { id: 8, name: 'Snippets Library', description: 'Code snippets for quick insertion', category: 'IDE', status: 'in-progress', icon: <Code2 className="w-5 h-5" /> },
  { id: 9, name: 'Dark Mode Auto', description: 'Auto-detect system theme preference', category: 'UI', status: 'in-progress', icon: <Settings className="w-5 h-5" /> },
  { id: 10, name: 'Recent Files', description: 'Quick access to recently opened files', category: 'File', status: 'in-progress', icon: <Clock className="w-5 h-5" /> },

  // Planned
  { id: 11, name: 'Debugger UI', description: 'Breakpoints, stepping, variable inspection', category: 'Debug', status: 'planned', icon: <BarChart3 className="w-5 h-5" />, eta: 'Week 3' },
  { id: 12, name: 'Linting', description: 'Real-time code quality analysis', category: 'Code Quality', status: 'planned', icon: <CheckCircle2 className="w-5 h-5" />, eta: 'Week 3' },
  { id: 13, name: 'LSP (IntelliSense)', description: 'Full Language Server Protocol support', category: 'IDE', status: 'planned', icon: <Zap className="w-5 h-5" />, eta: 'Week 4' },
  { id: 14, name: 'Git Integration', description: 'Basic git commands in browser', category: 'VCS', status: 'planned', icon: <Code2 className="w-5 h-5" />, eta: 'Week 3' },
  { id: 15, name: 'Package Manager UI', description: 'Manage npm/pip dependencies visually', category: 'Packages', status: 'planned', icon: <Settings className="w-5 h-5" />, eta: 'Week 4' },
  { id: 16, name: 'SQL Visualizer', description: 'Pretty-print SQL query results', category: 'Database', status: 'planned', icon: <BarChart3 className="w-5 h-5" />, eta: 'Week 3' },
  { id: 17, name: 'Database Browser', description: 'SQLite/DuckDB explorer', category: 'Database', status: 'planned', icon: <Terminal className="w-5 h-5" />, eta: 'Week 4' },
  { id: 18, name: 'REST API Client', description: 'Built-in API testing tool', category: 'Tools', status: 'planned', icon: <Code2 className="w-5 h-5" />, eta: 'Week 5' },
  { id: 19, name: 'Themes', description: 'Custom color themes & editor themes', category: 'UI', status: 'planned', icon: <Settings className="w-5 h-5" />, eta: 'Week 3' },
  { id: 20, name: 'Share via URL', description: 'Generate shareable project links', category: 'Sharing', status: 'planned', icon: <Share2 className="w-5 h-5" />, eta: 'Week 4' },
  { id: 21, name: 'Export to Gist', description: 'Export code directly to GitHub Gist', category: 'Sharing', status: 'planned', icon: <Share2 className="w-5 h-5" />, eta: 'Week 4' },
  { id: 22, name: 'Version History', description: 'Restore previous file versions', category: 'File', status: 'planned', icon: <Clock className="w-5 h-5" />, eta: 'Week 5' },
  { id: 23, name: 'Code Comments', description: 'Inline code annotations', category: 'Collaboration', status: 'planned', icon: <Code2 className="w-5 h-5" />, eta: 'Week 5' },
  { id: 24, name: 'Minimap', description: 'Visual code map on editor side', category: 'IDE', status: 'planned', icon: <BarChart3 className="w-5 h-5" />, eta: 'Week 3' },
  { id: 25, name: 'Word Wrap Toggle', description: 'Toggle line wrapping on/off', category: 'IDE', status: 'planned', icon: <Settings className="w-5 h-5" />, eta: 'Week 2' },
  { id: 26, name: 'AI Code Completion', description: 'GitHub Copilot-style suggestions', category: 'AI', status: 'planned', icon: <Zap className="w-5 h-5" />, eta: 'Week 6' },
  { id: 27, name: 'Test Generator', description: 'Auto-generate unit tests', category: 'Testing', status: 'planned', icon: <CheckCircle2 className="w-5 h-5" />, eta: 'Week 6' },
  { id: 28, name: 'Documentation Gen', description: 'Auto-generate docstrings/comments', category: 'Documentation', status: 'planned', icon: <Code2 className="w-5 h-5" />, eta: 'Week 5' },
  { id: 29, name: 'Performance Profiler', description: 'Analyze code execution time', category: 'Debug', status: 'planned', icon: <BarChart3 className="w-5 h-5" />, eta: 'Week 6' },
  { id: 30, name: 'Offline Indicator', description: 'Clear network status display', category: 'UI', status: 'planned', icon: <Settings className="w-5 h-5" />, eta: 'Week 2' },
  { id: 31, name: 'PWA Install', description: 'Proper install prompts', category: 'PWA', status: 'planned', icon: <Zap className="w-5 h-5" />, eta: 'Week 2' },
  { id: 32, name: 'Android APK', description: 'Native mobile app with full compiler support', category: 'Mobile', status: 'planned', icon: <Terminal className="w-5 h-5" />, eta: 'Q2 2026' },
];

export default function Roadmap() {
  const [, setLocation] = useLocation();

  const completed = FEATURES.filter(f => f.status === 'completed');
  const inProgress = FEATURES.filter(f => f.status === 'in-progress');
  const planned = FEATURES.filter(f => f.status === 'planned');

  const FeatureCard = ({ feature }: { feature: Feature }) => (
    <Card className="p-4 hover-elevate">
      <div className="flex items-start gap-3">
        <div className={`mt-1 ${
          feature.status === 'completed' ? 'text-green-600 dark:text-green-400' :
          feature.status === 'in-progress' ? 'text-blue-600 dark:text-blue-400' :
          'text-gray-600 dark:text-gray-400'
        }`}>
          {feature.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{feature.name}</h3>
          <p className="text-xs text-secondary mt-1">{feature.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-1 bg-secondary rounded">
              {feature.category}
            </span>
            {feature.eta && (
              <span className="text-xs text-tertiary">{feature.eta}</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="mb-4"
            data-testid="button-back-home"
          >
            ← Back to Home
          </Button>
          <h1 className="text-3xl font-bold mb-2">AindroCode Roadmap</h1>
          <p className="text-secondary">32 features planned & in development</p>
        </div>

        {/* Completed */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h2 className="text-2xl font-bold">✓ Completed ({completed.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completed.map(feature => <FeatureCard key={feature.id} feature={feature} />)}
          </div>
        </div>

        {/* In Progress */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold">⚡ In Progress ({inProgress.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgress.map(feature => <FeatureCard key={feature.id} feature={feature} />)}
          </div>
        </div>

        {/* Planned */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            <h2 className="text-2xl font-bold">📅 Planned ({planned.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {planned.map(feature => <FeatureCard key={feature.id} feature={feature} />)}
          </div>
        </div>

        {/* Summary */}
        <Card className="p-6 bg-secondary">
          <h3 className="font-bold mb-2">Development Timeline</h3>
          <ul className="text-sm space-y-1 text-secondary">
            <li>📦 <strong>Week 2:</strong> UI improvements, offline mode, PWA</li>
            <li>🔧 <strong>Week 3:</strong> Git, LSP, SQL viz, linting, themes</li>
            <li>🛠️ <strong>Week 4:</strong> Database browser, package manager, sharing</li>
            <li>🚀 <strong>Week 5:</strong> REST client, version history, docs gen</li>
            <li>⚙️ <strong>Week 6:</strong> AI completion, test gen, profiler</li>
            <li>📱 <strong>Q2 2026:</strong> Native Android APK with full tooling</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
