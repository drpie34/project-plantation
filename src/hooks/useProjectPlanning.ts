
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { generateProjectPlan, ProjectPlanningResponse } from '@/utils/projectPlanningUtils';

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
  const { user } = useAuth();

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
    reset: () => setResult(null)
  };
};
