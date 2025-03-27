
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import { useIdeaGeneration } from '@/hooks/useIdeaGeneration';
import GenerateIdeasForm from '@/components/ideas/GenerateIdeasForm';

const GenerateIdeas = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [isProjectLoading, setIsProjectLoading] = useState(true);
  const { projectId } = useParams<{ projectId: string }>();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { isLoading, generateIdeas } = useIdeaGeneration({
    projectId: projectId || '',
    user,
    profile
  });

  useEffect(() => {
    const fetchProject = async () => {
      if (!user || !projectId) return;
      
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching project:', error);
          toast({
            title: 'Error',
            description: 'Project not found',
            variant: 'destructive',
          });
          navigate('/projects');
          return;
        }

        setProject(data as Project);
      } catch (error) {
        console.error('Error in fetchProject:', error);
      } finally {
        setIsProjectLoading(false);
      }
    };

    fetchProject();
  }, [projectId, user, navigate, toast]);

  const handleGenerateIdeas = async (industry: string, interests: string) => {
    await generateIdeas(industry, interests);
  };

  if (isProjectLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-medium mb-2">Project not found</h2>
        <Button onClick={() => navigate('/projects')} className="mt-4">
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center space-x-2 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(`/projects/${projectId}`)}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Project
        </Button>
        <h2 className="text-3xl font-bold">Generate Ideas</h2>
      </div>
      
      <GenerateIdeasForm
        projectId={projectId || ''}
        isLoading={isLoading}
        creditsRemaining={profile?.credits_remaining || 0}
        onSubmit={handleGenerateIdeas}
      />
    </div>
  );
};

export default GenerateIdeas;
