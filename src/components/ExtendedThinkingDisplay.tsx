
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card';

interface ExtendedThinkingDisplayProps {
  thinking: string | null;
}

export function ExtendedThinkingDisplay({ thinking }: ExtendedThinkingDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!thinking) return null;
  
  return (
    <Card className="mt-4 mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center justify-between">
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
            Claude's Thinking Process
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide' : 'Show'}
          </Button>
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="bg-gray-50 p-3 rounded border border-gray-200 max-h-96 overflow-auto">
            <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">
              {thinking}
            </pre>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
