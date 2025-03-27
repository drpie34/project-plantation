
import { useDroppable } from '@dnd-kit/core';
import { useDragDrop } from './DragDropProvider';
import { ReactNode } from 'react';

interface DroppableZoneProps {
  id: string;
  acceptTypes?: string[];
  onDrop?: (data: any) => void;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
}

export default function DroppableZone({ 
  id, 
  acceptTypes = [],
  onDrop,
  children,
  className = '',
  activeClassName = 'bg-blue-50 border-blue-300'
}: DroppableZoneProps) {
  const { dragData } = useDragDrop();
  const { isOver, setNodeRef } = useDroppable({
    id: `dropzone-${id}`
  });
  
  // Check if the current dragged item is acceptable
  const isAcceptable = !dragData || acceptTypes.includes(dragData.type);
  const isActive = isOver && isAcceptable;
  
  return (
    <div 
      ref={setNodeRef} 
      className={`
        transition-colors duration-200
        ${className}
        ${isActive ? activeClassName : ''}
        ${!isAcceptable ? 'cursor-no-drop' : ''}
      `}
    >
      {children}
    </div>
  );
}
