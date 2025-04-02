import { useEffect, useState, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui';
import {
  Share2,
  FileText,
  BarChart,
  FileSearch,
  Code,
  ArrowUpRight,
  FileQuestion,
  LineChart,
  Book,
  ImagePlus,
  MessageSquare,
} from 'lucide-react';
import { TabSystem, TabItem, PageHeader, LoadingSpinner } from '@/components/common';
import ProjectSharingDialog from '@/components/Collaboration/ProjectSharingDialog';
import { ProjectOverview, ProjectDocumentChat, useDocumentActions } from '@/components/ProjectDetail';
import CollaborationTabs from '@/components/Collaboration/CollaborationTabs';
import { useProjectDetail } from '@/hooks/useProjectDetail';

// Lazy-load tab components
const DocumentHub = lazy(() => import('@/components/DocumentHub/DocumentHub'));
const MarketResearchTabs = lazy(() => import('@/components/MarketResearch/MarketResearchTabs'));
const PlanningTabs = lazy(() => import('@/components/ProjectPlanning/PlanningTabs'));
const VisualPlanningTabs = lazy(() => import('@/components/VisualPlanning/VisualPlanningTabs'));

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [showDocumentChat, setShowDocumentChat] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Use our custom hooks for project details and document actions
  const {
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
    handleEditSection,
    handleCancelEdit,
    handleSectionChange,
    saveDocument
  } = useProjectDetail(projectId);
  
  const {
    handleUploadDocument,
    handleDeleteDocument,
    handleDownloadDocument,
    handleSaveTranscript
  } = useDocumentActions(projectId);

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

  const handleProjectUpdate = (updatedProject: any) => {
    fetchProject();
  };

  // Define the tab items for our standardized TabSystem
  const tabItems: TabItem[] = [
    { 
      id: 'overview',
      label: 'Overview',
      icon: <FileText className="h-4 w-4" />,
      content: (
        <div className="w-full">
          <ProjectOverview 
            overviewDocument={overviewDocument}
            sectionContent={sectionContent}
            editMode={editMode}
            isSaving={isSaving}
            linkedIdea={ideas.length > 0 ? ideas[0] : null}
            onEditSection={handleEditSection}
            onCancelEdit={handleCancelEdit}
            onSectionChange={handleSectionChange}
            onSaveDocument={saveDocument}
          />
        </div>
      )
    },
    { 
      id: 'market_research',
      label: 'Market Research',
      icon: <BarChart className="h-4 w-4" />,
      content: (
        <div className="w-full">
          <Suspense fallback={<div className="flex justify-center py-8"><LoadingSpinner size="large" /></div>}>
            <MarketResearchTabs 
              projectId={projectId || ''} 
              ideaId={undefined}
              onUpdateDocument={() => fetchDocuments()}
            />
          </Suspense>
        </div>
      )
    },
    { 
      id: 'project_planning',
      label: 'Project Planning',
      icon: <FileSearch className="h-4 w-4" />,
      content: (
        <div className="w-full">
          <Suspense fallback={<div className="flex justify-center py-8"><LoadingSpinner size="large" /></div>}>
            <PlanningTabs 
              projectId={projectId || ''} 
              ideaId={undefined}
              onUpdateDocument={() => fetchDocuments()}
            />
          </Suspense>
        </div>
      )
    },
    { 
      id: 'design_development',
      label: 'Design & Development',
      icon: <Code className="h-4 w-4" />,
      content: (
        <div className="w-full">
          <Suspense fallback={<div className="flex justify-center py-8"><LoadingSpinner size="large" /></div>}>
            <VisualPlanningTabs 
              projectId={projectId || ''}
            />
          </Suspense>
        </div>
      )
    },
    { 
      id: 'document_hub',
      label: 'Document Hub',
      icon: <FileText className="h-4 w-4" />,
      content: (
        <div className="w-full">
          <Suspense fallback={<div className="flex justify-center py-8"><LoadingSpinner size="large" /></div>}>
            <DocumentHub 
              projectId={projectId || ''} 
              documents={documents}
              onUploadDocument={async (file) => {
                const doc = await handleUploadDocument(file);
                if (doc) fetchDocuments();
              }}
              onDeleteDocument={async (docId) => {
                const success = await handleDeleteDocument(docId);
                if (success) fetchDocuments();
              }}
              onDownloadDocument={handleDownloadDocument}
              onStartChat={() => setShowDocumentChat(true)}
            />
          </Suspense>
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
      
      {/* Collaboration tools (comments, tasks, activity) - only show on overview tab */}
      {activeTab === 'overview' && projectId && (
        <div className="mt-8">
          <CollaborationTabs projectId={projectId} />
        </div>
      )}

      {/* Document Chat Modal */}
      {showDocumentChat && projectId && (
        <ProjectDocumentChat
          projectId={projectId}
          onClose={() => setShowDocumentChat(false)}
          onSaveTranscript={async (title, content) => {
            const doc = await handleSaveTranscript(title, content);
            if (doc) fetchDocuments();
            return doc;
          }}
        />
      )}
    </div>
  );
}