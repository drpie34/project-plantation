
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { callApiGateway } from '@/utils/apiGateway';
import { parseIdeasFromAIContent } from '@/utils/ideaParser';
import { User } from '@/types/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface UseIdeaGenerationProps {
  projectId: string;
  user: SupabaseUser | null;
  profile: User | null;
}

export const useIdeaGeneration = ({ projectId, user, profile }: UseIdeaGenerationProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Helper function to build the AI prompt
  const buildIdeaGenerationPrompt = (industry: string, interests?: string) => {
    return `Generate 3 innovative SaaS ideas for the ${industry} industry.
    ${interests ? `Focus areas or interests: ${interests}` : ''}
    
    For each idea, provide:
    1. A catchy title
    2. A brief description (2-3 sentences)
    3. The target audience
    4. The main problem it solves
    5. 3-5 key features
    6. A potential revenue model
    
    Format each idea EXACTLY with these headers:
    
    ## Idea 1: [TITLE]
    Description: [DESCRIPTION]
    Target Audience: [TARGET]
    Problem: [PROBLEM]
    Key Features:
    - [FEATURE 1]
    - [FEATURE 2]
    - [FEATURE 3]
    Revenue Model: [REVENUE MODEL]
    
    ## Idea 2: [TITLE]
    Description: [DESCRIPTION]
    Target Audience: [TARGET]
    Problem: [PROBLEM]
    Key Features:
    - [FEATURE 1]
    - [FEATURE 2]
    - [FEATURE 3]
    Revenue Model: [REVENUE MODEL]
    
    ## Idea 3: [TITLE]
    Description: [DESCRIPTION]
    Target Audience: [TARGET]
    Problem: [PROBLEM]
    Key Features:
    - [FEATURE 1]
    - [FEATURE 2]
    - [FEATURE 3]
    Revenue Model: [REVENUE MODEL]`;
  };
  
  // Helper function to save API usage and update credits
  const saveApiUsageAndUpdateCredits = async (userId: string, currentCredits: number, usage: any) => {
    await supabase
      .from('api_usage')
      .insert({
        user_id: userId,
        api_type: usage.api,
        model_used: usage.model,
        tokens_input: usage.inputTokens,
        tokens_output: usage.outputTokens,
        credits_used: usage.creditCost || 5,
        timestamp: new Date().toISOString()
      });
    
    const creditCost = usage.creditCost || 5;
    await supabase
      .from('users')
      .update({ 
        credits_remaining: currentCredits - creditCost 
      })
      .eq('id', userId);
  };

  const generateIdeas = async (industry: string, interests: string) => {
    if (!user || !projectId || !profile) {
      toast({
        title: 'Error',
        description: 'You must be logged in with a valid profile',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const prompt = buildIdeaGenerationPrompt(industry, interests);
      console.log("Sending prompt to AI:", prompt);
      
      const result = await callApiGateway('check-ai-router', {
        task: 'ideaGeneration',
        content: prompt,
        userTier: profile.subscription_tier || 'free',
        options: {
          systemPrompt: 'You are an expert in SaaS business models and startup ideas. Generate innovative, practical SaaS ideas based on the industry specified. Follow the exact formatting instructions provided by the user.',
          temperature: 0.7
        }
      });
      
      if (!result || !result.content) {
        throw new Error('Failed to generate ideas');
      }
      
      console.log("AI response:", result.content);
      
      const parsedIdeas = parseIdeasFromAIContent(result.content);
      
      console.log("Parsed ideas:", parsedIdeas);
      
      if (parsedIdeas.length === 0) {
        console.log("Parsing failed, creating fallback idea with raw content");
        
        await supabase
          .from('ideas')
          .insert({
            project_id: projectId,
            title: 'AI Generated Ideas (Raw)',
            description: 'The parser could not structure this content. Here is the raw output:',
            target_audience: '',
            problem_solved: '',
            ai_generated_data: {
              raw_content: result.content,
              parsing_failed: true
            }
          });
          
        toast({
          title: 'Partial Success',
          description: 'Ideas generated but could not be fully structured. Saved raw output.',
          variant: 'default',
        });
        
        await saveApiUsageAndUpdateCredits(user.id, profile.credits_remaining, result.usage);
        
        navigate(`/projects/${projectId}`);
        return;
      }
      
      // Save each parsed idea to the database
      for (const idea of parsedIdeas) {
        await supabase
          .from('ideas')
          .insert({
            project_id: projectId,
            title: idea.title || 'Untitled Idea',
            description: idea.description || 'No description provided',
            target_audience: idea.target_audience || '',
            problem_solved: idea.problem_solved || '',
            ai_generated_data: {
              key_features: idea.ai_generated_data.key_features || [],
              revenue_model: idea.ai_generated_data.revenue_model || ''
            }
          });
      }
      
      await saveApiUsageAndUpdateCredits(user.id, profile.credits_remaining, result.usage);
      
      toast({
        title: 'Success',
        description: `${parsedIdeas.length} ideas generated successfully`,
      });
      
      navigate(`/projects/${projectId}`);
    } catch (error: any) {
      console.error('Error generating ideas:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate ideas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    generateIdeas
  };
};
