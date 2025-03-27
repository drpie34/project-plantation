
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { analyzeDocument, DocumentAnalysisResponse } from '@/utils/documentAnalysisUtils';

export interface AnalysisResult {
  id: string;
  content: string;
  model: string;
  extendedThinking: boolean;
  thinking?: string;
}

export const useDocumentAnalysis = (projectId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const { user } = useAuth();

  const analyzeContent = async (
    documentContent: string, 
    analysisType: 'requirements' | 'competitive' | 'general' = 'general'
  ) => {
    if (!user?.id || !projectId || !documentContent.trim()) {
      setError('Missing required information');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data: DocumentAnalysisResponse = await analyzeDocument({
        userId: user.id,
        projectId,
        documentContent,
        analysisType
      });

      setResult(data.analysis);
      setCreditsRemaining(data.credits_remaining);
      
      return data;
    } catch (error: any) {
      setError(error.message || 'Failed to analyze document');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    analyzeContent,
    isLoading,
    error,
    result,
    creditsRemaining,
    reset: () => setResult(null)
  };
};
