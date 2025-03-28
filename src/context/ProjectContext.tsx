import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Document, Project } from '@/types/supabase';
import { documentService } from '@/services/documentService';
import { useAuth } from './AuthContext';

export type ProjectContextType = {
  project: Project | null;
  setProject: React.Dispatch<React.SetStateAction<Project | null>>;
  documents: Document[];
  isLoading: boolean;
  isLoadingDocuments: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  fetchProject: (projectId: string) => Promise<void>;
  fetchDocuments: () => Promise<void>;
  updateProject: (updates: Partial<Project>) => Promise<void>;
  uploadDocument: (file: File, title?: string) => Promise<Document | null>;
  deleteDocument: (documentId: string) => Promise<boolean>;
  downloadDocument: (document: Document) => void;
  errors: Record<string, string | null>;
};

export const ProjectContext = createContext<ProjectContextType | null>(null);

export const ProjectProvider: React.FC<{ children: ReactNode; projectId?: string }> = ({ 
  children, 
  projectId 
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [errors, setErrors] = useState<Record<string, string | null>>({
    project: null,
    documents: null
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch the project and documents when projectId changes
  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    }
  }, [projectId]);
  
  // Fetch documents after the project is loaded
  useEffect(() => {
    if (project && projectId) {
      fetchDocuments();
    }
  }, [project, projectId]);
  
  const fetchProject = async (projectId: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (error) {
        setErrors(prev => ({ ...prev, project: error.message }));
        throw error;
      }
      
      setProject(data as Project);
      setErrors(prev => ({ ...prev, project: null }));
    } catch (error: any) {
      console.error('Error fetching project:', error);
      toast({
        title: 'Error',
        description: 'Failed to load project',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchDocuments = async () => {
    if (!project?.id) return;
    
    setIsLoadingDocuments(true);
    
    try {
      const docs = await documentService.getProjectDocuments(project.id);
      setDocuments(docs);
      setErrors(prev => ({ ...prev, documents: null }));
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      setErrors(prev => ({ ...prev, documents: error.message }));
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingDocuments(false);
    }
  };
  
  const updateProject = async (updates: Partial<Project>) => {
    if (!project?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', project.id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      setProject(data as Project);
      toast({
        title: 'Success',
        description: 'Project updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project',
        variant: 'destructive',
      });
    }
  };
  
  const uploadDocument = async (file: File, title?: string): Promise<Document | null> => {
    if (!project?.id || !user) {
      toast({
        title: 'Error',
        description: 'Cannot upload document without a project or user',
        variant: 'destructive',
      });
      return null;
    }
    
    try {
      const newDocument = await documentService.uploadDocument(
        file,
        user.id,
        project.id,
        title
      );
      
      if (newDocument) {
        // Update documents list with new document
        setDocuments(prevDocs => [newDocument, ...prevDocs]);
        
        toast({
          title: 'Success',
          description: 'Document uploaded successfully',
        });
        
        return newDocument;
      }
      
      throw new Error('Document could not be uploaded');
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload document',
        variant: 'destructive',
      });
      return null;
    }
  };
  
  const deleteDocument = async (documentId: string): Promise<boolean> => {
    try {
      const success = await documentService.deleteDocument(documentId);
      
      if (success) {
        // Remove the document from the list
        setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== documentId));
        
        toast({
          title: 'Success',
          description: 'Document deleted successfully',
        });
        
        return true;
      }
      
      throw new Error('Document could not be deleted');
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
      return false;
    }
  };
  
  const downloadDocument = (document: Document) => {
    // If document has a file path, open in new tab
    if (document.file_path) {
      window.open(document.file_path, '_blank');
      return;
    }
    
    // Otherwise create a text file from content
    const blob = new Blob([document.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${document.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const value = {
    project,
    setProject,
    documents,
    isLoading,
    isLoadingDocuments,
    activeTab,
    setActiveTab,
    fetchProject,
    fetchDocuments,
    updateProject,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    errors
  };
  
  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};