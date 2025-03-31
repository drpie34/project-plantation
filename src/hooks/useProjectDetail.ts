import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Document, Idea, Project } from '@/types/supabase';
import { documentService } from '@/services/documentService';
import { useErrorHandler } from '@/services/errorService';
import { databaseService } from '@/services/databaseService';

export interface ProjectWithCollaboration {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  stage: 'ideation' | 'planning' | 'development' | 'launched';
  created_at: string;
  updated_at: string;
  is_collaborative: boolean;
  collaborators: string[];
  collaboration_settings: {
    permissions: 'view' | 'comment' | 'edit';
  };
}

export const useProjectDetail = (projectId: string | undefined) => {
  const [project, setProject] = useState<ProjectWithCollaboration | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [overviewDocument, setOverviewDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  
  // Section content for the overview document
  const [sectionContent, setSectionContent] = useState<Record<string, string>>({
    description: '',
    goals: '',
    features: '',
    considerations: '',
  });
  
  const [editMode, setEditMode] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch project details
  const fetchProject = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      // Use our database service to get project by ID
      const { data, error } = await databaseService.getById<Project>('projects', projectId);

      if (error) throw error;
      if (!data) throw new Error('Project not found');
      
      const projectData: ProjectWithCollaboration = {
        id: data.id,
        user_id: data.user_id,
        title: data.title,
        description: data.description || null,
        stage: data.stage as 'ideation' | 'planning' | 'development' | 'launched',
        created_at: data.created_at,
        updated_at: data.updated_at,
        is_collaborative: data.is_collaborative || false,
        collaborators: data.collaborators || [],
        collaboration_settings: data.collaboration_settings 
          ? { permissions: (data.collaboration_settings as any).permissions as 'view' | 'comment' | 'edit' } 
          : { permissions: 'view' }
      };
      
      setProject(projectData);
    } catch (error: any) {
      handleError('ProjectDetail', 'fetchProject', error, {
        projectId
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch ideas for this project
  const fetchIdeas = async () => {
    if (!projectId) return;
    
    try {
      // Use our database service to get ideas for this project
      const { data, error } = await databaseService.getAll<Idea>(
        'ideas',
        [{ column: 'project_id', operation: 'eq', value: projectId }],
        { orderBy: { column: 'created_at', ascending: false } }
      );

      if (error) throw error;
      
      if (data) {
        const ideasData: Idea[] = data.map(item => ({
          id: item.id,
          project_id: item.project_id,
          title: item.title,
          description: item.description || null,
          target_audience: item.target_audience || null,
          problem_solved: item.problem_solved || null,
          ai_generated_data: item.ai_generated_data,
          created_at: item.created_at,
          status: item.status as 'draft' | 'developing' | 'ready' | 'archived',
          tags: item.tags || [],
          inspiration_sources: (item.inspiration_sources || {}) as Record<string, any>,
          collaboration_settings: (item.collaboration_settings || { visibility: 'private' }) as { 
            visibility: 'private' | 'team' | 'public' 
          },
          version: item.version || 1,
          version_history: (item.version_history || []) as Record<string, any>[]
        }));
        
        setIdeas(ideasData);
      }
    } catch (error: any) {
      handleError('ProjectDetail', 'fetchIdeas', error, {
        projectId
      }, false); // Don't show a toast for this one
    }
  };

  // Fetch documents for this project
  const fetchDocuments = async () => {
    try {
      if (!projectId) {
        return;
      }
      
      // Use our document service to get project documents
      const docs = await documentService.getProjectDocuments(projectId);
      
      // Check if we have a project_overview document
      const overviewDocs = docs.filter(doc => doc.type === 'project_overview');
      const hasOverview = overviewDocs.length > 0;
      
      // If we don't have an overview document, create one right away
      if (!hasOverview && user && project) {
        const newOverviewDoc = await ensureProjectOverviewDocument();
        if (newOverviewDoc) {
          // Add the new document to our list and we're done
          docs.push(newOverviewDoc);
        }
      }
      
      // Set the documents in state - we'll update section content in its own effect
      setDocuments(docs);
      
      // Update the overview document reference for direct access
      const latestOverviewDoc = docs.find(doc => doc.type === 'project_overview');
      if (latestOverviewDoc) {
        setOverviewDocument(latestOverviewDoc);
      }
    } catch (error: any) {
      handleError('ProjectDetail', 'fetchDocuments', error, {
        projectId
      });
      
      // If we fail here but have the prerequisites, try to create a document directly
      if (!overviewDocument && user && project && projectId) {
        try {
          const emergencyDoc = await ensureProjectOverviewDocument();
          if (emergencyDoc) {
            setDocuments([emergencyDoc]);
            setOverviewDocument(emergencyDoc);
          }
        } catch (e) {
          handleError('ProjectDetail', 'fetchDocumentsEmergency', e, { projectId }, false);
        }
      }
    }
  };

  // Create project overview document if needed
  const ensureProjectOverviewDocument = async () => {
    if (!user || !projectId || !project) {
      return null;
    }
    
    try {
      // Create initial sections content - using simple content for reliability
      const initialSections = {
        description: project.description || 'Add your project description here.',
        goals: 'Define the main goals for your project.',
        features: 'List the key features your project will include.',
        considerations: 'Note any technical requirements, challenges, or important considerations.'
      };
      
      // Create a simpler and more reliable document format with absolutely minimal structure
      // Each section is cleanly separated with plenty of whitespace to avoid parsing issues
      const content = `# ${project?.title || 'Project Plan'}

<!-- SECTION:description -->
${initialSections.description}
<!-- END:description -->

<!-- SECTION:goals -->
${initialSections.goals}
<!-- END:goals -->

<!-- SECTION:features -->
${initialSections.features}
<!-- END:features -->

<!-- SECTION:considerations -->
${initialSections.considerations}
<!-- END:considerations -->`;
      
      // Create the document with retry logic
      let newDocument = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!newDocument && attempts < maxAttempts) {
        attempts++;
        try {
          newDocument = await documentService.createDocument({
            title: 'Project Overview',
            type: 'project_overview',
            content,
            project_id: projectId,
            user_id: user.id,
            is_auto_generated: true
          });
          
        } catch (createError) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // If we have a document, verify it was stored correctly
      if (newDocument) {
        try {
          // Check for markers in the stored document
          const descStart = newDocument.content.indexOf('<!-- SECTION:description -->');
          const descEnd = newDocument.content.indexOf('<!-- END:description -->');
          const goalStart = newDocument.content.indexOf('<!-- SECTION:goals -->');
          
          // If somehow the content doesn't have markers, update it immediately
          if (descStart === -1 || descEnd === -1 || goalStart === -1) {
            const fixedDoc = await documentService.updateDocument(newDocument.id, { content });
            if (fixedDoc) {
              newDocument = fixedDoc;
            }
          }
        } catch (verifyError) {
          // Continue anyway, we at least have the document
        }
      }
      
      return newDocument;
    } catch (error) {
      handleError('ProjectDetail', 'ensureProjectOverviewDocument', error, { projectId }, false);
      return null;
    }
  };

  // Check and migrate legacy documents
  const checkAndMigrateDocuments = async () => {
    if (!projectId || !user) {
      return;
    }
    
    try {
      // Get all documents for this project
      const docs = await documentService.getProjectDocuments(projectId);
      
      // 1. First, delete any legacy documents (we don't need them anymore)
      const legacyDocs = docs.filter(doc => 
        doc.type === 'project' || 
        doc.title === 'Document - project' ||
        doc.type === 'project_description' ||
        doc.type === 'project_goals' ||
        doc.type === 'project_features' ||
        doc.type === 'project_considerations' ||
        (doc.type !== 'project_overview' && doc.title && doc.title.includes('Project')) ||
        (doc.id && doc.id.includes('local_'))
      );
      
      if (legacyDocs.length > 0) {
        for (const doc of legacyDocs) {
          try {
            await documentService.deleteDocument(doc.id);
          } catch (deleteError) {
            // Continue with other documents
          }
        }
      }
      
      // 2. Check if we have a project_overview document
      const overviewDocs = docs.filter(doc => doc.type === 'project_overview');
      
      if (overviewDocs.length === 0) {
        await ensureProjectOverviewDocument();
      } else if (overviewDocs.length > 1) {
        // If we have multiple overview documents, keep the most recent one
        
        // Sort by updated_at descending
        const sortedDocs = [...overviewDocs].sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        
        // Keep the first one, delete the rest
        for (let i = 1; i < sortedDocs.length; i++) {
          try {
            await documentService.deleteDocument(sortedDocs[i].id);
          } catch (deleteError) {
            // Continue with deletion
          }
        }
      }
    } catch (error) {
      handleError('ProjectDetail', 'checkAndMigrateDocuments', error, { projectId }, false);
    }
  };

  // Parse document content with section markers
  const parseDocumentSections = (content: string): Record<string, string> => {
    // Initialize with default content
    const sections: Record<string, string> = {
      description: 'No description provided yet.',
      goals: 'No goals defined yet.',
      features: 'No key features defined yet.',
      considerations: 'No additional considerations defined yet.'
    };
    
    // Guard against empty content
    if (!content || content.trim() === '') {
      return sections;
    }
    
    try {
      // ABSOLUTE MINIMUM APPROACH - no helper functions, just direct extraction
      // Description section
      const descStart = content.indexOf('<!-- SECTION:description -->');
      const descEnd = content.indexOf('<!-- END:description -->');
      
      if (descStart !== -1 && descEnd !== -1 && descStart < descEnd) {
        const extracted = content.substring(
          descStart + '<!-- SECTION:description -->'.length, 
          descEnd
        ).trim();
        if (extracted) {
          sections.description = extracted;
        }
      }
      
      // Goals section
      const goalsStart = content.indexOf('<!-- SECTION:goals -->');
      const goalsEnd = content.indexOf('<!-- END:goals -->');
      
      if (goalsStart !== -1 && goalsEnd !== -1 && goalsStart < goalsEnd) {
        const extracted = content.substring(
          goalsStart + '<!-- SECTION:goals -->'.length, 
          goalsEnd
        ).trim();
        if (extracted) {
          sections.goals = extracted;
        }
      }
      
      // Features section
      const featuresStart = content.indexOf('<!-- SECTION:features -->');
      const featuresEnd = content.indexOf('<!-- END:features -->');
      
      if (featuresStart !== -1 && featuresEnd !== -1 && featuresStart < featuresEnd) {
        const extracted = content.substring(
          featuresStart + '<!-- SECTION:features -->'.length, 
          featuresEnd
        ).trim();
        if (extracted) {
          sections.features = extracted;
        }
      }
      
      // Considerations section
      const considStart = content.indexOf('<!-- SECTION:considerations -->');
      const considEnd = content.indexOf('<!-- END:considerations -->');
      
      if (considStart !== -1 && considEnd !== -1 && considStart < considEnd) {
        const extracted = content.substring(
          considStart + '<!-- SECTION:considerations -->'.length, 
          considEnd
        ).trim();
        if (extracted) {
          sections.considerations = extracted;
        }
      }
    } catch (error) {
      // Error in parsing document sections
    }
    
    // Return the extracted sections
    return sections;
  };

  // Save document
  const saveDocument = async () => {
    if (!overviewDocument || !user) {
      // Cannot update document without document or user
      return false;
    }
    
    try {
      setIsSaving(true);
      
      // Format document content with proper section markers
      // Keep it super simple with clear section separations
      const content = `# ${project?.title || 'Project Plan'}

<!-- SECTION:description -->
${sectionContent.description || 'No description provided yet.'}
<!-- END:description -->

<!-- SECTION:goals -->
${sectionContent.goals || 'No goals defined yet.'}
<!-- END:goals -->

<!-- SECTION:features -->
${sectionContent.features || 'No key features defined yet.'}
<!-- END:features -->

<!-- SECTION:considerations -->
${sectionContent.considerations || 'No additional considerations defined yet.'}
<!-- END:considerations -->`;
      
      // Ensure content has proper section markers
      
      try {
        // First try the normal update path
        const updatedDocument = await documentService.updateDocument(
          overviewDocument.id,
          { content }
        );
        
        if (updatedDocument) {
          // Update the local document state
          setOverviewDocument(updatedDocument);
          
          // Update documents list
          fetchDocuments();
          
          // Exit edit mode
          setEditMode(null);
          return true;
        }
      } catch (updateError) {
        // Normal update failed, falling back to localStorage
        // Continue to localStorage fallback
      }
      
      // FALLBACK: If we got here, try the localStorage approach
      try {
        // Check if this is a localStorage document
        if (overviewDocument.id.startsWith('local_')) {
          // Direct localStorage update
          const key = `document_${projectId}_project_overview`;
          localStorage.setItem(key, content);
          
          // Create an updated document object
          const updatedLocalDoc = {
            ...overviewDocument,
            content,
            updated_at: new Date().toISOString()
          };
          
          // Update state
          setOverviewDocument(updatedLocalDoc);
          
          // Force update documents list
          fetchDocuments();
          
          // Exit edit mode
          setEditMode(null);
          return true;
        }
      } catch (localStorageError) {
        // localStorage fallback failed
        throw localStorageError;
      }
      
      // If we got here, both approaches failed
      throw new Error('Failed to update document with any method');
    } catch (error: any) {
      // Error handled with handleError
      handleError('ProjectDetail', 'handleSaveDocument', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Handle editing a section
  const handleEditSection = (section: string) => {
    setEditMode(section);
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    if (overviewDocument) {
      // Reset to the original content from the document
      const sections = parseDocumentSections(overviewDocument.content);
      setSectionContent(sections);
    }
    setEditMode(null);
  };

  // Handle content change for a section
  const handleSectionChange = (section: string, content: string) => {
    setSectionContent(prev => ({
      ...prev,
      [section]: content
    }));
  };

  // Effect to initialize data
  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchIdeas();
    }
  }, [projectId]);

  // Effect to fetch and migrate documents after project is loaded
  useEffect(() => {
    if (project && projectId) {
      // Fetch documents and ensure a project overview exists
      const init = async () => {
        try {
          // First fetch existing documents
          const docs = await documentService.getProjectDocuments(projectId);
          
          // Check explicitly for a valid project_overview document
          const overviewDocs = docs.filter(doc => doc.type === 'project_overview');
          const hasValidOverviewDoc = overviewDocs.some(doc => {
            // Verify that this document actually has valid section markers
            const hasDescription = doc.content.includes('<!-- SECTION:description -->') && 
                                 doc.content.includes('<!-- END:description -->');
            const hasGoals = doc.content.includes('<!-- SECTION:goals -->') && 
                          doc.content.includes('<!-- END:goals -->');
            return hasDescription && hasGoals; // Basic check for at least these two sections
          });
          
          
          if (!hasValidOverviewDoc) {
            // No valid overview document found, create one
            
            // First, clean up any existing documents to avoid duplicates
            if (overviewDocs.length > 0) {
              // Remove existing invalid documents first
              for (const doc of overviewDocs) {
                try {
                  await documentService.deleteDocument(doc.id);
                } catch (deleteError) {
                  // Failed to delete invalid document
                }
              }
            }
            
            // Create a new document since none exists or all existing ones are invalid
            const newDoc = await ensureProjectOverviewDocument();
            if (newDoc) {
              // Add to our docs array
              docs.push(newDoc);
            }
          }
          
          // Now clean up any legacy documents
          if (docs.length > 0) {
            await checkAndMigrateDocuments();
          }
          
          // Final fetch to ensure state is up to date
          await fetchDocuments();
        } catch (error) {
          handleError('ProjectDetail', 'initDocuments', error, { projectId }, false);
          // Try one more time to create a document
          try {
            // Force cleanup any existing documents first
            await checkAndMigrateDocuments();
            
            // Create a completely new document in recovery mode
            const newDoc = await ensureProjectOverviewDocument();
            if (newDoc) {
              await fetchDocuments();
            }
          } catch (e) {
            handleError('ProjectDetail', 'recoveryInitialization', e, { projectId }, false);
          }
        }
      };
      
      init();
    }
  }, [project, projectId]);

  // Effect to update section content when documents change
  useEffect(() => {
    // Update sections when document state changes
    if (documents.length > 0) {
      const overview = documents.find(doc => doc.type === 'project_overview');
      if (overview) {
        // Process the overview document and extract sections
        
        setOverviewDocument(overview);
        const sections = parseDocumentSections(overview.content);
        setSectionContent(sections);
      }
    }
  }, [documents]);

  return {
    project,
    ideas,
    documents,
    overviewDocument,
    isLoading,
    sectionContent,
    editMode,
    isSaving,
    fetchProject,
    fetchIdeas,
    fetchDocuments,
    saveDocument,
    handleEditSection,
    handleCancelEdit,
    handleSectionChange,
    parseDocumentSections
  };
};