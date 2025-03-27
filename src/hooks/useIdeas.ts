
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Idea } from '@/types/supabase';

interface UseIdeasProps {
  filter: {
    status: string;
    category: string;
    search: string;
  };
}

export const useIdeas = ({ filter }: UseIdeasProps) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchIdeas = async () => {
    setIsLoading(true);
    
    try {
      // Start with a base query for ideas
      let query = supabase
        .from('ideas')
        .select('*');
      
      // Apply status filter if not 'all'
      if (filter.status !== 'all') {
        query = query.eq('status', filter.status);
      }
      
      // Apply search filter if present
      if (filter.search) {
        query = query.or(`title.ilike.%${filter.search}%,description.ilike.%${filter.search}%`);
      }
      
      // Get projects first to filter by user's projects
      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user?.id);
      
      if (projects && projects.length > 0) {
        const projectIds = projects.map(p => p.id);
        query = query.in('project_id', projectIds);
      } else {
        setIdeas([]);
        setIsLoading(false);
        return [];
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // If category filter is applied, handle after fetching ideas
      let filteredIdeas = data as Idea[];
      
      if (filter.category !== 'all') {
        // Get idea_ids that belong to the selected category
        const { data: categoryLinks } = await supabase
          .from('idea_category_links')
          .select('idea_id')
          .eq('category_id', filter.category);
        
        if (categoryLinks && categoryLinks.length > 0) {
          const ideaIds = categoryLinks.map(link => link.idea_id);
          filteredIdeas = filteredIdeas.filter(idea => ideaIds.includes(idea.id));
        } else {
          filteredIdeas = [];
        }
      }
      
      setIdeas(filteredIdeas || []);
      return filteredIdeas || [];
    } catch (error) {
      console.error('Error fetching ideas:', error);
      toast({
        title: 'Error',
        description: 'Failed to load ideas',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchIdeas();
    }
  }, [user, filter]);

  return {
    ideas,
    isLoading,
    fetchIdeas
  };
};
