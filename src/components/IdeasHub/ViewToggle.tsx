
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

const ViewToggle = ({ view, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex border rounded-md">
      <Button 
        variant={view === 'grid' ? 'default' : 'ghost'} 
        size="icon" 
        onClick={() => onViewChange('grid')}
        className="h-9 w-9"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button 
        variant={view === 'list' ? 'default' : 'ghost'} 
        size="icon" 
        onClick={() => onViewChange('list')}
        className="h-9 w-9"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ViewToggle;
