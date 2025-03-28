import { Badge } from "@/components/ui/badge";

type StatusType = 
  | 'ideation'
  | 'planning'
  | 'development'
  | 'launched'
  | 'draft'
  | 'developing'
  | 'ready'
  | 'archived'
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'low'
  | 'medium'
  | 'high';

type StatusBadgeProps = {
  status: StatusType;
  className?: string;
};

/**
 * A consistent status badge component with appropriate styling based on status
 */
export const StatusBadge = ({ status, className = '' }: StatusBadgeProps) => {
  const getStatusStyles = (status: StatusType) => {
    switch (status) {
      // Project stages
      case 'ideation':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'planning':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'development':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'launched':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      
      // Idea statuses
      case 'draft':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'developing':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'ready':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'archived':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      
      // Task statuses
      case 'pending':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      
      // Priority levels
      case 'low':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'high':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    // Convert snake_case to title case with spaces
    return status
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Badge 
      variant="outline" 
      className={`${getStatusStyles(status)} ${className}`}
    >
      {formatStatus(status)}
    </Badge>
  );
};