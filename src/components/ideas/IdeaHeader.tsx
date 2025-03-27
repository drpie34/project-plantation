
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Idea } from '@/types/supabase';

interface IdeaHeaderProps {
  idea: Idea;
  projectId: string;
}

const IdeaHeader = ({ idea, projectId }: IdeaHeaderProps) => {
  const navigate = useNavigate();
  
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    developing: 'bg-yellow-100 text-yellow-800',
    ready: 'bg-green-100 text-green-800',
    archived: 'bg-red-100 text-red-800'
  };

  return (
    <div className="flex items-center mb-6">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate(`/projects/${projectId}`)}
        className="mr-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>
      <h1 className="text-3xl font-bold">{idea.title}</h1>
      <div className="ml-auto">
        <Badge className={statusColors[idea.status] || 'bg-gray-100'}>
          {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
        </Badge>
      </div>
    </div>
  );
};

export default IdeaHeader;
