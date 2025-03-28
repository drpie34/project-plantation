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
import IdeaContent from '@/components/ideas/IdeaContent';
import NewIdeaDialog from '@/components/IdeasHub/NewIdeaDialog';
import { ArrowLeft } from 'lucide-react';

export default function IdeaDetail() {
  const { ideaId } = useParams<{ ideaId: string }>();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (ideaId && user) {
      fetchIdea();
    }
  }, [ideaId, user]);

  async function fetchIdea() {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', ideaId)
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

  const handleEdit = async () => {
    // Open the edit dialog with current idea data
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (updatedIdea: Partial<Idea>) => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .update(updatedIdea)
        .eq('id', ideaId)
        .select()
        .single();
      
      if (error) throw error;
      
      setIdea(data as Idea);
      setIsEditDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Idea updated successfully',
        variant: 'default',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update idea',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', ideaId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Idea deleted successfully',
        variant: 'default',
      });
      
      navigate('/ideas');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete idea',
        variant: 'destructive',
      });
    }
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
          <Button onClick={() => navigate('/ideas')}>
            Back to Ideas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-6 flex justify-between items-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/ideas')}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Ideas
        </Button>
        <h1 className="text-2xl font-bold">{idea.title}</h1>
      </div>

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

      <div className="flex gap-4 justify-end">
        <Button variant="outline" onClick={handleEdit}>
          Edit Idea
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleDelete}>
          Delete Idea
        </Button>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate(`/projects/formation?ideaId=${ideaId}`)}>
          Start Project
        </Button>
      </div>

      {isEditDialogOpen && idea && (
        <NewIdeaDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onCreate={handleEditSubmit}
          categories={[]}
          initialData={idea}
          isEditing={true}
        />
      )}
    </div>
  );
};
