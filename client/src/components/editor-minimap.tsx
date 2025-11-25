import { useEffect, useRef } from "react";

interface EditorMinimapProps {
  code: string;
  scrollPercentage: number;
}

export function EditorMinimap({ code, scrollPercentage }: EditorMinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const lines = code.split("\n");

    ctx.fillStyle = "hsl(var(--card))";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "hsl(var(--primary))";
    const lineHeight = Math.max(1, height / lines.length);

    lines.forEach((line, idx) => {
      const charCount = Math.min(line.length / 10, width);
      ctx.fillRect(0, idx * lineHeight, charCount, lineHeight);
    });

    // Draw viewport indicator
    ctx.strokeStyle = "hsl(var(--primary) / 0.5)";
    ctx.lineWidth = 2;
    const viewHeight = Math.max(20, height * 0.1);
    ctx.strokeRect(0, scrollPercentage * (height - viewHeight), width, viewHeight);
  }, [code, scrollPercentage]);

  return (
    <canvas
      ref={canvasRef}
      width={40}
      height={300}
      className="border-l bg-card cursor-pointer hover:bg-secondary/50 transition-colors"
      data-testid="canvas-minimap"
      title="Code minimap - click to jump"
    />
  );
}
