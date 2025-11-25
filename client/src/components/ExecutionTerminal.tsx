// Execution Terminal - Output display for RunnerManager
import { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

interface ExecutionTerminalProps {
  isRunning: boolean;
  output: string[];
  errors: string[];
}

export function ExecutionTerminal({ isRunning, output, errors }: ExecutionTerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output, errors]);

  return (
    <Card className="bg-[#1e1e1e] text-green-400 font-mono text-sm h-48 overflow-hidden">
      <ScrollArea className="h-full w-full p-4">
        <div className="space-y-1">
          {output.map((line, i) => (
            <div key={`out-${i}`} className="text-green-400">
              {line}
            </div>
          ))}
          {errors.map((line, i) => (
            <div key={`err-${i}`} className="text-red-400">
              {line}
            </div>
          ))}
          {isRunning && (
            <div className="text-yellow-400 animate-pulse">Running...</div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
    </Card>
  );
}
