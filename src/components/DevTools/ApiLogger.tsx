import { useState, useEffect } from 'react';
import { apiLogStore, ApiLogEntry } from '@/utils/apiGateway';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, X, Copy, RefreshCw, Terminal } from 'lucide-react';

function formatDuration(ms: number | undefined): string {
  if (ms === undefined) return 'N/A';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatTokens(tokens: number | undefined): string {
  if (tokens === undefined) return 'N/A';
  return tokens.toLocaleString();
}

function formatTimestamp(date: Date): string {
  return date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

// Component to display a single log entry
function LogEntry({ log }: { log: ApiLogEntry }) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusBadge = () => {
    if (log.error) {
      return <Badge variant="destructive">Error</Badge>;
    }
    if (log.isMock) {
      return <Badge variant="outline">Mocked</Badge>;
    }
    if (log.response) {
      return <Badge variant="success" className="bg-green-100 text-green-800">Success</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  const getModelBadge = () => {
    if (!log.model) return null;
    
    let color = 'bg-gray-100 text-gray-800';
    if (log.api === 'openai' && log.model.includes('gpt-4o')) {
      color = 'bg-green-100 text-green-800';
    } else if (log.api === 'claude') {
      color = 'bg-purple-100 text-purple-800';
    }
    
    return <Badge className={color}>{log.model}</Badge>;
  };

  return (
    <Card className="mb-3 hover:shadow-sm transition-shadow">
      <CardHeader className="py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <span className="font-medium">{log.action}</span>
            {getModelBadge()}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{formatTimestamp(log.timestamp)}</span>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <CardContent className="py-0">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Request</h4>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-96 whitespace-pre-wrap">
                  {JSON.stringify(log.requestPayload, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Response</h4>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-96 whitespace-pre-wrap">
                  {log.response 
                    ? JSON.stringify(log.response, null, 2) 
                    : log.error 
                      ? JSON.stringify(log.error, null, 2)
                      : 'Pending...'}
                </pre>
              </div>
            </div>
          </CardContent>
          <CardFooter className="py-2 text-xs text-gray-500 flex justify-between">
            <div>
              Duration: {formatDuration(log.duration)}
            </div>
            {log.tokens && (
              <div>
                Tokens: {formatTokens(log.tokens.input)} in / {formatTokens(log.tokens.output)} out
              </div>
            )}
          </CardFooter>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default function ApiLogger() {
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);
  const [isLoggingEnabled, setIsLoggingEnabled] = useState(apiLogStore.isLoggingEnabled());

  // Subscribe to log store updates
  useEffect(() => {
    setLogs(apiLogStore.getLogs());
    setIsLoggingEnabled(apiLogStore.isLoggingEnabled());
    
    const unsubscribe = apiLogStore.subscribe(() => {
      setLogs(apiLogStore.getLogs());
      setIsLoggingEnabled(apiLogStore.isLoggingEnabled());
    });
    
    return unsubscribe;
  }, []);

  // Toggle logging
  const toggleLogging = () => {
    apiLogStore.enableLogging(!isLoggingEnabled);
  };

  // Clear logs
  const clearLogs = () => {
    apiLogStore.clearLogs();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Terminal size={20} /> AI API Logger
            </CardTitle>
            <CardDescription>
              Monitor and debug AI API calls
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="logging-enabled" 
                checked={isLoggingEnabled}
                onCheckedChange={toggleLogging}
              />
              <Label htmlFor="logging-enabled">Logging {isLoggingEnabled ? 'Enabled' : 'Disabled'}</Label>
            </div>
            <Button variant="outline" size="sm" onClick={clearLogs}>
              Clear Logs
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {isLoggingEnabled 
              ? "No API calls have been logged yet. Enable logging and make some requests to see logs appear here."
              : "Logging is currently disabled. Enable logging to capture API calls."}
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            {logs.map(log => (
              <LogEntry key={log.id} log={log} />
            ))}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}