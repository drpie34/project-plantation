
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { conductMarketResearch, MarketResearchResponse } from '@/utils/marketResearchUtils';

export const useMarketResearch = (projectId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    id: string;
    content: string;
    model: string;
    webSearch: boolean;
  } | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const { user } = useAuth();

  const conductResearch = async (query: string) => {
    if (!user?.id || !projectId || !query.trim()) {
      setError('Missing required information');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data: MarketResearchResponse = await conductMarketResearch({
        userId: user.id,
        projectId,
        query,
        source: 'custom'
      });

      setResult({
        id: data.research.id,
        content: data.research.ai_analysis,
        model: data.research.model_used,
        webSearch: data.research.raw_data?.webSearch || false
      });
      
      setCreditsRemaining(data.credits_remaining);
      
      return data;
    } catch (error: any) {
      setError(error.message || 'Failed to conduct market research');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    conductResearch,
    isLoading,
    error,
    result,
    creditsRemaining,
    reset: () => setResult(null)
  };
};
