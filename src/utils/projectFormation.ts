
import { callApiGateway } from '@/utils/apiGateway';
import { supabase } from '@/integrations/supabase/client';
import { Idea, User } from '@/types/supabase';

export type ProjectFormationParams = {
  idea?: Idea | null;
  research?: any | null;
  userTier: string;
};

export type ProjectSuggestion = {
  content: string;
  usage: {
    model: string;
    api: string;
    inputTokens: number;
    outputTokens: number;
  };
};

export async function generateProjectSuggestion({ 
  idea, 
  research, 
  userTier 
}: ProjectFormationParams): Promise<ProjectSuggestion> {
  try {
    const result = await callApiGateway<ProjectSuggestion>('generateProjectSuggestion', {
      idea,
      research,
      userTier
    });
    
    return result;
  } catch (error) {
    console.error('Error generating project suggestion:', error);
    throw new Error('Failed to generate project suggestion');
  }
}

export async function createProject({
  title,
  description,
  userId,
  ideaId = null,
  stage = 'planning'
}: {
  title: string;
  description?: string;
  userId: string;
  ideaId?: string | null;
  stage?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        title,
        description,
        user_id: userId,
        stage
      })
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw new Error('Failed to create project');
  }
}
