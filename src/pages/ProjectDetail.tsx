import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Separator,
  Textarea,
} from '@/components/ui';
import {
  ArrowLeft,
  PlusCircle,
  Settings,
  Share2,
  Trash2,
  Lightbulb,
  FileText,
  BarChart,
  FileSearch,
  Users,
  LayoutGrid as GanttIcon,
  MessageSquare,
  Folder,
  Code,
  Upload,
  Save,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { TabSystem, TabItem, PageHeader, CardContainer, LoadingSpinner, StatusBadge, EmbeddedPage } from '@/components/common';
import { databaseService } from '@/services/databaseService';
import { documentService } from '@/services/documentService';
import { useErrorHandler } from '@/services/errorService';
import { UI_CONFIG } from '@/config';
import { Project, Idea, Document } from '@/types/supabase';
import ProjectSharingDialog from '@/components/Collaboration/ProjectSharingDialog';
import CollaborationTabs from '@/components/Collaboration/CollaborationTabs';
import DocumentHub from '@/components/DocumentHub/DocumentHub';
import DocumentChat from '@/components/DocumentHub/DocumentChat';
import { IdeasList } from '@/components/Ideas/IdeasList';

// Add legacy document types
type LegacyDocumentType = 
  | 'project'
  | 'project_description'
  | 'project_goals'
  | 'project_features'
  | 'project_considerations';

type DocumentType = 
  | 'project_overview'
  | 'market_research'
  | 'project_planning'
  | 'design_development'
  | 'chat_transcript'
  | 'uploaded'
  | LegacyDocumentType;

interface ProjectWithCollaboration {
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

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<ProjectWithCollaboration | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDocumentChat, setShowDocumentChat] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [overviewDocument, setOverviewDocument] = useState<Document | null>(null);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [sectionContent, setSectionContent] = useState<Record<string, string>>({
    description: '',
    goals: '',
    features: '',
    considerations: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  
  // Get the tab from URL query params
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const tabParam = queryParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, []);

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchIdeas();
    }
  }, [projectId]);
  
  // Second useEffect to fetch documents after project has loaded
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
  
  // Helper function to clean up any legacy documents and ensure we have a project overview
  async function checkAndMigrateDocuments() {
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
  }
  
  // Update section content when documents are loaded
  useEffect(() => {
    // Update sections when document state changes
    if (documents.length > 0) {
      const overview = documents.find(doc => doc.type === 'project_overview');
      if (overview) {
        // Process the overview document and extract sections
        
        setOverviewDocument(overview);
        const sections = parseDocumentSections(overview.content);
        setSectionContent(sections);
        
        // Check if we have actual content in the sections
        const hasContent = Object.values(sections).some(value => 
          value && value !== 'No description provided yet.' && 
          value !== 'No goals defined yet.' && 
          value !== 'No key features defined yet.' && 
          value !== 'No additional considerations defined yet.'
        );
      } // end if overview
    }
  }, [documents]);
  
  // Parse document content with section markers - ultra minimalist approach
  function parseDocumentSections(content: string): Record<string, string> {
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
  }
  
  // Function to create a new project overview document if one doesn't exist
  async function ensureProjectOverviewDocument() {
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
  }

  async function fetchDocuments() {
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
  }

  async function fetchProject() {
    setIsLoading(true);
    try {
      // Use our database service to get project by ID
      const { data, error } = await databaseService.getById<Project>('projects', projectId || '');

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
      // handleError will log and show toast
      handleError('ProjectDetail', 'fetchProject', error, {
        projectId
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchIdeas() {
    try {
      if (!projectId) return;
      
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
      // handleError will log and show toast
      handleError('ProjectDetail', 'fetchIdeas', error, {
        projectId
      }, false); // Don't show a toast for this one
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The project you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
      </div>
    );
  }

  const getStageDisplay = (stage: string) => {
    return <StatusBadge status={stage as any} />;
  };

  const handleProjectUpdate = (updatedProject: ProjectWithCollaboration) => {
    setProject(updatedProject);
  };
  
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
        
        // Refresh documents
        fetchDocuments();
      } else {
        throw new Error('Failed to upload document');
      }
    } catch (error: any) {
      // Error handled with handleError
      handleError('ProjectDetail', 'handleUploadDocument', error);
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
        
        // Refresh documents
        fetchDocuments();
      } else {
        throw new Error('Failed to delete document');
      }
    } catch (error: any) {
      // Error handled with handleError
      handleError('ProjectDetail', 'handleDeleteDocument', error);
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
        return;
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
        
        // Refresh documents
        fetchDocuments();
      } else {
        throw new Error('Failed to save transcript');
      }
    } catch (error: any) {
      // Error handled with handleError
      handleError('ProjectDetail', 'handleSaveTranscript', error);
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
  
  // Save the updated document - simplified for reliability
  const handleSaveDocument = async () => {
    if (!overviewDocument || !user) {
      // Cannot update document without document or user
      return;
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
          toast({
            title: 'Success',
            description: 'Document updated successfully',
          });
          
          // Update the local document state
          setOverviewDocument(updatedDocument);
          
          // Update documents list
          fetchDocuments();
          
          // Exit edit mode
          setEditMode(null);
          return;
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
          
          toast({
            title: 'Success',
            description: 'Document saved to localStorage',
          });
          return;
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
      
      toast({
        title: 'Error',
        description: 'Failed to update document',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Define the tab items for our standardized TabSystem
  const tabItems: TabItem[] = [
    { 
      id: 'overview',
      label: 'Overview',
      icon: <FileText className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
              <CardDescription>
                Key information about your SaaS project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Display Project Overview Document */}
                {overviewDocument ? (
                  <div className="mt-6 border-t pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">Project Overview</h3>
                      {editMode ? (
                        <div className="space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={handleSaveDocument}
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <>
                                <LoadingSpinner size="small" className="mr-1" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-3 w-3 mr-1" />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditSection('description')}
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                    
                    {/* Description Section */}
                    <div className={`prose max-w-none ${editMode === 'description' ? 'bg-blue-100' : 'bg-blue-50'} border border-blue-100 rounded-lg p-4 relative`}>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-blue-800 font-medium">Description</h4>
                        {!editMode && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 px-2 text-blue-700"
                            onClick={() => handleEditSection('description')}
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                      
                      {editMode === 'description' ? (
                        <>
                          <Textarea
                            value={sectionContent.description}
                            onChange={(e) => handleSectionChange('description', e.target.value)}
                            className="min-h-[120px] text-sm mb-2"
                            placeholder="Enter project description..."
                          />
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={handleSaveDocument}
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <>
                                  <LoadingSpinner size="small" className="mr-1" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="h-3 w-3 mr-1" />
                                  Save Changes
                                </>
                              )}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div>
                          {sectionContent.description.split('\n').map((line, idx) => (
                            <p key={idx} className="text-sm">{line}</p>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Goals Section */}
                    <div className={`prose max-w-none ${editMode === 'goals' ? 'bg-green-100' : 'bg-green-50'} border border-green-100 rounded-lg p-4 relative`}>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-green-800 font-medium">Project Goals</h4>
                        {!editMode && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 px-2 text-green-700"
                            onClick={() => handleEditSection('goals')}
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                      
                      {editMode === 'goals' ? (
                        <>
                          <Textarea
                            value={sectionContent.goals}
                            onChange={(e) => handleSectionChange('goals', e.target.value)}
                            className="min-h-[120px] text-sm mb-2"
                            placeholder="Enter project goals..."
                          />
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={handleSaveDocument}
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <>
                                  <LoadingSpinner size="small" className="mr-1" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="h-3 w-3 mr-1" />
                                  Save Changes
                                </>
                              )}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div>
                          {sectionContent.goals.split('\n').map((line, idx) => (
                            <p key={idx} className="text-sm">{line}</p>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Features Section */}
                    <div className={`prose max-w-none ${editMode === 'features' ? 'bg-purple-100' : 'bg-purple-50'} border border-purple-100 rounded-lg p-4 relative`}>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-purple-800 font-medium">Key Features</h4>
                        {!editMode && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 px-2 text-purple-700"
                            onClick={() => handleEditSection('features')}
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                      
                      {editMode === 'features' ? (
                        <>
                          <Textarea
                            value={sectionContent.features}
                            onChange={(e) => handleSectionChange('features', e.target.value)}
                            className="min-h-[120px] text-sm mb-2"
                            placeholder="Enter key features..."
                          />
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={handleSaveDocument}
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <>
                                  <LoadingSpinner size="small" className="mr-1" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="h-3 w-3 mr-1" />
                                  Save Changes
                                </>
                              )}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div>
                          {sectionContent.features.split('\n').map((line, idx) => (
                            <p key={idx} className="text-sm">{line}</p>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Considerations Section */}
                    <div className={`prose max-w-none ${editMode === 'considerations' ? 'bg-orange-100' : 'bg-orange-50'} border border-orange-100 rounded-lg p-4 relative`}>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-orange-800 font-medium">Additional Considerations</h4>
                        {!editMode && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 px-2 text-orange-700"
                            onClick={() => handleEditSection('considerations')}
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                      
                      {editMode === 'considerations' ? (
                        <>
                          <Textarea
                            value={sectionContent.considerations}
                            onChange={(e) => handleSectionChange('considerations', e.target.value)}
                            className="min-h-[120px] text-sm mb-2"
                            placeholder="Enter additional considerations..."
                          />
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={handleSaveDocument}
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <>
                                  <LoadingSpinner size="small" className="mr-1" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="h-3 w-3 mr-1" />
                                  Save Changes
                                </>
                              )}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div>
                          {sectionContent.considerations.split('\n').map((line, idx) => (
                            <p key={idx} className="text-sm">{line}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No project overview document found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    { 
      id: 'market_research',
      label: 'Market Research',
      icon: <BarChart className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Research</CardTitle>
              <CardDescription>
                Research and understand your market
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmbeddedPage 
                url={`/projects/${projectId}/market-research`} 
                height="800px"
              />
            </CardContent>
          </Card>
        </div>
      )
    },
    { 
      id: 'project_planning',
      label: 'Project Planning',
      icon: <FileSearch className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Planning</CardTitle>
              <CardDescription>
                Plan your project strategy and roadmap
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmbeddedPage 
                url={`/projects/${projectId}/planning`} 
                height="800px"
              />
            </CardContent>
          </Card>
        </div>
      )
    },
    { 
      id: 'design_development',
      label: 'Design & Development',
      icon: <Code className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Design & Development</CardTitle>
              <CardDescription>
                Visualize and plan your project's structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmbeddedPage 
                url={`/projects/${projectId}/visual-planning`} 
                height="800px"
              />
            </CardContent>
          </Card>
        </div>
      )
    },
    { 
      id: 'document_hub',
      label: 'Document Hub',
      icon: <FileText className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Hub</CardTitle>
              <CardDescription>
                Manage and collaborate on project documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentHub 
                projectId={projectId || ''} 
                documents={documents}
                onUploadDocument={handleUploadDocument}
                onDeleteDocument={handleDeleteDocument}
                onDownloadDocument={handleDownloadDocument}
                onStartChat={() => setShowDocumentChat(true)}
              />
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto py-6 space-y-8">
      <PageHeader
        title={project?.title || 'Untitled Project'}
        description={`Created ${project && new Date(project.created_at).toLocaleDateString()}`}
        actions={
          <div className="flex gap-2">
            {project && (
              <ProjectSharingDialog 
                project={project} 
                onUpdate={handleProjectUpdate}
                trigger={
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                }
              />
            )}
            <Button 
              variant="default" 
              onClick={() => navigate(`/projects/${projectId}/generate-ideas`)}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Generate Ideas
            </Button>
          </div>
        }
        className="flex-col md:flex-row justify-between items-start md:items-center gap-4"
      />

      <TabSystem
        tabs={tabItems}
        defaultValue={activeTab}
        onTabChange={setActiveTab}
        persistKey={`project_tabs_${projectId}`}
        className="space-y-4"
        tabsListClassName="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2"
      />
    </div>
  );
}
