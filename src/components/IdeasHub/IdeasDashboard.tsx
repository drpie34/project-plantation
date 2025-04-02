
import { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from '@dnd-kit/sortable';

interface IdeasDashboardProps {
  initialNewIdeaOpen?: boolean;
  initialUseAI?: boolean;
}

export default function IdeasDashboard({ 
  initialNewIdeaOpen = false, 
  initialUseAI = false 
}: IdeasDashboardProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState({ tag: 'all', search: '' });
  const [isNewIdeaOpen, setIsNewIdeaOpen] = useState(initialNewIdeaOpen);
  const [useAI, setUseAI] = useState(initialUseAI);
  const [sortedIdeas, setSortedIdeas] = useState<Idea[]>([]);
  const [customOrder, setCustomOrder] = useState<string[]>([]);
  const navigate = useNavigate();
  
  const { categories } = useCategories();
  const { ideas, isLoading, allTags, fetchIdeas } = useIdeas({ filter });

  // Setup DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Load custom order from localStorage on component mount
  useEffect(() => {
    const savedOrder = localStorage.getItem('ideasOrder');
    if (savedOrder) {
      setCustomOrder(JSON.parse(savedOrder));
    }
  }, []);
  
  // Update sortedIdeas whenever ideas or customOrder changes
  useEffect(() => {
    if (ideas.length > 0) {
      let orderedIdeas = [...ideas];
      
      // If we have a custom order and we're in grid view, apply it
      if (customOrder.length > 0 && view === 'grid') {
        // Create a map of idea IDs to their position in the custom order
        const orderMap = new Map(customOrder.map((id, index) => [id, index]));
        
        // Sort the ideas based on custom order first, then by creation date for new items
        orderedIdeas.sort((a, b) => {
          const aIndex = orderMap.has(a.id) ? orderMap.get(a.id)! : Number.MAX_SAFE_INTEGER;
          const bIndex = orderMap.has(b.id) ? orderMap.get(b.id)! : Number.MAX_SAFE_INTEGER;
          
          if (aIndex === Number.MAX_SAFE_INTEGER && bIndex === Number.MAX_SAFE_INTEGER) {
            // Both items are new, sort by creation date (newest first)
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          
          return aIndex - bIndex;
        });
      } else {
        // In list view or if no custom order, sort by creation date (newest first)
        orderedIdeas.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      
      setSortedIdeas(orderedIdeas);
    } else {
      setSortedIdeas([]);
    }
  }, [ideas, customOrder, view]);
  
  function handleFilterChange(newFilter: Partial<typeof filter>) {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }
  
  function handleCreateIdea(newIdea: Idea) {
    fetchIdeas();
    setIsNewIdeaOpen(false);
  }
  
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      setSortedIdeas((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over?.id);
        
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Save the new order to localStorage
        const newCustomOrder = newOrder.map(item => item.id);
        localStorage.setItem('ideasOrder', JSON.stringify(newCustomOrder));
        setCustomOrder(newCustomOrder);
        
        return newOrder;
      });
    }
  }

  const hasFilters = filter.search !== '' || filter.tag !== 'all';
  
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
          tags={allTags}
          filter={filter}
          onChange={handleFilterChange}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : sortedIdeas.length === 0 ? (
        <EmptyState 
          hasFilters={hasFilters}
          onCreateNew={() => setIsNewIdeaOpen(true)}
        />
      ) : (
        <div>
          {view === 'grid' ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedIdeas.map(idea => idea.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedIdeas.map(idea => (
                    <IdeaCard 
                      key={idea.id} 
                      idea={idea} 
                      categories={categories}
                      onUpdate={fetchIdeas}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <IdeaList 
              ideas={sortedIdeas} 
              categories={categories}
              onUpdate={fetchIdeas}
            />
          )}
        </div>
      )}
      
      <NewIdeaDialog 
        isOpen={isNewIdeaOpen}
        onClose={() => {
          setIsNewIdeaOpen(false);
          setUseAI(false); // Reset AI mode when closing
        }}
        onCreate={handleCreateIdea}
        categories={categories}
        useAI={useAI}
      />
    </div>
  );
}
