import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMarketResearch } from '@/hooks/useMarketResearch';
import MarketResearchTabs from '@/components/MarketResearch/MarketResearchTabs';
import MarketResearchDocument from '@/components/MarketResearch/MarketResearchDocument';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRightIcon } from 'lucide-react';

export default function MarketResearch() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const ideaId = searchParams.get('ideaId');
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [documentContent, setDocumentContent] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const { loadIdeaDetails } = useMarketResearch(projectId || '');
  
  // Load idea details when ideaId is provided
  useEffect(() => {
    if (ideaId) {
      console.log('MarketResearch: Loading idea details for ideaId:', ideaId);
      loadIdeaDetails(ideaId);
    }
  }, [ideaId, loadIdeaDetails]);
  
  // Handle document update from tabs component
  const handleUpdateDocument = (content: string) => {
    setDocumentContent(content);
    setLastUpdated(new Date());
  };
  
  // Navigate to project planning
  const handleProceedToPlanning = () => {
    if (projectId) {
      navigate(`/projects/${projectId}/planning`);
    } else {
      // If no project yet, start project formation from this research
      navigate(`/projects/formation?ideaId=${ideaId}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      {profile?.subscription_tier === 'premium' && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-700">
            <span className="font-medium">Premium Feature: </span>
            Your plan includes enhanced market research capabilities with web search integration.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MarketResearchTabs 
            projectId={projectId || ''} 
            ideaId={ideaId || undefined}
            onUpdateDocument={handleUpdateDocument}
          />
        </div>
        
        <div className="lg:col-span-1">
          {documentContent ? (
            <MarketResearchDocument 
              content={documentContent} 
              lastUpdated={lastUpdated}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Research Document</CardTitle>
                <CardDescription>
                  Your market research document will appear here as you generate or edit content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border border-dashed rounded-md p-8 text-center text-gray-500">
                  <p>Generate content using the research tabs to populate this document.</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>
                Continue your project journey with these options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full justify-between"
                variant="outline"
                onClick={handleProceedToPlanning}
              >
                <span>Proceed to Project Planning</span>
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
              
              <Button 
                className="w-full justify-between"
                variant="outline"
                onClick={() => navigate('/ideas')}
              >
                <span>Return to Ideas Hub</span>
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}