
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import MarketingCopyGenerator from '@/components/ContentGeneration/MarketingCopyGenerator';

export default function MarketingCopyGeneratorPage() {
  const params = useParams();
  const projectId = params.projectId;
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [userId, setUserId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserAndProject = async () => {
      // Check if projectId is valid
      if (!projectId || projectId === ':projectId') {
        setLoading(false);
        console.error('Invalid project ID:', projectId);
        toast({
          title: 'Error',
          description: 'Invalid or missing project ID',
          variant: 'destructive'
        });
        return;
      }

      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        setUserId(user.id);
        
        // Get user credits
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('credits_remaining')
          .eq('id', user.id)
          .single();
          
        if (userError) {
          throw userError;
        }
        
        setUserCredits(userData.credits_remaining);
        
        // Get project details
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();
          
        if (projectError) {
          throw projectError;
        }
        
        setProject(projectData);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProject();
  }, [projectId, toast]);

  if (loading) {
    return <div className="container py-8">Loading...</div>;
  }

  if (!project) {
    return (
      <div className="container py-8">
        Project not found. Please check the project ID.
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{project.title} - Marketing Copy</h1>
        <p className="text-gray-600">
          Generate compelling marketing copy for your project
        </p>
      </div>

      <MarketingCopyGenerator 
        projectId={projectId} 
        userId={userId}
        creditsRemaining={userCredits}
      />
    </div>
  );
}
