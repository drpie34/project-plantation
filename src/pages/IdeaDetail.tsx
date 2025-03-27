
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Idea, IdeaCategory } from '@/types/supabase';
import { 
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Separator
} from '@/components/ui';
import { 
  ArrowLeft, 
  Edit, 
  Trash,
  BarChart,
  FileText
} from 'lucide-react';

export default function IdeaDetail() {
  const { projectId, ideaId } = useParams<{ projectId: string; ideaId: string }>();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [categories, setCategories] = useState<IdeaCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (projectId && ideaId && user) {
      fetchIdea();
      fetchCategories();
    }
  }, [projectId, ideaId, user]);

  async function fetchIdea() {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', ideaId)
        .eq('project_id', projectId)
        .single();

      if (error) throw error;
      setIdea(data as Idea);
    } catch (error: any) {
      console.error('Error fetching idea:', error);
      toast({
        title: 'Error',
        description: 'Failed to load idea details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const { data } = await supabase
        .from('idea_categories')
        .select('*')
        .eq('user_id', user?.id);
      
      setCategories(data as IdeaCategory[] || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Idea Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The idea you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate(`/projects/${projectId}`)}>
            Back to Project
          </Button>
        </div>
      </div>
    );
  }

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    developing: 'bg-yellow-100 text-yellow-800',
    ready: 'bg-green-100 text-green-800',
    archived: 'bg-red-100 text-red-800'
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(`/projects/${projectId}`)}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h1 className="text-3xl font-bold">{idea.title}</h1>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">Overview</CardTitle>
              <CardDescription>
                Created on {new Date(idea.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge className={statusColors[idea.status] || 'bg-gray-100'}>
              {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-1">Description</h3>
              <p className="text-base">{idea.description || 'No description provided'}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Target Audience</h3>
                <p className="text-base">{idea.target_audience || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Problem Solved</h3>
                <p className="text-base">{idea.problem_solved || 'Not specified'}</p>
              </div>
            </div>

            {idea.ai_generated_data && (
              <>
                <Separator />
                {idea.ai_generated_data.key_features && idea.ai_generated_data.key_features.length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">Key Features</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {idea.ai_generated_data.key_features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {idea.ai_generated_data.revenue_model && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Revenue Model</h3>
                    <p className="text-base">{idea.ai_generated_data.revenue_model}</p>
                  </div>
                )}
              </>
            )}

            {idea.tags && idea.tags.length > 0 && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {idea.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate(`/projects/${projectId}/market-research?ideaId=${ideaId}`)}
          >
            <BarChart className="h-4 w-4 mr-2" />
            Research Market
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate(`/projects/${projectId}/planning?ideaId=${ideaId}`)}
          >
            <FileText className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive">
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
