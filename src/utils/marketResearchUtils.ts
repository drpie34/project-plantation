
import { supabase } from '@/integrations/supabase/client';

export type MarketResearchParams = {
  userId: string;
  projectId: string;
  query: string;
  source?: string;
};

export type MarketResearchResponse = {
  success: boolean;
  research: {
    id: string;
    ai_analysis: string;
    model_used: string;
    raw_data: {
      webSearch: boolean;
      model: string;
      usage: any;
    };
  };
  credits_remaining: number;
};

export async function conductMarketResearch(params: MarketResearchParams): Promise<MarketResearchResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('market-research', {
      body: params
    });
    
    if (error) {
      console.error('Market research API error:', error);
      throw new Error(error.message || 'Error conducting market research');
    }
    
    if (!data) {
      throw new Error('Empty response from market research API');
    }
    
    return data as MarketResearchResponse;
  } catch (error: any) {
    console.error('Error conducting market research:', error);
    throw new Error(error.message || 'Failed to conduct market research');
  }
}
