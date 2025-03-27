
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import { useMarketResearch } from '@/hooks/useMarketResearch';

export default function MarketResearch() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const ideaId = searchParams.get('ideaId');
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [query, setQuery] = useState<string>('');
  
  const {
    conductResearch,
    isLoading,
    result,
    creditsRemaining,
    reset,
    defaultQuery,
    loadIdeaDetails
  } = useMarketResearch(projectId || '');
  
  // Load idea details when ideaId is provided
  useEffect(() => {
    if (ideaId) {
      console.log('MarketResearch: Loading idea details for ideaId:', ideaId);
      loadIdeaDetails(ideaId);
    }
  }, [ideaId, loadIdeaDetails]);

  // Set the query when defaultQuery changes
  useEffect(() => {
    if (defaultQuery) {
      console.log('MarketResearch: Setting default query:', defaultQuery);
      setQuery(defaultQuery);
    }
  }, [defaultQuery]);
  
  const handleResearch = async () => {
    if (!query.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please enter a research query',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await conductResearch(query);
      
      toast({
        title: 'Research completed',
        description: `Research generated successfully. ${creditsRemaining} credits remaining.`,
      });
    } catch (error: any) {
      toast({
        title: 'Research failed',
        description: error.message || 'Failed to conduct market research',
        variant: 'destructive',
      });
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
                  rows={6}
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
                <Button variant="outline" onClick={() => reset()}>
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
