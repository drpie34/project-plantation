
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { DragDropProvider } from './DragDropProvider';
import ResearchDropZone from './ResearchDropZone';
import PlanningDropZone from './PlanningDropZone';
import DraggableIdea from './DraggableIdea';
import { Idea } from '@/types/supabase';

interface InterconnectivitySectionProps {
  projectId: string;
  ideas: Idea[];
}

export default function InterconnectivitySection({ projectId, ideas }: InterconnectivitySectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Seamless Interconnectivity</CardTitle>
      </CardHeader>
      <CardContent>
        <DragDropProvider>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium mb-3">Draggable Ideas</h3>
              <div className="space-y-2">
                {ideas.length > 0 ? (
                  ideas.slice(0, 3).map((idea) => (
                    <DraggableIdea key={idea.id} idea={idea} />
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No ideas available</p>
                )}
              </div>
              {ideas.length > 3 && (
                <p className="text-xs text-gray-500 mt-2">
                  Drag any idea to the zones on the right
                </p>
              )}
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Research Zone</h3>
              <ResearchDropZone projectId={projectId} />
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Planning Zone</h3>
              <PlanningDropZone projectId={projectId} />
            </div>
          </div>
        </DragDropProvider>
      </CardContent>
    </Card>
  );
}
