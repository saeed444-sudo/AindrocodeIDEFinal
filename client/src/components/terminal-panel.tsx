import { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "@xterm/xterm/css/xterm.css";
import { PlayIcon, StopIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";

interface TerminalPanelProps {
  onClose: () => void;
  onRun: (command: string) => void;
  onStop: () => void;
  isRunning?: boolean;
}

export function TerminalPanel({
  onClose,
  onRun,
  onStop,
  isRunning = false,
}: TerminalPanelProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { effectiveTheme } = useTheme();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!terminalRef.current || isInitialized) return;

    const xterm = new XTerm({
      fontFamily: "JetBrains Mono, Fira Code, monospace",
      fontSize: 13,
      theme: {
        background: effectiveTheme === "dark" ? "#0a0a0a" : "#ffffff",
        foreground: effectiveTheme === "dark" ? "#d4d4d4" : "#1e1e1e",
        cursor: effectiveTheme === "dark" ? "#d4d4d4" : "#1e1e1e",
        black: effectiveTheme === "dark" ? "#000000" : "#000000",
        brightBlack: effectiveTheme === "dark" ? "#666666" : "#666666",
        red: "#cd3131",
        brightRed: "#f14c4c",
        green: "#0dbc79",
        brightGreen: "#23d18b",
        yellow: "#e5e510",
        brightYellow: "#f5f543",
        blue: "#2472c8",
        brightBlue: "#3b8eea",
        magenta: "#bc3fbc",
        brightMagenta: "#d670d6",
        cyan: "#11a8cd",
        brightCyan: "#29b8db",
        white: "#e5e5e5",
        brightWhite: "#ffffff",
      },
      cursorBlink: true,
      convertEol: true,
      scrollback: 1000,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    xterm.loadAddon(fitAddon);
    xterm.loadAddon(webLinksAddon);

    xterm.open(terminalRef.current);
    
    // Defer fit to ensure DOM is ready
    setTimeout(() => {
      try {
        fitAddon.fit();
      } catch (e) {
        console.log("Terminal fit deferred");
      }
    }, 100);

    xterm.writeln("AindroCode Terminal");
    xterm.writeln("Ready to run your code...\r\n");

    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;
    setIsInitialized(true);

    const handleResize = () => {
      try {
        fitAddon?.fit();
      } catch (e) {
        // Ignore fit errors during resize
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      xterm.dispose();
    };
  }, [effectiveTheme, isInitialized]);

  useEffect(() => {
    if (xtermRef.current) {
      const theme = {
        background: effectiveTheme === "dark" ? "#0a0a0a" : "#ffffff",
        foreground: effectiveTheme === "dark" ? "#d4d4d4" : "#1e1e1e",
        cursor: effectiveTheme === "dark" ? "#d4d4d4" : "#1e1e1e",
      };
      xtermRef.current.options.theme = theme;
    }
  }, [effectiveTheme]);

  const handleClear = () => {
    if (xtermRef.current) {
      xtermRef.current.clear();
    }
  };

  const writeToTerminal = (text: string, type: "stdout" | "stderr" = "stdout") => {
    if (xtermRef.current) {
      if (type === "stderr") {
        xtermRef.current.write(`\x1b[31m${text}\x1b[0m`);
      } else {
        xtermRef.current.write(text);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border-t">
      <div className="h-10 flex items-center justify-between px-4 border-b bg-background">
        <span className="text-sm font-medium">Terminal</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleClear}
            data-testid="button-clear-terminal"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
          {isRunning ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onStop}
              data-testid="button-stop-run"
            >
              <StopIcon className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onRun("")}
              data-testid="button-run-code"
            >
              <PlayIcon className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClose}
            data-testid="button-close-terminal"
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div ref={terminalRef} className="flex-1 p-3" data-testid="terminal-container" />
    </div>
  );
}

// Export writeToTerminal as a method that can be called from outside
export type TerminalHandle = {
  write: (text: string, type?: "stdout" | "stderr") => void;
  clear: () => void;
};
