
import { useNavigate } from 'react-router-dom';
import DroppableZone from './DroppableZone';
import { FileSearch } from 'lucide-react';

interface ResearchDropZoneProps {
  projectId: string;
}

export default function ResearchDropZone({ projectId }: ResearchDropZoneProps) {
  const navigate = useNavigate();

  const handleDrop = (data: any) => {
    if (data?.type === 'idea') {
      // Handle idea drop to initiate research
      console.log('Research requested for idea:', data.idea.title);
      // Navigate to research page with idea ID
      navigate(`/projects/${projectId}/market-research?ideaId=${data.idea.id}`);
    }
  };

  return (
    <DroppableZone
      id="market-research"
      acceptTypes={['idea']}
      onDrop={handleDrop}
      className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px] flex flex-col items-center justify-center"
    >
      <div className="text-center">
        <FileSearch className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="font-medium">Drag an idea here to research</h3>
        <p className="text-sm text-gray-500 mt-1">
          Our AI will analyze market opportunities for your idea
        </p>
      </div>
    </DroppableZone>
  );
}
