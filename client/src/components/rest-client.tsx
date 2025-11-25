import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Send } from "lucide-react";

interface Request {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: string;
  body: string;
}

interface RESTClientProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RESTClient({ open, onOpenChange }: RESTClientProps) {
  const [request, setRequest] = useState<Request>({
    method: 'GET',
    url: '',
    headers: '{}',
    body: '',
  });
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      let headers: Record<string, string> = {};
      try {
        headers = JSON.parse(request.headers);
      } catch {
        setResponse('Error: Invalid JSON in headers field');
        setLoading(false);
        return;
      }
      
      const res = await fetch(request.url, {
        method: request.method,
        headers,
        body: request.body || undefined,
      });
      const data = await res.text();
      setResponse(`${res.status} ${res.statusText}\n\n${data}`);
    } catch (err) {
      setResponse(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-3/4 flex flex-col" data-testid="dialog-rest-client">
        <DialogHeader>
          <DialogTitle>REST API Client (Coming Week 5)</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <div className="flex gap-2">
            <Select value={request.method} onValueChange={(method: any) => setRequest({ ...request, method })}>
              <SelectTrigger className="w-24" data-testid="select-http-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="https://api.example.com/..."
              value={request.url}
              onChange={(e) => setRequest({ ...request, url: e.target.value })}
              data-testid="input-api-url"
            />
            <Button onClick={handleSend} disabled={loading || !request.url} data-testid="button-send-request">
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-hidden flex gap-4">
            <div className="flex-1 flex flex-col">
              <h4 className="text-xs font-semibold mb-2">Headers</h4>
              <Textarea
                placeholder='{"Content-Type": "application/json"}'
                value={request.headers}
                onChange={(e) => setRequest({ ...request, headers: e.target.value })}
                className="flex-1 resize-none"
                data-testid="textarea-headers"
              />
            </div>

            <div className="flex-1 flex flex-col">
              <h4 className="text-xs font-semibold mb-2">Body</h4>
              <Textarea
                placeholder='{"key": "value"}'
                value={request.body}
                onChange={(e) => setRequest({ ...request, body: e.target.value })}
                className="flex-1 resize-none"
                data-testid="textarea-body"
              />
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <h4 className="text-xs font-semibold mb-2">Response</h4>
            <Card className="flex-1 overflow-auto p-3">
              <pre className="text-xs font-mono whitespace-pre-wrap">{response || 'Send a request to see the response...'}</pre>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
