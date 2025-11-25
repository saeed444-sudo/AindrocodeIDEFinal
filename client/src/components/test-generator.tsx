import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Zap } from "lucide-react";
import { useState } from "react";

interface TestGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
  language: string;
}

export function TestGenerator({ open, onOpenChange, code, language }: TestGeneratorProps) {
  const [tests, setTests] = useState<string>("");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    // Simulate AI test generation
    setTimeout(() => {
      if (language === "python") {
        setTests(`import unittest

class TestMyFunction(unittest.TestCase):
    def test_basic(self):
        result = my_function()
        self.assertIsNotNone(result)
    
    def test_empty_input(self):
        result = my_function("")
        self.assertEqual(result, "")

if __name__ == '__main__':
    unittest.main()`);
      } else if (language === "javascript") {
        setTests(`describe('myFunction', () => {
  it('should return a value', () => {
    const result = myFunction();
    expect(result).toBeDefined();
  });

  it('should handle empty input', () => {
    const result = myFunction("");
    expect(result).toBe("");
  });
});`);
      }
      setGenerating(false);
    }, 1000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(tests);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-3/4 flex flex-col" data-testid="dialog-test-generator">
        <DialogHeader>
          <DialogTitle>Test Generator (Week 6)</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={generating || !code.trim()}
              data-testid="button-generate-tests"
            >
              <Zap className="w-4 h-4 mr-2" />
              {generating ? "Generating..." : "Generate Tests"}
            </Button>
            {tests && (
              <Button
                variant="outline"
                onClick={handleCopy}
                data-testid="button-copy-tests"
              >
                <Copy className="w-4 h-4" />
              </Button>
            )}
          </div>

          {tests && (
            <ScrollArea className="flex-1">
              <pre className="text-xs font-mono p-4 bg-secondary rounded overflow-x-auto">
                {tests}
              </pre>
            </ScrollArea>
          )}

          {!tests && (
            <Card className="flex-1 flex items-center justify-center">
              <p className="text-secondary text-sm">Click "Generate Tests" to create test cases</p>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
