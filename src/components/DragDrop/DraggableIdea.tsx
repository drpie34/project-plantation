
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardTitle, CardContent, Badge } from '@/components/ui';
import { Idea } from '@/types/supabase';
import { ReactNode } from 'react';

interface DraggableIdeaProps {
  idea: Idea;
  children?: ReactNode;
}

export default function DraggableIdea({ idea, children }: DraggableIdeaProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `idea-${idea.id}`,
    data: {
      type: 'idea',
      idea,
    },
  });
  
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };
  
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children ? (
        children
      ) : (
        <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <CardTitle className="text-sm font-medium">{idea.title}</CardTitle>
            <div className="mt-2">
              <Badge variant="outline" className={
                idea.status === 'ready' ? 'bg-green-50 text-green-700' :
                idea.status === 'developing' ? 'bg-blue-50 text-blue-700' :
                idea.status === 'archived' ? 'bg-gray-50 text-gray-700' :
                'bg-yellow-50 text-yellow-700'
              }>
                {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
