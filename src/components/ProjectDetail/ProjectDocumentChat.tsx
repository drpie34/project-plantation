import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import DocumentChat from '@/components/DocumentHub/DocumentChat';

interface ProjectDocumentChatProps {
  projectId: string;
  onClose: () => void;
  onSaveTranscript: (title: string, content: string) => Promise<any>;
}

export default function ProjectDocumentChat({
  projectId,
  onClose,
  onSaveTranscript
}: ProjectDocumentChatProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative w-full max-w-4xl h-[80vh] bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold">Document Chat</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="h-[calc(80vh-64px)] overflow-auto">
          <DocumentChat 
            projectId={projectId} 
            onSaveTranscript={onSaveTranscript}
            onClose={onClose} 
          />
        </div>
      </div>
    </div>
  );
}