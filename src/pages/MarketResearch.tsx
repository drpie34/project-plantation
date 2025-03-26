
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardContent 
} from '@/components/ui/card';
import { AIModelIndicator } from '@/components/AIModelIndicator';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function MarketResearch() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  
  const handleResearch = async () => {
    if (!query.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please enter a research query',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/market-research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          userId: user?.id,
          projectId,
          query,
          source: 'custom'
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error conducting market research');
      }
      
      setResult({
        id: data.research.id,
        content: data.research.ai_analysis,
        model: data.research.model_used,
        webSearch: data.research.raw_data?.webSearch
      });
      
      toast({
        title: 'Research completed',
        description: `Research generated with ${data.research.model_used}. ${data.credits_remaining} credits remaining.`,
      });
      
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: 'Research failed',
        description: error.message || 'Failed to conduct market research',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Market Research</h1>
      
      {profile?.subscription_tier === 'premium' && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-md p-4 mb-6">
          <p className="text-blue-700">
            <span className="font-medium">Premium Feature: </span>
            Your plan includes enhanced market research capabilities with web search integration.
          </p>
        </div>
      )}
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Conduct Market Research</CardTitle>
            <CardDescription>
              Research market trends, competition, and opportunities for your SaaS idea
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Research Query
                </label>
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  rows={4}
                  placeholder="What would you like to research? E.g., 'Market size and trends for project management tools in small businesses'"
                  className="mb-2"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Credits available: {profile?.credits_remaining || 0}
                </p>
                <Button
                  onClick={handleResearch}
                  disabled={isLoading || !query.trim()}
                >
                  {isLoading ? 'Researching...' : 'Conduct Research'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {result && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>Research Results</span>
                <AIModelIndicator 
                  model={result.model} 
                  features={{ webSearch: result.webSearch }}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-blue max-w-none">
                <div className="whitespace-pre-wrap">
                  {result.content}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={() => setResult(null)}>
                  Conduct New Research
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
