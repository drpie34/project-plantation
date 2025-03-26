
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Idea, IdeaCategory } from '@/types/supabase';
import { format } from 'date-fns';
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
import { MoreHorizontal, Edit, Trash, ArrowRight } from 'lucide-react';

interface IdeaCardProps {
  idea: Idea;
  categories: IdeaCategory[];
  onUpdate: () => void;
}

export default function IdeaCard({ idea, categories, onUpdate }: IdeaCardProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    developing: 'bg-yellow-100 text-yellow-800',
    ready: 'bg-green-100 text-green-800',
    archived: 'bg-red-100 text-red-800'
  };
  
  function handleViewDetails() {
    navigate(`/projects/${idea.project_id}/ideas/${idea.id}`);
  }
  
  function handleResearch() {
    // Navigate to research page with this idea pre-selected
    navigate(`/projects/${idea.project_id}/market-research?ideaId=${idea.id}`);
  }
  
  function handlePlan() {
    // Navigate to planning page with this idea pre-selected
    navigate(`/projects/${idea.project_id}/planning?ideaId=${idea.id}`);
  }
  
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
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
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleViewDetails}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>View & Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleResearch}>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  <span>Research Market</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePlan}>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  <span>Create Project Plan</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600"
                onClick={() => {
                  // Handle delete logic would go here
                  // For now, we'll just log
                  console.log('Delete:', idea.id);
                }}
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{idea.description}</p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge className={statusColors[idea.status] || 'bg-gray-100'}>
            {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
          </Badge>
          
          {idea.tags && idea.tags.length > 0 && (
            idea.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))
          )}
          
          {idea.tags && idea.tags.length > 2 && (
            <Badge variant="outline">+{idea.tags.length - 2} more</Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 border-t flex justify-end">
        <Button variant="ghost" size="sm" onClick={handleViewDetails}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
