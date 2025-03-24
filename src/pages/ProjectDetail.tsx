
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Project, Idea } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusIcon, ArrowLeftIcon, PencilIcon } from 'lucide-react';

const ProjectDetail = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!user || !projectId) return;
      
      try {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .eq('user_id', user.id)
          .single();

        if (projectError) {
          console.error('Error fetching project:', projectError);
          toast({
            title: 'Error',
            description: 'Project not found',
            variant: 'destructive',
          });
          navigate('/projects');
          return;
        }

        setProject(projectData as Project);

        const { data: ideasData, error: ideasError } = await supabase
          .from('ideas')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (ideasError) {
          console.error('Error fetching ideas:', ideasError);
          return;
        }

        setIdeas(ideasData as Idea[]);
      } catch (error) {
        console.error('Error in fetchProjectDetails:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, user, navigate, toast]);

  const generateIdeas = () => {
    // This will be implemented with GPT-4o-mini later
    navigate(`/projects/${projectId}/generate-ideas`);
  };

  if (isLoading) {
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
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/projects')}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back
        </Button>
        <h2 className="text-3xl font-bold">{project.title}</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(`/projects/${projectId}/edit`)}
        >
          <PencilIcon className="h-3 w-3 mr-1" /> Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
            <CardDescription>
              Stage: <span className="capitalize">{project.stage}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-line">
              {project.description || 'No description provided'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p>{new Date(project.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p>{new Date(project.updated_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ideas Generated</p>
                <p>{ideas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ideas" className="mt-8">
        <TabsList>
          <TabsTrigger value="ideas">Ideas</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ideas" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium">Generated Ideas</h3>
            <Button onClick={generateIdeas}>
              <PlusIcon className="mr-2 h-4 w-4" /> Generate Ideas
            </Button>
          </div>

          {ideas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ideas.map((idea) => (
                <Card key={idea.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>{idea.title}</CardTitle>
                    <CardDescription>
                      {idea.target_audience && <span>For: {idea.target_audience}</span>}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">
                      {idea.description || 'No description provided'}
                    </p>
                    {idea.problem_solved && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Problem Solved:</p>
                        <p className="text-gray-600">{idea.problem_solved}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <h3 className="text-xl font-medium mb-2">No ideas generated yet</h3>
                  <p className="text-gray-500 mb-6">
                    Generate ideas using AI to explore possibilities for your SaaS project
                  </p>
                  <Button onClick={generateIdeas}>
                    <PlusIcon className="mr-2 h-4 w-4" /> Generate Ideas
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Project timeline and additional details will be available in future updates.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetail;
