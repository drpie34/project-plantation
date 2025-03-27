
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { generateProjectPlan, ProjectPlanningResponse } from '@/utils/projectPlanningUtils';
import { supabase } from '@/integrations/supabase/client';

export interface PlanResult {
  content: string;
  model: string;
  thinking: string | null;
  extendedThinking: boolean;
}

export const useProjectPlanning = (projectId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PlanResult | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [defaultRequirements, setDefaultRequirements] = useState<string>('');
  const { user } = useAuth();

  // Function to load idea details when an ideaId is provided
  const loadIdeaDetails = async (ideaId: string) => {
    console.log('Loading idea details for project planning:', ideaId);
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', ideaId)
        .single();

      if (error) throw error;
      
      console.log('Loaded idea details:', data);
      
      if (data) {
        // Create a comprehensive planning requirements based on idea details
        let requirements = `Create a detailed project plan for the following SaaS product:
        
Title: ${data.title}
Description: ${data.description || 'Not provided'}
Problem Solved: ${data.problem_solved || 'Not provided'}
Target Audience: ${data.target_audience || 'Not provided'}
Tags: ${data.tags?.join(', ') || 'None'}

${data.ai_generated_data?.key_features ? 
  `Key Features:
${data.ai_generated_data.key_features.map((feature: string) => `- ${feature}`).join('\n')}` 
  : ''}

${data.ai_generated_data?.revenue_model ? 
  `Revenue Model: ${data.ai_generated_data.revenue_model}` 
  : ''}

Please provide a comprehensive project plan including timeline, required resources, and technical considerations.`;

        setDefaultRequirements(requirements);
      }
    } catch (err) {
      console.error('Error loading idea details for planning:', err);
    }
  };

  const generatePlan = async (
    requirements: string,
    planningType: 'timeline' | 'resources' | 'technical' | 'general' = 'general'
  ) => {
    if (!user?.id || !projectId || !requirements.trim()) {
      setError('Missing required information');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data: ProjectPlanningResponse = await generateProjectPlan({
        userId: user.id,
        projectId,
        requirements,
        planningType
      });

      setResult(data.plan);
      setCreditsRemaining(data.credits_remaining);
      
      return data;
    } catch (error: any) {
      setError(error.message || 'Failed to generate project plan');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generatePlan,
    isLoading,
    error,
    result,
    creditsRemaining,
    reset: () => setResult(null),
    defaultRequirements,
    loadIdeaDetails
  };
};
