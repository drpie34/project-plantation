
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardContent 
} from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { AIModelIndicator } from '@/components/AIModelIndicator';
import { ExtendedThinkingDisplay } from '@/components/ExtendedThinkingDisplay';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResult {
  id: string;
  content: string;
  model: string;
  extendedThinking: boolean;
  thinking?: string;
}

export default function DocumentAnalysis() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [documentContent, setDocumentContent] = useState<string>('');
  const [analysisType, setAnalysisType] = useState<string>('requirements');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  const handleAnalyze = async () => {
    if (!documentContent.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please enter document content to analyze',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/document-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          userId: user?.id,
          projectId,
          documentContent,
          analysisType
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error analyzing document');
      }
      
      setResult(data.analysis);
      
      toast({
        title: 'Analysis completed',
        description: `Analysis generated with ${data.analysis.model}. ${data.credits_remaining} credits remaining.`,
      });
      
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: 'Analysis failed',
        description: error.message || 'Failed to analyze document',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Document Analysis</h1>
      
      {profile?.subscription_tier === 'premium' && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-md p-4 mb-6">
          <p className="text-blue-700">
            <span className="font-medium">Premium Feature: </span>
            Your plan includes Claude's large context window for analyzing lengthy documents with greater accuracy.
          </p>
        </div>
      )}
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Analyze Document</CardTitle>
            <CardDescription>
              Extract insights from requirements, competitor analysis, or technical documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="whitespace-nowrap text-sm font-medium text-gray-700">
                  Analysis Type:
                </label>
                <Select 
                  value={analysisType}
                  onValueChange={setAnalysisType}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requirements">Requirements Analysis</SelectItem>
                    <SelectItem value="competitive">Competitive Analysis</SelectItem>
                    <SelectItem value="general">General Document Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Content
                </label>
                <Textarea
                  value={documentContent}
                  onChange={(e) => setDocumentContent(e.target.value)}
                  rows={10}
                  placeholder="Paste your document content here..."
                  className="mb-2"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Credits available: {profile?.credits_remaining || 0}
                </p>
                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading || !documentContent.trim()}
                >
                  {isLoading ? 'Analyzing...' : 'Analyze Document'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {result && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>Analysis Results</span>
                <AIModelIndicator 
                  model={result.model} 
                  features={{ extendedThinking: result.extendedThinking }}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.extendedThinking && result.thinking && (
                <ExtendedThinkingDisplay thinking={result.thinking} />
              )}
              
              <div className="prose prose-blue max-w-none">
                <div className="whitespace-pre-wrap">
                  {result.content}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={() => setResult(null)}>
                  Analyze Another Document
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
