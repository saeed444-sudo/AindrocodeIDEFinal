import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

interface HTMLPreviewProps {
  html: string;
  onClose: () => void;
}

export function HTMLPreview({ html, onClose }: HTMLPreviewProps) {
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (iframeRef) {
      iframeRef.srcdoc = html;
    }
  }, [html, iframeRef]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-950 rounded-lg shadow-2xl w-full max-w-4xl h-96 flex flex-col">
        <div className="h-10 flex items-center justify-between px-4 border-b bg-background">
          <span className="text-sm font-medium">HTML Preview</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
        </div>
        <iframe
          ref={setIframeRef}
          className="flex-1 w-full border-0"
          title="HTML Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
