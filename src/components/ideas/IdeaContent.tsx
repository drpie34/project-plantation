
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Idea } from '@/types/supabase';

interface IdeaContentProps {
  idea: Idea;
}

const IdeaContent = ({ idea }: IdeaContentProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium text-sm text-muted-foreground mb-1">Description</h3>
        <p className="text-base">{idea.description || 'No description provided'}</p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium text-sm text-muted-foreground mb-1">Target Audience</h3>
          <p className="text-base">{idea.target_audience || 'Not specified'}</p>
        </div>
        <div>
          <h3 className="font-medium text-sm text-muted-foreground mb-1">Problem Solved</h3>
          <p className="text-base">{idea.problem_solved || 'Not specified'}</p>
        </div>
      </div>

      {idea.ai_generated_data && (
        <>
          <Separator />
          {idea.ai_generated_data.key_features && idea.ai_generated_data.key_features.length > 0 && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-2">Key Features</h3>
              <ul className="list-disc pl-5 space-y-1">
                {idea.ai_generated_data.key_features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {idea.ai_generated_data.revenue_model && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-1">Revenue Model</h3>
              <p className="text-base">{idea.ai_generated_data.revenue_model}</p>
            </div>
          )}
        </>
      )}

      {idea.tags && idea.tags.length > 0 && (
        <div>
          <h3 className="font-medium text-sm text-muted-foreground mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {idea.tags.map((tag, index) => (
              <Badge key={index} variant="outline">{tag}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeaContent;
