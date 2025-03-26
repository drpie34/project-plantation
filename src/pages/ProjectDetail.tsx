
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Lightbulb, ArrowRight } from 'lucide-react';

export default function ProjectDetail() {
  const { projectId } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [project, setProject] = useState<any>(null);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        
        // Fetch project details
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();
        
        if (projectError) throw projectError;
        setProject(projectData);
        
        // Fetch project ideas
        const { data: ideasData, error: ideasError } = await supabase
          .from('ideas')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
        
        if (ideasError) throw ideasError;
        setIdeas(ideasData || []);
        
      } catch (error: any) {
        console.error('Error fetching project details:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load project details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectDetails();
  }, [projectId, toast]);
  
  if (loading) {
    return <div className="flex justify-center p-8">Loading project details...</div>;
  }
  
  if (!project) {
    return <div className="flex justify-center p-8">Project not found</div>;
  }
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
        <p className="text-gray-500">{project.description || 'No description provided'}</p>
        <div className="mt-2 flex gap-2">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 capitalize">
            {project.stage}
          </span>
          
          <Link to="/ideas" className="inline-flex items-center text-sm text-blue-600 hover:underline">
            View all ideas in Ideas Hub <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Idea Generation</CardTitle>
            <CardDescription>Generate AI-powered SaaS business ideas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Use AI to generate innovative SaaS ideas or validate your existing concepts.
            </p>
            <Button asChild className="w-full">
              <Link to={`/projects/${projectId}/generate-ideas`}>
                Generate Ideas
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Project Planning</CardTitle>
            <CardDescription>Create detailed project plans</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Generate timelines, resource plans, or technical architecture for your SaaS project.
            </p>
            <Button asChild className="w-full">
              <Link to={`/projects/${projectId}/planning`}>
                Plan Project
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Market Research</CardTitle>
            <CardDescription>Research market opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Explore market size, competition, pricing strategies, and target customers.
            </p>
            <Button asChild className="w-full">
              <Link to={`/projects/${projectId}/market-research`}>
                Research Market
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Document Analysis</CardTitle>
            <CardDescription>Analyze project documents</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Extract insights from requirements documents, competitor analyses, and more.
            </p>
            <Button asChild className="w-full">
              <Link to={`/projects/${projectId}/document-analysis`}>
                Analyze Documents
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Generated Ideas</h2>
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
              {ideas.length}
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/ideas">
                <Lightbulb className="mr-2 h-4 w-4" />
                Ideas Hub
              </Link>
            </Button>
            <Button asChild>
              <Link to={`/projects/${projectId}/generate-ideas`}>
                Generate New Ideas
              </Link>
            </Button>
          </div>
        </div>
        
        {ideas.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-gray-500">
                <p>No ideas generated yet.</p>
                <Button asChild className="mt-4">
                  <Link to={`/projects/${projectId}/generate-ideas`}>
                    Generate Ideas
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {ideas.map((idea) => (
              <Card key={idea.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{idea.title}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full capitalize">
                      {idea.status}
                    </span>
                  </CardTitle>
                  {idea.target_audience && (
                    <CardDescription>Target: {idea.target_audience}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="mb-2">{idea.description}</p>
                  {idea.problem_solved && (
                    <div className="mt-2">
                      <h4 className="font-semibold">Problem Solved:</h4>
                      <p>{idea.problem_solved}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end">
                    <Link 
                      to={`/ideas?filter=project&projectId=${projectId}`} 
                      className="text-sm text-blue-600 hover:underline flex items-center"
                    >
                      View in Ideas Hub <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
