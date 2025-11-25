import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, FileText, Zap } from "lucide-react";
import { useState } from "react";

interface DocumentationGenProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
  language: string;
}

export function DocumentationGen({ open, onOpenChange, code, language }: DocumentationGenProps) {
  const [documentation, setDocumentation] = useState<string>("");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    setTimeout(() => {
      if (language === "python") {
        setDocumentation(`"""
Module documentation for myFunction.

This module provides utility functions for data processing
and transformation operations.

Functions:
    myFunction(param1, param2): Process and return transformed data
    helperFunction(): Internal helper function

Attributes:
    DEBUG (bool): Enable debug mode

Example:
    >>> from mymodule import myFunction
    >>> result = myFunction("input", 42)
    >>> print(result)
"""`);
      } else {
        setDocumentation(`/**
 * Process and transform the input data.
 * 
 * @param {string} param1 - First parameter description
 * @param {number} param2 - Second parameter description
 * @returns {Object} Transformed data object
 * 
 * @example
 * const result = myFunction("input", 42);
 * console.log(result);
 * 
 * @throws {Error} If parameters are invalid
 */`);
      }
      setGenerating(false);
    }, 1000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(documentation);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-3/4 flex flex-col" data-testid="dialog-documentation-gen">
        <DialogHeader>
          <DialogTitle>Documentation Generator (Week 5)</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={generating || !code.trim()}
              data-testid="button-generate-docs"
            >
              <Zap className="w-4 h-4 mr-2" />
              {generating ? "Generating..." : "Generate Docs"}
            </Button>
            {documentation && (
              <Button
                variant="outline"
                onClick={handleCopy}
                data-testid="button-copy-docs"
              >
                <Copy className="w-4 h-4" />
              </Button>
            )}
          </div>

          {documentation && (
            <ScrollArea className="flex-1">
              <pre className="text-xs font-mono p-4 bg-secondary rounded overflow-x-auto">
                {documentation}
              </pre>
            </ScrollArea>
          )}

          {!documentation && (
            <Card className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-secondary text-sm">Generate automatic documentation</p>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
