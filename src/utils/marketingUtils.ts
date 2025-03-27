
import { supabase } from '@/integrations/supabase/client';
import { callApiGateway } from '@/utils/apiGateway';
import { useToast } from '@/hooks/use-toast';

export type MarketingCopyParams = {
  userId: string;
  projectId: string;
  productName: string;
  description: string;
  targetAudience?: string;
  keyFeatures?: string;
  tonality: 'professional' | 'friendly' | 'technical' | 'creative' | 'minimal';
  contentType: 'landing' | 'email' | 'social' | 'ads';
};

export type MarketingCopyResponse = {
  text: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    model: string;
  };
};

export async function generateMarketingCopy(params: MarketingCopyParams): Promise<MarketingCopyResponse> {
  try {
    const result = await callApiGateway<{content: MarketingCopyResponse}>('generateMarketingCopy', params);
    
    return result.content;
  } catch (error) {
    console.error('Error generating marketing copy:', error);
    throw new Error('Failed to generate marketing copy');
  }
}

export async function saveMarketingCopy({
  userId,
  projectId,
  title,
  content,
  contentType,
  modelUsed
}: {
  userId: string;
  projectId: string;
  title: string;
  content: string;
  contentType: string;
  modelUsed?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('marketing_copies')
      .insert({
        user_id: userId,
        project_id: projectId,
        title,
        content,
        content_type: contentType,
        model_used: modelUsed
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error saving marketing copy:', error);
    throw new Error('Failed to save marketing copy');
  }
}

export async function trackMarketingActivity(
  userId: string,
  projectId: string,
  activity: string,
  details: Record<string, any> = {}
) {
  try {
    await callApiGateway('trackActivity', {
      user_id: userId,
      activity_type: activity,
      entity_type: 'project',
      entity_id: projectId,
      details
    });
  } catch (error) {
    console.error('Error tracking activity:', error);
    // Don't throw here - we don't want to block the UI if tracking fails
  }
}
