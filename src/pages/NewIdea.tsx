import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import NewIdeaDialog from '@/components/IdeasHub/NewIdeaDialog';
import { useCategories } from '@/hooks/useCategories';

export default function NewIdea() {
  const navigate = useNavigate();
  const [isNewIdeaOpen, setIsNewIdeaOpen] = useState(true);
  const { categories } = useCategories();

  // If the user closes the dialog, navigate back to the ideas hub
  useEffect(() => {
    if (!isNewIdeaOpen) {
      navigate('/ideas');
    }
  }, [isNewIdeaOpen, navigate]);

  const handleCreateIdea = (newIdea: any) => {
    // Navigate to the newly created idea
    navigate(`/ideas/${newIdea.id}`);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Generate New Idea</h1>
          <p className="text-muted-foreground">Create a new SaaS idea with or without AI assistance</p>
        </div>
      </div>

      {/* The dialog will already be open */}
      <NewIdeaDialog
        isOpen={isNewIdeaOpen}
        onClose={() => setIsNewIdeaOpen(false)}
        onCreate={handleCreateIdea}
        categories={categories}
        useAI={true}
      />
    </div>
  );
}