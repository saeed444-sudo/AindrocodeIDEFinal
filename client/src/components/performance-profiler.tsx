import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

interface PerformanceMetric {
  name: string;
  duration: number;
  percentage: number;
}

interface PerformanceProfilerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PerformanceProfiler({ open, onOpenChange }: PerformanceProfilerProps) {
  const metrics: PerformanceMetric[] = [
    { name: "Script Execution", duration: 234, percentage: 45 },
    { name: "DOM Rendering", duration: 156, percentage: 30 },
    { name: "Style Calculation", duration: 98, percentage: 19 },
    { name: "Layout Reflow", duration: 32, percentage: 6 },
  ];

  const totalTime = metrics.reduce((sum, m) => sum + m.duration, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-performance-profiler">
        <DialogHeader>
          <DialogTitle>Performance Profiler (Week 6)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="p-4">
            <h4 className="font-semibold text-sm mb-3">Execution Time Breakdown</h4>
            <div className="space-y-3">
              {metrics.map((metric) => (
                <div key={metric.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <Badge variant="outline">{metric.duration}ms ({metric.percentage}%)</Badge>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all"
                      style={{ width: `${metric.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 bg-blue-50 dark:bg-blue-950">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <div>
                <p className="font-semibold text-sm">Total Time: {totalTime}ms</p>
                <p className="text-xs text-secondary">Performance analysis for current execution</p>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
