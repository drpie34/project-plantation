import { Button } from '@/components/ui/button';
import { Edit, Trash, BarChart, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface IdeaActionsProps {
  projectId: string;
  ideaId: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const IdeaActions = ({ projectId, ideaId, onEdit, onDelete }: IdeaActionsProps) => {
  const navigate = useNavigate();

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div className="flex justify-between items-center mt-6">
      <div className="flex gap-2">
        <Button 
          variant="outline"
          onClick={() => navigate(`/projects/${projectId}/market-research?ideaId=${ideaId}`)}
        >
          <BarChart className="h-4 w-4 mr-2" />
          Research Market
        </Button>
        <Button 
          variant="outline"
          onClick={() => navigate(`/projects/${projectId}/planning?ideaId=${ideaId}`)}
        >
          <FileText className="h-4 w-4 mr-2" />
          Create Plan
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
};

export default IdeaActions;
