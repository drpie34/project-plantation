
import { useEffect } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { Idea, IdeaCategory } from '@/types/supabase';
import { useIdeaForm } from '@/hooks/useIdeaForm';
import IdeaFormFields from './IdeaFormFields';
import CategorySelector from './CategorySelector';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface NewIdeaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (idea: Idea) => void;
  categories: IdeaCategory[];
}

export default function NewIdeaDialog({ isOpen, onClose, onCreate, categories }: NewIdeaDialogProps) {
  const { projects, fetchProjects } = useProjects();
  
  const {
    formData,
    selectedProject,
    selectedCategories,
    isSubmitting,
    setSelectedProject,
    handleChange,
    handleTagsChange,
    handleCategoryChange,
    handleSubmit
  } = useIdeaForm({ onCreate, onClose });
  
  // Load user's projects and set initial project when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchProjects().then(fetchedProjects => {
        if (fetchedProjects && fetchedProjects.length > 0 && !selectedProject) {
          setSelectedProject(fetchedProjects[0].id);
        }
      });
    }
  }, [isOpen, fetchProjects, selectedProject, setSelectedProject]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Idea</DialogTitle>
          <DialogDescription>
            Add details about your SaaS idea
          </DialogDescription>
        </DialogHeader>
        
        <IdeaFormFields 
          formData={formData}
          handleChange={handleChange}
          handleTagsChange={handleTagsChange}
          projects={projects}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
        />
        
        {categories.length > 0 && (
          <CategorySelector 
            categories={categories}
            selectedCategories={selectedCategories}
            onChange={handleCategoryChange}
          />
        )}
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Idea'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
