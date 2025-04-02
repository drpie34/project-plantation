
import { useNavigate } from 'react-router-dom';
import { Idea, IdeaCategory } from '@/types/supabase';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
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

interface IdeaListProps {
  ideas: Idea[];
  categories: IdeaCategory[];
  onUpdate: () => void;
}

export default function IdeaList({ ideas, categories, onUpdate }: IdeaListProps) {
  const navigate = useNavigate();
  
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    developing: 'bg-yellow-100 text-yellow-800',
    ready: 'bg-green-100 text-green-800',
    archived: 'bg-red-100 text-red-800'
  };
  
  function handleViewDetails(idea: Idea) {
    navigate(`/ideas/${idea.id}`);
  }
  
  function handleStartProject(idea: Idea) {
    navigate(`/projects/formation?ideaId=${idea.id}`);
  }
  
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ideas.map(idea => (
            <TableRow key={idea.id}>
              <TableCell className="font-medium cursor-pointer hover:text-primary" onClick={() => handleViewDetails(idea)}>
                {idea.title}
              </TableCell>
              <TableCell>{format(new Date(idea.created_at), 'MMM d, yyyy')}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-[300px]">
                  {idea.tags && idea.tags.length > 0 ? (
                    idea.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs py-0">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No tags</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => handleViewDetails(idea)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>View & Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStartProject(idea)}>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        <span>Start Project</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600 focus:text-red-600"
                      onClick={async () => {
                        try {
                          // Use the same delete logic as in IdeaCard
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
