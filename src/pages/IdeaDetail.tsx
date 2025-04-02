import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Idea } from '@/types/supabase';

// Development flag to use mock data instead of real API calls
const USE_DEV_MODE = true;
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
      // If in development mode, create a mock idea
      if (USE_DEV_MODE) {
        console.log('Using mock idea data in development mode');
        
        // Create a mock idea with the requested ID
        const mockIdea: Idea = {
          id: ideaId || '',
          user_id: user?.id || '',
          title: 'Mock Idea (Dev Mode)',
          description: 'This is a mock idea created in development mode.',
          target_audience: 'Developers working on this application',
          problem_solved: 'The need for reliable data during development',
          project_id: null,
          tags: ['dev', 'mock', 'testing'],
          status: 'draft',
          created_at: new Date().toISOString(),
          inspiration_sources: { source: 'Development needs' },
          collaboration_settings: { visibility: 'private' },
          version: 1,
          version_history: []
        };
        
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setIdea(mockIdea);
        setIsLoading(false);
        return;
      }
      
      // Standard database query
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
      
      // Create a fallback idea for display
      if (ideaId && !USE_DEV_MODE) {
        const fallbackIdea: Idea = {
          id: ideaId,
          user_id: user?.id || '',
          title: 'Idea (Database Error)',
          description: 'There was an error fetching this idea from the database.',
          target_audience: 'N/A',
          problem_solved: 'N/A',
          project_id: null,
          tags: ['error'],
          status: 'draft',
          created_at: new Date().toISOString(),
          inspiration_sources: {},
          collaboration_settings: { visibility: 'private' },
          version: 1,
          version_history: []
        };
        
        setIdea(fallbackIdea);
        
        toast({
          title: 'Warning',
          description: 'Using local fallback data. Database connection failed.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load idea details',
          variant: 'destructive',
        });
      }
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
      // If in development mode, just update the idea in the local state
      if (USE_DEV_MODE) {
        // Merge the updated idea with the current idea
        if (idea) {
          const updatedFullIdea: Idea = {
            ...idea,
            ...updatedIdea,
            updated_at: new Date().toISOString()
          };
          
          setIdea(updatedFullIdea);
          setIsEditDialogOpen(false);
          
          toast({
            title: 'Success',
            description: 'Idea updated (dev mode)',
            variant: 'default',
          });
        }
        return;
      }
      
      // Standard database update
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
      // If in development mode, just simulate deletion
      if (USE_DEV_MODE) {
        toast({
          title: 'Success',
          description: 'Idea deleted (dev mode)',
          variant: 'default',
        });
        
        navigate('/ideas');
        return;
      }
      
      // Standard deletion
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
          onClick={() => navigate(`/projects/formation?ideaId=${ideaId}`, { 
            state: { from: `/ideas/${ideaId}` } 
          })}>
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
