
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
  stage = 'planning',
  metadata = {}
}: {
  title: string;
  description?: string;
  userId: string;
  ideaId?: string | null;
  stage?: string;
  metadata?: Record<string, any>;
}) {
  try {
    // Store the description including the document content to handle
    // database schema limitations (since metadata field is not available)
    let enhancedDescription = description || '';
    
    // Add a reference to the metadata in the description
    if (metadata && Object.keys(metadata).length > 0) {
      // Only store a reference to the extra content so we don't overflow the description field
      enhancedDescription += '\n\n[Additional data available in application]';
      
      // We could update the database schema to include these fields in the future
      console.log('Additional project metadata available:', metadata);
    }
    
    // Insert the project with available fields
    const { data, error } = await supabase
      .from('projects')
      .insert({
        title,
        description: enhancedDescription,
        user_id: userId,
        stage
      })
      .select()
      .single();

    if (error) throw error;
    
    // If ideaId is provided, link the idea to the project
    if (ideaId) {
      try {
        const { error: linkError } = await supabase
          .from('ideas')
          .update({ project_id: data.id })
          .eq('id', ideaId);
          
        if (linkError) {
          console.error('Error linking idea to project:', linkError);
        }
      } catch (linkError) {
        console.error('Error linking idea to project:', linkError);
        // Continue even if linking fails
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw new Error('Failed to create project');
  }
}
