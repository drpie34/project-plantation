import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Idea } from '@/types/supabase';

type IdeaFormData = {
  title: string;
  description: string;
  target_audience: string;
  problem_solved: string;
  tags: string[];
};

type UseIdeaFormProps = {
  onCreate: (idea: Idea) => void;
  onClose: () => void;
  initialData?: Idea;
  isEditing?: boolean;
};

export const useIdeaForm = ({ onCreate, onClose, initialData, isEditing = false }: UseIdeaFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState<IdeaFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    target_audience: initialData?.target_audience || '',
    problem_solved: initialData?.problem_solved || '',
    tags: initialData?.tags || []
  });
  
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
      if (isEditing && initialData) {
        // Update existing idea
        const { data: ideaData, error: ideaError } = await supabase
          .from('ideas')
          .update({
            title: formData.title,
            description: formData.description || null,
            target_audience: formData.target_audience || null,
            problem_solved: formData.problem_solved || null,
            project_id: selectedProject,
            tags: formData.tags
          })
          .eq('id', initialData.id)
          .select()
          .single();
        
        if (ideaError) throw ideaError;
        
        // Ensure the returned idea conforms to the Idea type
        const typedIdea: Idea = {
          ...ideaData,
          status: ideaData.status as "draft" | "developing" | "ready" | "archived",
          tags: ideaData.tags || [],
          inspiration_sources: (ideaData.inspiration_sources || {}) as Record<string, any>,
          collaboration_settings: (ideaData.collaboration_settings || { visibility: 'private' }) as { 
            visibility: 'private' | 'team' | 'public' 
          },
          version: ideaData.version || 1,
          version_history: (ideaData.version_history || []) as Record<string, any>[]
        };
        
        toast({
          title: 'Success',
          description: 'Idea updated successfully',
        });
        
        // Call the onCreate callback with the updated idea
        onCreate(typedIdea);
      } else {
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
          inspiration_sources: (ideaData.inspiration_sources || {}) as Record<string, any>,
          collaboration_settings: (ideaData.collaboration_settings || { visibility: 'private' }) as { 
            visibility: 'private' | 'team' | 'public' 
          },
          version: ideaData.version || 1,
          version_history: (ideaData.version_history || []) as Record<string, any>[]
        };
        
        // Add category links if categories are selected
        if (selectedCategories.length > 0) {
          await addIdeaCategories(typedIdea.id, selectedCategories);
        }
        
        toast({
          title: 'Success',
          description: 'New idea created',
        });
        
        // Call the onCreate callback
        onCreate(typedIdea);
      }
      
      // Reset form
      resetForm();
      onClose();
      
    } catch (error) {
      console.error('Error creating/updating idea:', error);
      toast({
        title: 'Error',
        description: isEditing ? 'Failed to update idea' : 'Failed to create idea',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addIdeaCategories = async (ideaId: string, categoryIds: string[]) => {
    try {
      const categoryLinks = categoryIds.map(categoryId => ({
        idea_id: ideaId,
        category_id: categoryId
      }));
      
      const { error: linkError } = await supabase
        .from('idea_category_links')
        .insert(categoryLinks);
      
      if (linkError) {
        console.error('Error adding category links:', linkError);
        // Continue anyway, the idea was created successfully
      }
    } catch (error) {
      console.error('Error adding categories:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      target_audience: '',
      problem_solved: '',
      tags: []
    });
    setSelectedCategories([]);
  };

  return {
    formData,
    selectedProject,
    selectedCategories,
    isSubmitting,
    setSelectedProject,
    handleChange,
    handleTagsChange,
    handleCategoryChange,
    handleSubmit,
    resetForm,
    setFormData
  };
};
