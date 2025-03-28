import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
};

/**
 * Consistent empty state component used throughout the application
 */
export const EmptyState = ({
  title,
  description,
  icon,
  action,
  className = ''
}: EmptyStateProps) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};