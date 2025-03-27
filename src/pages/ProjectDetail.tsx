import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
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
  MessageSquare
} from 'lucide-react';
import { Project, Idea } from '@/types/supabase';
import ProjectSharingDialog from '@/components/Collaboration/ProjectSharingDialog';
import CollaborationTabs from '@/components/Collaboration/CollaborationTabs';

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
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchIdeas();
    }
  }, [projectId]);

  async function fetchProject() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      
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
      console.error('Error fetching project:', error);
      toast({
        title: 'Error',
        description: 'Failed to load project',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchIdeas() {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

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
      console.error('Error fetching ideas:', error);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
    switch (stage) {
      case 'ideation':
        return <Badge className="bg-blue-100 text-blue-800">Ideation</Badge>;
      case 'planning':
        return <Badge className="bg-purple-100 text-purple-800">Planning</Badge>;
      case 'development':
        return <Badge className="bg-amber-100 text-amber-800">Development</Badge>;
      case 'launched':
        return <Badge className="bg-green-100 text-green-800">Launched</Badge>;
      default:
        return <Badge>{stage}</Badge>;
    }
  };

  const handleProjectUpdate = (updatedProject: ProjectWithCollaboration) => {
    setProject(updatedProject);
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="mr-2"
            size="icon"
            onClick={() => navigate('/projects')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              {project?.title}
              {project?.is_collaborative && (
                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                  <Users className="h-3 w-3 mr-1" />
                  Collaborative
                </Badge>
              )}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              {project && getStageDisplay(project.stage)}
              <span>•</span>
              <span>Created {project && new Date(project.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ideas">Ideas</TabsTrigger>
          <TabsTrigger value="planning" onClick={() => navigate(`/projects/${projectId}/planning`)}>
            Planning
          </TabsTrigger>
          <TabsTrigger value="market-research" onClick={() => navigate(`/projects/${projectId}/market-research`)}>
            Research
          </TabsTrigger>
          <TabsTrigger value="docs" onClick={() => navigate(`/projects/${projectId}/document-analysis`)}>
            Docs
          </TabsTrigger>
          <TabsTrigger value="visual" onClick={() => navigate(`/projects/${projectId}/visual-planning`)}>
            Visual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
              <CardDescription>
                Key information about your SaaS project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-gray-600">
                    {project.description || 'No description provided'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => navigate(`/projects/${projectId}/market-research`)}
                    >
                      <BarChart className="h-4 w-4 mr-2" />
                      Market Research
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => navigate(`/projects/${projectId}/planning`)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Project Planning
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => navigate(`/projects/${projectId}/document-analysis`)}
                    >
                      <FileSearch className="h-4 w-4 mr-2" />
                      Analyze Documents
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => navigate(`/projects/${projectId}/visual-planning`)}
                    >
                      <GanttIcon className="h-4 w-4 mr-2" />
                      Visual Planning
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => navigate(`/projects/${projectId}/marketing-copy`)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Marketing Copy
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <CollaborationTabs projectId={projectId || ''} />
        </TabsContent>

        <TabsContent value="ideas" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Project Ideas</h2>
            <Button
              onClick={() => navigate(`/projects/${projectId}/generate-ideas`)}
              size="sm"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Ideas
            </Button>
          </div>

          {ideas.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Lightbulb className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <h3 className="text-lg font-medium mb-1">No ideas yet</h3>
                <p className="text-muted-foreground mb-4">
                  Generate ideas for your SaaS project to get started
                </p>
                <Button onClick={() => navigate(`/projects/${projectId}/generate-ideas`)}>
                  Generate Ideas
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ideas.map((idea) => (
                <Card key={idea.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{idea.title}</CardTitle>
                      <Badge variant="outline" className={
                        idea.status === 'ready' ? 'bg-green-50 text-green-700' :
                        idea.status === 'developing' ? 'bg-blue-50 text-blue-700' :
                        idea.status === 'archived' ? 'bg-gray-50 text-gray-700' :
                        'bg-yellow-50 text-yellow-700'
                      }>
                        {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <p className="line-clamp-3 text-sm text-gray-600 mb-3">
                      {idea.description || 'No description provided'}
                    </p>
                    {idea.target_audience && (
                      <div className="text-xs text-gray-500 mb-1">
                        <span className="font-medium">Target audience:</span> {idea.target_audience}
                      </div>
                    )}
                    {idea.problem_solved && (
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Problem solved:</span> {idea.problem_solved}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
