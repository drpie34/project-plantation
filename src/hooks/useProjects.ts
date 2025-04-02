
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Project } from '@/types/supabase';

// Flag to use mock data in development mode
const USE_DEV_MODE = true;

// Mock projects for development mode
const MOCK_PROJECTS: Project[] = [
  {
    id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    user_id: "user123",
    title: "SaaS Dashboard",
    description: "Cloud-based analytics dashboard for business intelligence",
    stage: "planning",
    created_at: "2025-02-01T00:00:00.000Z",
    updated_at: "2025-03-15T00:00:00.000Z",
    is_collaborative: true,
    collaborators: ["collaborator1", "collaborator2"],
    collaboration_settings: { permissions: "edit" }
  },
  {
    id: "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
    user_id: "user123",
    title: "Mobile App Platform",
    description: "Cross-platform mobile application framework",
    stage: "development",
    created_at: "2025-01-15T00:00:00.000Z",
    updated_at: "2025-03-10T00:00:00.000Z",
    is_collaborative: false,
    collaborators: [],
    collaboration_settings: { permissions: "view" }
  }
];

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [lastFetchAttempt, setLastFetchAttempt] = useState<number>(0);
  const FETCH_THROTTLE_MS = 5000; // Throttle refetches to once every 5 seconds

  const fetchProjects = async () => {
    if (!user) return [];
    
    const now = Date.now();
    if (now - lastFetchAttempt < FETCH_THROTTLE_MS) {
      // Return current projects without refetching if throttled
      return projects;
    }
    
    setLastFetchAttempt(now);
    setIsLoading(true);
    
    // Use mock data in development mode
    if (USE_DEV_MODE) {
      setProjects(MOCK_PROJECTS);
      setIsLoading(false);
      return MOCK_PROJECTS;
    }
    
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
