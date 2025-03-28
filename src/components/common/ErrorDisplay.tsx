import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type ErrorDisplayProps = {
  title?: string;
  error: string;
  retry?: () => void;
  className?: string;
};

/**
 * Consistent error display component used throughout the application
 */
export const ErrorDisplay = ({
  title = 'An error occurred',
  error,
  retry,
  className = ''
}: ErrorDisplayProps) => {
  return (
    <Alert variant="destructive" className={`${className}`}>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="text-sm">{error}</div>
        {retry && (
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={retry}
          >
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};