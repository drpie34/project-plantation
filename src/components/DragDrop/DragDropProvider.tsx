
import { useState, createContext, useContext, ReactNode } from 'react';
import { DndContext, useSensor, useSensors, PointerSensor, DndContextProps } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

type DragDropContextType = {
  activeId: string | null;
  dragData: any | null;
};

const DragDropContext = createContext<DragDropContextType>({
  activeId: null,
  dragData: null,
});

export function useDragDrop() {
  return useContext(DragDropContext);
}

interface DragDropProviderProps {
  children: ReactNode;
  onDragEnd?: DndContextProps['onDragEnd'];
}

export function DragDropProvider({ children, onDragEnd }: DragDropProviderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragData, setDragData] = useState<any | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
  function handleDragStart(event: any) {
    const { active } = event;
    setActiveId(active.id);
    
    // Extract the data attached to the draggable item
    if (active.data && active.data.current) {
      setDragData(active.data.current);
    }
  }
  
  function handleDragEnd(event: any) {
    const { active, over } = event;
    
    if (over) {
      // Process drop - this will be handled by the drop zones
      console.log(`Dropped ${active.id} over ${over.id}`);
      
      // Call custom onDragEnd if provided
      if (onDragEnd) {
        onDragEnd(event);
      }
    }
    
    setActiveId(null);
    setDragData(null);
  }
  
  const value = {
    activeId,
    dragData,
  };
  
  return (
    <DragDropContext.Provider value={value}>
      <DndContext
        sensors={sensors}
        modifiers={[restrictToWindowEdges]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children}
      </DndContext>
    </DragDropContext.Provider>
  );
}
