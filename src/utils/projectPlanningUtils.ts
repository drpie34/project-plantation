
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
    // Update to use the API Gateway instead of direct function call for more reliability
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-gateway`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        action: 'generateProjectPlan',
        payload: params
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Project planning API error:', errorText);
      throw new Error(errorText || 'Error generating project plan');
    }
    
    const data = await response.json();
    
    if (!data) {
      throw new Error('Empty response from project planning API');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error generating project plan:', error);
    throw new Error(error.message || 'Failed to generate project plan');
  }
}
