
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { conductMarketResearch, MarketResearchResponse } from '@/utils/marketResearchUtils';
import { supabase } from '@/integrations/supabase/client';

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
  const [defaultQuery, setDefaultQuery] = useState<string>('');
  const { user } = useAuth();

  // Function to load idea details when an ideaId is provided
  const loadIdeaDetails = async (ideaId: string) => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', ideaId)
        .single();

      if (error) throw error;
      
      if (data) {
        // Create a comprehensive research query based on idea details
        let query = `Conduct market research for a SaaS product with the following details:
        
Title: ${data.title}
Description: ${data.description || 'Not provided'}
Problem Solved: ${data.problem_solved || 'Not provided'}
Target Audience: ${data.target_audience || 'Not provided'}
Tags: ${data.tags?.join(', ') || 'None'}

Please analyze the market potential, competitive landscape, and target customer needs for this SaaS idea.`;

        setDefaultQuery(query);
      }
    } catch (err) {
      console.error('Error loading idea details for research:', err);
    }
  };

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
    reset: () => setResult(null),
    defaultQuery,
    loadIdeaDetails
  };
};
