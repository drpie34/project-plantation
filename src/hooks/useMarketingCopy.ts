
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  generateMarketingCopy, 
  saveMarketingCopy, 
  trackMarketingActivity,
  MarketingCopyParams,
  MarketingCopyResponse 
} from '@/utils/marketingUtils';

type ContentType = 'landing' | 'email' | 'social' | 'ads';
type Tonality = 'professional' | 'friendly' | 'technical' | 'creative' | 'minimal';

interface FormData {
  productName: string;
  description: string;
  targetAudience: string;
  keyFeatures: string;
  tonality: Tonality;
  contentType: ContentType;
}

export const useMarketingCopy = (projectId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<MarketingCopyResponse | null>(null);
  const { user } = useAuth();

  const generateCopy = async (formData: FormData) => {
    if (!user?.id || !projectId || !formData.productName || !formData.description) {
      setError('Please fill in the required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params: MarketingCopyParams = {
        userId: user.id,
        projectId,
        productName: formData.productName,
        description: formData.description,
        targetAudience: formData.targetAudience || undefined,
        keyFeatures: formData.keyFeatures || undefined,
        tonality: formData.tonality,
        contentType: formData.contentType
      };

      const result = await generateMarketingCopy(params);
      setGeneratedContent(result);
      
      // Track the event
      await trackMarketingActivity(user.id, projectId, 'generated_marketing_copy', {
        content_type: formData.contentType
      });
      
      return result;
    } catch (error: any) {
      setError(error.message || 'Failed to generate marketing copy');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const saveCopy = async (title: string) => {
    if (!user?.id || !projectId || !generatedContent || !title.trim()) {
      setError('Missing information required to save copy');
      return;
    }

    try {
      const savedCopy = await saveMarketingCopy({
        userId: user.id,
        projectId,
        title,
        content: generatedContent.text,
        contentType: generatedContent.model,
        modelUsed: generatedContent.model
      });
      
      // Track the save event
      await trackMarketingActivity(user.id, projectId, 'saved_marketing_copy', {
        copy_id: savedCopy.id,
        title
      });
      
      return savedCopy;
    } catch (error: any) {
      console.error('Error saving marketing copy:', error);
      setError(error.message || 'Failed to save marketing copy');
      throw error;
    }
  };

  return {
    generateCopy,
    saveCopy,
    isLoading,
    error,
    generatedContent,
    setError,
    reset: () => {
      setGeneratedContent(null);
      setError(null);
    }
  };
};
