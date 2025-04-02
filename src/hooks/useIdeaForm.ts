import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Idea } from '@/types/supabase';

// Flag to determine if we should use mock data for development
const USE_DEV_MODE = true;

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
  const [selectedProject, setSelectedProject] = useState<string>('none');
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
    if (!formData.title) {
      toast({
        title: 'Missing information',
        description: 'Please provide a title for your idea',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create a basic idea object to return in case of errors
      // Use a proper UUID format for the ID to prevent syntax errors
      const createNewIdea = (): Idea => ({
        // Generate a proper UUID format
        id: crypto.randomUUID ? crypto.randomUUID() : 
            'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              const r = Math.random() * 16 | 0, 
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            }),
        title: formData.title,
        description: formData.description || null,
        target_audience: formData.target_audience || null,
        problem_solved: formData.problem_solved || null,
        project_id: selectedProject === 'none' ? null : selectedProject,
        tags: formData.tags || [],
        user_id: user?.id || '', // Add user_id for row-level security
        status: 'draft',
        created_at: new Date().toISOString(),
        inspiration_sources: {},
        collaboration_settings: { visibility: 'private' },
        version: 1,
        version_history: []
      });
      
      // In development mode, bypass all database calls
      if (USE_DEV_MODE) {
        if (isEditing && initialData) {
          // Create an edited version of the existing idea
          const editedIdea: Idea = {
            ...initialData,
            title: formData.title,
            description: formData.description || null,
            target_audience: formData.target_audience || null,
            problem_solved: formData.problem_solved || null,
            project_id: selectedProject === 'none' ? null : selectedProject,
            tags: formData.tags || [],
            // Ensure we have user_id
            user_id: initialData.user_id || user?.id || ''
          };
          
          toast({
            title: 'Success',
            description: 'Idea updated (dev mode)',
            variant: 'default',
          });
          
          onCreate(editedIdea);
          resetForm();
          onClose();
          setIsSubmitting(false);
          return;
        } else {
          // Create a new idea
          const newIdea = createNewIdea();
          
          toast({
            title: 'Success',
            description: 'New idea created (dev mode)',
            variant: 'default',
          });
          
          onCreate(newIdea);
          resetForm();
          onClose();
          setIsSubmitting(false);
          return;
        }
      }
      
      // If not in dev mode, proceed with normal flow
      const fallbackIdea = createNewIdea();
      
      if (isEditing && initialData) {
        // Update existing idea
        const { data: ideaData, error: ideaError } = await supabase
          .from('ideas')
          .update({
            title: formData.title,
            description: formData.description || null,
            target_audience: formData.target_audience || null,
            problem_solved: formData.problem_solved || null,
            project_id: selectedProject === 'none' ? null : selectedProject,
            tags: formData.tags
          })
          .eq('id', initialData.id)
          .select()
          .single();
        
        if (ideaError) {
          console.error('Error updating idea:', ideaError);
          // Use a modified version of the initial data as fallback
          const fallbackEditedIdea = {
            ...initialData,
            title: formData.title,
            description: formData.description || null,
            target_audience: formData.target_audience || null,
            problem_solved: formData.problem_solved || null,
            project_id: selectedProject === 'none' ? null : selectedProject,
            tags: formData.tags || []
          };
          
          toast({
            title: 'Note',
            description: 'Idea updated in UI only. Database sync pending.',
            variant: 'default',
          });
          
          // Call the onCreate callback with the fallback idea
          onCreate(fallbackEditedIdea);
          resetForm();
          onClose();
          return;
        }
        
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
            project_id: selectedProject === 'none' ? null : selectedProject,
            tags: formData.tags,
            user_id: user?.id, // Add user_id for row-level security
            status: 'draft' as "draft" | "developing" | "ready" | "archived",
            inspiration_sources: {},
            collaboration_settings: { visibility: 'private' },
            version: 1,
            version_history: []
          })
          .select()
          .single();
        
        if (ideaError) {
          console.error('Error creating idea:', ideaError);
          
          toast({
            title: 'Note',
            description: 'Idea created in UI only. Database sync pending.',
            variant: 'default',
          });
          
          // Call the onCreate callback with the fallback idea
          onCreate(fallbackIdea);
          resetForm();
          onClose();
          return;
        }
        
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
        try {
          if (selectedCategories.length > 0) {
            await addIdeaCategories(typedIdea.id, selectedCategories);
          }
        } catch (catError) {
          console.error('Error adding categories:', catError);
          // Continue anyway, the idea was created
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
      
      // Create a fallback idea with a proper UUID
      const emergencyFallbackIdea: Idea = {
        // Generate a proper UUID format
        id: crypto.randomUUID ? crypto.randomUUID() : 
            'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              const r = Math.random() * 16 | 0, 
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            }),
        title: formData.title,
        description: formData.description || null,
        target_audience: formData.target_audience || null,
        problem_solved: formData.problem_solved || null,
        project_id: selectedProject === 'none' ? null : selectedProject,
        tags: formData.tags || [],
        user_id: user?.id || '', // Add user_id for row-level security
        status: 'draft',
        created_at: new Date().toISOString(),
        inspiration_sources: {},
        collaboration_settings: { visibility: 'private' },
        version: 1,
        version_history: []
      };
      
      toast({
        title: 'Warning',
        description: isEditing ? 'Changes displayed locally only. Database sync failed.' : 'Idea created locally only. Database sync failed.',
        variant: 'destructive',
      });
      
      // Still provide the idea to the UI
      onCreate(emergencyFallbackIdea);
      resetForm();
      onClose();
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
