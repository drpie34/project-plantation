import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Idea } from '@/types/supabase';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button
} from '@/components/ui';
import IdeaHeader from '@/components/ideas/IdeaHeader';
import IdeaContent from '@/components/ideas/IdeaContent';
import IdeaActions from '@/components/ideas/IdeaActions';
import { ArrowLeft } from 'lucide-react';

export default function IdeaDetail() {
  const { projectId, ideaId } = useParams<{ projectId: string; ideaId: string }>();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (projectId && ideaId && user) {
      fetchIdea();
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
      console.log('Loaded idea details in IdeaDetail:', data);
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

  const handleEdit = () => {
    toast({
      title: 'Info',
      description: 'Edit functionality not yet implemented',
      variant: 'default',
    });
  };

  const handleDelete = async () => {
    toast({
      title: 'Info',
      description: 'Delete functionality not yet implemented',
      variant: 'default',
    });
  };

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

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <IdeaHeader idea={idea} projectId={projectId || ''} />

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Overview</CardTitle>
          <CardDescription>
            Created on {new Date(idea.created_at).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IdeaContent idea={idea} />
        </CardContent>
      </Card>

      <IdeaActions 
        projectId={projectId || ''} 
        ideaId={ideaId || ''} 
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};
