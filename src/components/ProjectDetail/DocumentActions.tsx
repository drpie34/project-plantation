import { useState } from 'react';
import { Document } from '@/types/supabase';
import { documentService } from '@/services/documentService';
import { useErrorHandler } from '@/services/errorService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface DocumentActionsProps {
  projectId: string | undefined;
  documents: Document[];
  onDocumentsUpdated: () => Promise<void>;
}

export function useDocumentActions(projectId: string | undefined) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  
  const handleUploadDocument = async (file: File) => {
    try {
      if (!projectId || !user) {
        toast({
          title: 'Error',
          description: 'Missing project information',
          variant: 'destructive',
        });
        return;
      }
      
      // Use our document service to upload the document
      const newDocument = await documentService.uploadDocument(
        file,
        user.id,
        projectId
      );
      
      if (newDocument) {
        toast({
          title: 'Success',
          description: 'Document uploaded successfully',
        });
        
        return newDocument;
      } else {
        throw new Error('Failed to upload document');
      }
    } catch (error: any) {
      // Error handled with handleError
      handleError('DocumentActions', 'handleUploadDocument', error);
      return null;
    }
  };
  
  const handleDeleteDocument = async (documentId: string) => {
    try {
      // Use our document service to delete the document
      const success = await documentService.deleteDocument(documentId);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Document deleted successfully',
        });
        
        return true;
      } else {
        throw new Error('Failed to delete document');
      }
    } catch (error: any) {
      // Error handled with handleError
      handleError('DocumentActions', 'handleDeleteDocument', error);
      return false;
    }
  };
  
  const handleDownloadDocument = (document: Document) => {
    // If document has a file path, open in new tab
    if (document.file_path) {
      window.open(document.file_path, '_blank');
      return;
    }
    
    // Otherwise create a text file from content
    const blob = new Blob([document.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.title}.txt`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleSaveTranscript = async (title: string, content: string) => {
    try {
      if (!projectId || !user) {
        toast({
          title: 'Error',
          description: 'Missing project information',
          variant: 'destructive',
        });
        return null;
      }
      
      // Create a new document using our document service
      const newDocument = await documentService.createDocument({
        title,
        type: 'chat_transcript',
        content,
        project_id: projectId,
        user_id: user.id,
        is_auto_generated: false
      });
      
      if (newDocument) {
        toast({
          title: 'Success',
          description: 'Chat transcript saved successfully',
        });
        
        return newDocument;
      } else {
        throw new Error('Failed to save transcript');
      }
    } catch (error: any) {
      // Error handled with handleError
      handleError('DocumentActions', 'handleSaveTranscript', error);
      return null;
    }
  };

  return {
    handleUploadDocument,
    handleDeleteDocument,
    handleDownloadDocument,
    handleSaveTranscript
  };
}