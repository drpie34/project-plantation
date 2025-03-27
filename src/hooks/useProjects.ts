
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Project } from '@/types/supabase';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchProjects = async () => {
    if (!user) return [];
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      // Process the projects to ensure they match the Project type
      if (data) {
        const typedProjects: Project[] = data.map(project => ({
          id: project.id,
          user_id: project.user_id,
          title: project.title,
          description: project.description || null,
          stage: project.stage as "ideation" | "planning" | "development" | "launched",
          created_at: project.created_at,
          updated_at: project.updated_at,
          is_collaborative: project.is_collaborative || false,
          collaborators: project.collaborators || [],
          collaboration_settings: project.collaboration_settings 
            ? { permissions: (project.collaboration_settings as any).permissions as "view" | "comment" | "edit" } 
            : { permissions: "view" }
        }));
        
        setProjects(typedProjects);
        return typedProjects;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  return {
    projects,
    isLoading,
    fetchProjects
  };
};
