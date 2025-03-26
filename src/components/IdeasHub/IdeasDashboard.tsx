
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Idea, IdeaCategory } from '@/types/supabase';
import IdeaCard from './IdeaCard';
import IdeaList from './IdeaList';
import NewIdeaDialog from './NewIdeaDialog';
import IdeasFilter from './IdeasFilter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { PlusIcon, SearchIcon, LayoutGrid, List } from 'lucide-react';

export default function IdeasDashboard() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [categories, setCategories] = useState<IdeaCategory[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState({ status: 'all', category: 'all', search: '' });
  const [isNewIdeaOpen, setIsNewIdeaOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (user) {
      fetchIdeas();
      fetchCategories();
    }
  }, [user, filter]);
  
  async function fetchIdeas() {
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
        return;
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
    } catch (error) {
      console.error('Error fetching ideas:', error);
      toast({
        title: 'Error',
        description: 'Failed to load ideas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('idea_categories')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      setCategories(data as IdeaCategory[] || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }
  
  function handleFilterChange(newFilter: Partial<typeof filter>) {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }
  
  function handleCreateIdea(newIdea: Idea) {
    setIdeas(prev => [newIdea, ...prev]);
    setIsNewIdeaOpen(false);
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Ideas Hub</h1>
        
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsNewIdeaOpen(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            New Idea
          </Button>
          
          <div className="flex border rounded-md">
            <Button 
              variant={view === 'grid' ? 'default' : 'ghost'} 
              size="icon" 
              onClick={() => setView('grid')}
              className="h-9 w-9"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant={view === 'list' ? 'default' : 'ghost'} 
              size="icon" 
              onClick={() => setView('list')}
              className="h-9 w-9"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-64">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search ideas..." 
            value={filter.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
            className="pl-10"
          />
        </div>
        
        <IdeasFilter 
          categories={categories}
          filter={filter}
          onChange={handleFilterChange}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : ideas.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium">No ideas found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {filter.search || filter.status !== 'all' || filter.category !== 'all' 
                  ? "Try changing your filters" 
                  : "Create your first idea to get started"}
              </p>
              {!filter.search && filter.status === 'all' && filter.category === 'all' && (
                <Button 
                  onClick={() => setIsNewIdeaOpen(true)}
                  className="mt-4"
                >
                  Create New Idea
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div>
          {view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ideas.map(idea => (
                <IdeaCard 
                  key={idea.id} 
                  idea={idea} 
                  categories={categories}
                  onUpdate={fetchIdeas}
                />
              ))}
            </div>
          ) : (
            <IdeaList 
              ideas={ideas} 
              categories={categories}
              onUpdate={fetchIdeas}
            />
          )}
        </div>
      )}
      
      <NewIdeaDialog 
        isOpen={isNewIdeaOpen}
        onClose={() => setIsNewIdeaOpen(false)}
        onCreate={handleCreateIdea}
        categories={categories}
      />
    </div>
  );
}
