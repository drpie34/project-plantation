import { Idea } from '@/types/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface IdeasListProps {
  projectId: string;
  ideas: Idea[];
  onIdeasUpdate: () => Promise<void>;
}

export function IdeasList({ projectId, ideas, onIdeasUpdate }: IdeasListProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Project Ideas</h3>
        <Button
          onClick={() => navigate(`/projects/${projectId}/generate-ideas`)}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Generate Ideas
        </Button>
      </div>

      {ideas.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-gray-500">
              <p>No ideas generated yet.</p>
              <p className="text-sm mt-2">
                Click the button above to generate ideas for your project.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {ideas.map((idea) => (
            <Card key={idea.id}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <h4 className="font-medium">{idea.title}</h4>
                  <p className="text-sm text-gray-600">{idea.description}</p>
                  {idea.tags && idea.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {idea.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 