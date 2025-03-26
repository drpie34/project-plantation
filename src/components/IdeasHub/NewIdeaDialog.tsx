
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Idea, IdeaCategory, Project } from '@/types/supabase';
import { TagInput } from '@/components/TagInput';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface NewIdeaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (idea: Idea) => void;
  categories: IdeaCategory[];
}

export default function NewIdeaDialog({ isOpen, onClose, onCreate, categories }: NewIdeaDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_audience: '',
    problem_solved: '',
    tags: [] as string[]
  });
  
  // Load user's projects when dialog opens
  useState(() => {
    if (isOpen && user) {
      fetchUserProjects();
    }
  });
  
  async function fetchUserProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      // Type assertion to ensure the data conforms to Project[]
      const typedProjects = data?.map(project => ({
        ...project,
        stage: project.stage as "ideation" | "planning" | "development" | "launched"
      })) || [];
      
      setProjects(typedProjects);
      if (typedProjects.length > 0) {
        setSelectedProject(typedProjects[0].id);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive',
      });
    }
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTagsChange = (tags: string[]) => {
    setFormData(prev => ({ ...prev, tags }));
  };
  
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };
  
  const handleSubmit = async () => {
    if (!formData.title || !selectedProject) {
      toast({
        title: 'Missing information',
        description: 'Please provide a title and select a project',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert new idea
      const { data: ideaData, error: ideaError } = await supabase
        .from('ideas')
        .insert({
          title: formData.title,
          description: formData.description || null,
          target_audience: formData.target_audience || null,
          problem_solved: formData.problem_solved || null,
          project_id: selectedProject,
          tags: formData.tags,
          status: 'draft' as "draft" | "developing" | "ready" | "archived",
          inspiration_sources: {},
          collaboration_settings: { visibility: 'private' },
          version: 1,
          version_history: []
        })
        .select()
        .single();
      
      if (ideaError) throw ideaError;
      
      // Ensure the returned idea conforms to the Idea type
      const typedIdea: Idea = {
        ...ideaData,
        status: ideaData.status as "draft" | "developing" | "ready" | "archived",
        tags: ideaData.tags || [],
        inspiration_sources: ideaData.inspiration_sources || {},
        collaboration_settings: ideaData.collaboration_settings || { visibility: 'private' },
        version: ideaData.version || 1,
        version_history: ideaData.version_history || []
      };
      
      // Add category links if categories are selected
      if (selectedCategories.length > 0) {
        const categoryLinks = selectedCategories.map(categoryId => ({
          idea_id: typedIdea.id,
          category_id: categoryId
        }));
        
        const { error: linkError } = await supabase
          .from('idea_category_links')
          .insert(categoryLinks);
        
        if (linkError) {
          console.error('Error adding category links:', linkError);
          // Continue anyway, the idea was created successfully
        }
      }
      
      toast({
        title: 'Success',
        description: 'New idea created',
      });
      
      // Call the onCreate callback
      onCreate(typedIdea);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        target_audience: '',
        problem_solved: '',
        tags: []
      });
      setSelectedCategories([]);
      onClose();
      
    } catch (error) {
      console.error('Error creating idea:', error);
      toast({
        title: 'Error',
        description: 'Failed to create idea',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Idea</DialogTitle>
          <DialogDescription>
            Add details about your SaaS idea
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter idea title"
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project" className="text-right">
              Project <span className="text-red-500">*</span>
            </Label>
            <div className="col-span-3">
              {projects.length > 0 ? (
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No projects found. <Button variant="link" className="p-0 h-auto">Create a new project</Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your idea"
              className="col-span-3"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="target_audience" className="text-right">
              Target Audience
            </Label>
            <Textarea
              id="target_audience"
              name="target_audience"
              value={formData.target_audience}
              onChange={handleChange}
              placeholder="Who is this idea for?"
              className="col-span-3"
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="problem_solved" className="text-right">
              Problem Solved
            </Label>
            <Textarea
              id="problem_solved"
              name="problem_solved"
              value={formData.problem_solved}
              onChange={handleChange}
              placeholder="What problem does this idea solve?"
              className="col-span-3"
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="tags" className="text-right">
              Tags
            </Label>
            <div className="col-span-3">
              <TagInput
                value={formData.tags}
                onChange={handleTagsChange}
                placeholder="Add tags..."
                maxTags={5}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Press Enter or comma to add a tag (max 5)
              </p>
            </div>
          </div>
          
          {categories.length > 0 && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right">
                Categories
              </Label>
              <div className="col-span-3">
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Button
                      key={category.id}
                      type="button"
                      variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCategoryChange(category.id)}
                      style={{
                        borderColor: selectedCategories.includes(category.id) ? undefined : category.color
                      }}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
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
