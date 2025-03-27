
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  hasFilters: boolean;
  onCreateNew: () => void;
}

const EmptyState = ({ hasFilters, onCreateNew }: EmptyStateProps) => {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="text-center">
          <h3 className="text-lg font-medium">No ideas found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasFilters 
              ? "Try changing your filters" 
              : "Create your first idea to get started"}
          </p>
          {!hasFilters && (
            <Button 
              onClick={onCreateNew}
              className="mt-4"
            >
              Create New Idea
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
