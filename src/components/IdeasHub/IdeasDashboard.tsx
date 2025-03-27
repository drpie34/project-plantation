
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import IdeaCard from './IdeaCard';
import IdeaList from './IdeaList';
import NewIdeaDialog from './NewIdeaDialog';
import IdeasFilter from './IdeasFilter';
import SearchBar from './SearchBar';
import ViewToggle from './ViewToggle';
import EmptyState from './EmptyState';
import { useIdeas } from '@/hooks/useIdeas';
import { useCategories } from '@/hooks/useCategories';
import { Idea } from '@/types/supabase';

export default function IdeasDashboard() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState({ status: 'all', category: 'all', search: '' });
  const [isNewIdeaOpen, setIsNewIdeaOpen] = useState(false);
  const navigate = useNavigate();
  
  const { categories } = useCategories();
  const { ideas, isLoading, fetchIdeas } = useIdeas({ filter });
  
  function handleFilterChange(newFilter: Partial<typeof filter>) {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }
  
  function handleCreateIdea(newIdea: Idea) {
    fetchIdeas();
    setIsNewIdeaOpen(false);
  }

  const hasFilters = filter.search !== '' || filter.status !== 'all' || filter.category !== 'all';
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Ideas Hub</h1>
        
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsNewIdeaOpen(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            New Idea
          </Button>
          
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar 
          value={filter.search}
          onChange={(value) => handleFilterChange({ search: value })}
        />
        
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
        <EmptyState 
          hasFilters={hasFilters}
          onCreateNew={() => setIsNewIdeaOpen(true)}
        />
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
