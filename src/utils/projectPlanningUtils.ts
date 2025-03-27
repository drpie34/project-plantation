
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
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/project-planning`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(params),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error generating project plan');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error generating project plan:', error);
    throw error;
  }
}
