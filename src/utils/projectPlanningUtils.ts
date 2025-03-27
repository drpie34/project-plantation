
import { supabase } from '@/integrations/supabase/client';

export type ProjectPlanningParams = {
  userId: string;
  projectId: string;
  requirements: string;
  planningType: 'timeline' | 'resources' | 'technical' | 'general';
};

export type ProjectPlanningResponse = {
  success: boolean;
  plan: {
    content: string;
    model: string;
    thinking: string | null;
    extendedThinking: boolean;
  };
  credits_remaining: number;
};

export async function generateProjectPlan(params: ProjectPlanningParams): Promise<ProjectPlanningResponse> {
  try {
    // Use the Supabase client instead of direct fetch for more reliability
    const { data, error } = await supabase.functions.invoke('project-planning', {
      body: params
    });
    
    if (error) {
      console.error('Project planning API error:', error);
      throw new Error(error.message || 'Error generating project plan');
    }
    
    if (!data) {
      throw new Error('Empty response from project planning API');
    }
    
    return data as ProjectPlanningResponse;
  } catch (error: any) {
    console.error('Error generating project plan:', error);
    throw new Error(error.message || 'Failed to generate project plan');
  }
}
