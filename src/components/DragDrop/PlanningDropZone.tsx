
import { useNavigate } from 'react-router-dom';
import DroppableZone from './DroppableZone';
import { FileText } from 'lucide-react';

interface PlanningDropZoneProps {
  projectId: string;
}

export default function PlanningDropZone({ projectId }: PlanningDropZoneProps) {
  const navigate = useNavigate();

  const handleDrop = (data: any) => {
    if (data?.type === 'idea') {
      // Handle idea drop to initiate planning
      console.log('Planning requested for idea:', data.idea.title);
      // Navigate to planning page with idea ID
      navigate(`/projects/${projectId}/planning?ideaId=${data.idea.id}`);
    }
  };

  return (
    <DroppableZone
      id="project-planning"
      acceptTypes={['idea']}
      onDrop={handleDrop}
      className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px] flex flex-col items-center justify-center"
    >
      <div className="text-center">
        <FileText className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="font-medium">Drag an idea here to plan</h3>
        <p className="text-sm text-gray-500 mt-1">
          Generate timelines, resources, and technical architecture
        </p>
      </div>
    </DroppableZone>
  );
}
