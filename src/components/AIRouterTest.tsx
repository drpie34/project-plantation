
import { useState } from 'react';
import { callApiGateway } from '@/utils/apiGateway';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function AIRouterTest() {
  const [prompt, setPrompt] = useState('Hello AI Router! How are you today?');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const userTier = profile?.subscription_tier || 'free';
  const { toast } = useToast();

  const testAIRouter = async () => {
    setLoading(true);
    try {
      const result = await callApiGateway('check-ai-router', {
        task: 'basicChat',
        content: prompt,
        userTier: userTier,
        options: {
          systemPrompt: 'You are a helpful assistant specialized in SaaS and entrepreneurship.'
        }
      });
      
      setResponse(result);
      toast({
        title: 'AI Router Response',
        description: 'Successfully connected to the AI Router',
      });
    } catch (error) {
      console.error('Error testing AI Router:', error);
      toast({
        title: 'AI Router Error',
        description: error instanceof Error ? error.message : 'Failed to connect to AI Router',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>AI Router Test</CardTitle>
        <CardDescription>
          Test the AI Router functionality by sending a prompt
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Your Prompt</label>
          <Textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            className="min-h-[100px]"
          />
        </div>
        
        <div className="text-sm text-muted-foreground">
          Using subscription tier: <span className="font-semibold">{userTier}</span>
        </div>
        
        {response && (
          <Alert>
            <AlertTitle>AI Response</AlertTitle>
            <AlertDescription className="mt-2 whitespace-pre-wrap">
              {response.content}
              
              {response.usage && (
                <div className="mt-4 pt-2 border-t text-xs text-muted-foreground">
                  <div>Model: {response.usage.model}</div>
                  <div>Input tokens: {response.usage.inputTokens}</div>
                  <div>Output tokens: {response.usage.outputTokens}</div>
                  <div>Credits used: {response.usage.creditCost || 'N/A'}</div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={testAIRouter} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing AI Router...
            </>
          ) : 'Test AI Router'}
        </Button>
      </CardFooter>
    </Card>
  );
}
