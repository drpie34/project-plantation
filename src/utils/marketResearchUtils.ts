
import { callApiGateway } from '@/utils/apiGateway';

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
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/market-research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(params),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error conducting market research');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error conducting market research:', error);
    throw error;
  }
}
