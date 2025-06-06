
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Idea, IdeaCategory } from '@/types/supabase';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash, ArrowRight, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface IdeaCardProps {
  idea: Idea;
  categories: IdeaCategory[];
  onUpdate: () => void;
}

export default function IdeaCard({ idea, categories, onUpdate }: IdeaCardProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Set up sortable behavior
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: idea.id,
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1
  };
  
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    developing: 'bg-yellow-100 text-yellow-800',
    ready: 'bg-green-100 text-green-800',
    archived: 'bg-red-100 text-red-800'
  };
  
  function handleViewDetails() {
    navigate(`/ideas/${idea.id}`);
  }
  
  function handleStartProject() {
    navigate(`/projects/formation?ideaId=${idea.id}`, { state: { from: '/ideas' } });
  }
  
  return (
    <div ref={setNodeRef} style={style} className="relative">
      <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
        {/* Dedicated draggable area at the top of the card */}
        <div 
          className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg cursor-move flex items-center justify-center"
          {...attributes}
          {...listeners}
        >
          <div className="flex items-center justify-center w-full h-full">
            <div className="w-10 h-1 bg-blue-200 rounded-full"></div>
          </div>
        </div>
        
        <CardHeader className="pt-8 pb-2"> {/* Added padding to account for drag handle */}
          <div className="flex justify-between items-start">
            <div>
              <CardTitle 
                className="cursor-pointer hover:text-primary transition-colors"
                onClick={handleViewDetails}
              >
                {idea.title}
              </CardTitle>
              <CardDescription className="mt-1">
                {format(new Date(idea.created_at), 'MMM d, yyyy')}
              </CardDescription>
            </div>
            
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={handleViewDetails}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>View & Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleStartProject}>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    <span>Start Project</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600"
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from('ideas')
                        .delete()
                        .eq('id', idea.id);
                      
                      if (error) throw error;
                      
                      // Trigger refresh of ideas list
                      onUpdate();
                    } catch (error) {
                      console.error('Error deleting idea:', error);
                    }
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        {/* Clickable card content */}
        <CardContent 
          className="flex-grow cursor-pointer"
          onClick={handleViewDetails}
        >
          <p className="text-sm text-muted-foreground line-clamp-3">{idea.description}</p>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {idea.tags && idea.tags.length > 0 && (
              idea.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))
            )}
          </div>
        </CardContent>
        
        <CardFooter className="pt-2 border-t flex justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleViewDetails}
          >
            View Details
          </Button>
          <Button 
            size="sm" 
            onClick={handleStartProject}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Start Project
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
