import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Idea } from '@/types/supabase';

// Flag to use mock data in development mode
const USE_DEV_MODE = true;

// Mock ideas for development mode
const MOCK_IDEAS: Idea[] = [
  {
    id: "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
    title: "AI Content Generator",
    description: "Platform that automates content creation across multiple formats using AI",
    target_audience: "Digital marketers and content teams",
    problem_solved: "Time-consuming content creation and maintaining consistent brand voice",
    project_id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    tags: ["AI", "Content", "Marketing", "Automation"],
    user_id: "user123",
    status: "draft",
    created_at: "2025-03-20T00:00:00.000Z",
    inspiration_sources: {},
    collaboration_settings: { visibility: "private" },
    version: 1,
    version_history: []
  },
  {
    id: "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
    title: "Team Collaboration Hub",
    description: "Centralized workspace for remote teams to collaborate effectively",
    target_audience: "Remote and distributed teams",
    problem_solved: "Communication silos and project visibility issues",
    project_id: "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
    tags: ["Collaboration", "Remote Work", "Productivity", "Teams"],
    user_id: "user123",
    status: "developing",
    created_at: "2025-03-15T00:00:00.000Z",
    inspiration_sources: {},
    collaboration_settings: { visibility: "team" },
    version: 1,
    version_history: []
  },
  {
    id: "5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t",
    title: "Customer Feedback Analytics",
    description: "Tool that collects and analyzes customer feedback from multiple channels",
    target_audience: "Product managers and customer success teams",
    problem_solved: "Difficulty extracting actionable insights from customer feedback",
    project_id: null,
    tags: ["Analytics", "Customer Experience", "Feedback", "Product Management"],
    user_id: "user123",
    status: "draft",
    created_at: "2025-03-10T00:00:00.000Z",
    inspiration_sources: {},
    collaboration_settings: { visibility: "private" },
    version: 1,
    version_history: []
  }
];

interface UseIdeasProps {
  filter: {
    tag: string;
    search: string;
  };
}

export const useIdeas = ({ filter }: UseIdeasProps) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const [lastFetchAttempt, setLastFetchAttempt] = useState<number>(0);
  const FETCH_THROTTLE_MS = 5000; // Throttle refetches to once every 5 seconds

  const fetchIdeas = async () => {
    const now = Date.now();
    if (now - lastFetchAttempt < FETCH_THROTTLE_MS) {
      // Filter current ideas based on filter criteria
      if (filter) {
        let filteredIdeas = [...ideas];
        // Apply tag filter
        if (filter.tag && filter.tag !== 'all') {
          filteredIdeas = filteredIdeas.filter(idea => 
            idea.tags && Array.isArray(idea.tags) && idea.tags.includes(filter.tag)
          );
        }
        // Apply search filter
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          filteredIdeas = filteredIdeas.filter(idea => 
            (idea.title && idea.title.toLowerCase().includes(searchLower)) || 
            (idea.description && idea.description.toLowerCase().includes(searchLower))
          );
        }
        return filteredIdeas;
      }
      return ideas;
    }
    
    setLastFetchAttempt(now);
    setIsLoading(true);
    
    try {
      // Use mock data in development mode
      if (USE_DEV_MODE) {
        let mockIdeasCopy = [...MOCK_IDEAS];
        
        // Extract all unique tags from mock ideas
        const uniqueTags = new Set<string>();
        mockIdeasCopy.forEach(idea => {
          if (idea.tags && Array.isArray(idea.tags)) {
            idea.tags.forEach(tag => uniqueTags.add(tag));
          }
        });
        
        setAllTags(Array.from(uniqueTags).sort());
        
        // Apply filtering for mock data
        // Apply search filter
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          mockIdeasCopy = mockIdeasCopy.filter(idea => 
            (idea.title && idea.title.toLowerCase().includes(searchLower)) || 
            (idea.description && idea.description.toLowerCase().includes(searchLower))
          );
        }
        
        // Apply tag filter
        if (filter.tag && filter.tag !== 'all') {
          mockIdeasCopy = mockIdeasCopy.filter(idea => 
            idea.tags && Array.isArray(idea.tags) && idea.tags.includes(filter.tag)
          );
        }
        
        setIdeas(mockIdeasCopy);
        setIsLoading(false);
        return mockIdeasCopy;
      }
      
      // Real data fetching logic for production mode
      // Start with a base query for ideas
      let query = supabase
        .from('ideas')
        .select('*');
      
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
      
      let filteredIdeas = data as Idea[];
      
      // Extract all unique tags for the tag filter dropdown
      const uniqueTags = new Set<string>();
      filteredIdeas.forEach(idea => {
        if (idea.tags && Array.isArray(idea.tags)) {
          idea.tags.forEach(tag => uniqueTags.add(tag));
        }
      });
      
      setAllTags(Array.from(uniqueTags).sort());
      
      // If tag filter is applied, filter ideas by the selected tag
      if (filter.tag && filter.tag !== 'all') {
        filteredIdeas = filteredIdeas.filter(idea => 
          idea.tags && Array.isArray(idea.tags) && idea.tags.includes(filter.tag)
        );
      }
      
      setIdeas(filteredIdeas || []);
      return filteredIdeas || [];
    } catch (error) {
      console.error('Error fetching ideas:', error);
      if (!USE_DEV_MODE) {
        toast({
          title: 'Error',
          description: 'Failed to load ideas',
          variant: 'destructive',
        });
      }
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
    allTags,
    fetchIdeas
  };
};