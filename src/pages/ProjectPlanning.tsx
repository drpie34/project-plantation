import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useProjectPlanning } from '@/hooks/useProjectPlanning';
import PlanningTabs from '@/components/ProjectPlanning/PlanningTabs';
import PlanningDocument from '@/components/ProjectPlanning/PlanningDocument';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRightIcon, Layout } from 'lucide-react';

export default function ProjectPlanning() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const ideaId = searchParams.get('ideaId');
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [documentContent, setDocumentContent] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const { loadIdeaDetails } = useProjectPlanning(projectId || '');
  
  useEffect(() => {
    if (!projectId && !ideaId) return;
    
    const fetchData = async () => {
      setLoading(true);
      
      try {
        if (!user) {
          navigate('/login');
          return;
        }
        
        // If we have a projectId, get project details
        if (projectId) {
          const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();
          
          if (projectError) throw projectError;
          
          // Check if user owns this project
          if (project.user_id !== user.id) {
            navigate('/dashboard');
            return;
          }
          
          setProject(project);
        }
        
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError('Error loading project data');
        toast({
          title: 'Error',
          description: error.message || 'Failed to load project data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, ideaId, navigate, user, toast]);

  // Load idea details when ideaId is provided
  useEffect(() => {
    if (ideaId) {
      console.log('ProjectPlanning: Loading idea details for ideaId:', ideaId);
      loadIdeaDetails(ideaId);
    }
  }, [ideaId, loadIdeaDetails]);
  
  // Handle document update from tabs component
  const handleUpdateDocument = (content: string) => {
    setDocumentContent(content);
    setLastUpdated(new Date());
  };
  
  // Navigate to project planning
  const handleProceedToVisualPlanning = () => {
    if (projectId) {
      navigate(`/projects/${projectId}/visual-planning`);
    } else {
      // If no project yet, start project formation from this research
      navigate(`/projects/formation?ideaId=${ideaId}`);
    }
  };
  
  const handleCreateInLovable = () => {
    toast({
      title: "Lovable.dev integration",
      description: "Creating project in Lovable.dev will be available soon",
    });
  };

  if (loading) return <div className="flex justify-center p-8">Loading project data...</div>;
  
  // Only check for project if projectId was provided
  if (projectId && error && !project) return <div className="flex justify-center p-8">Error: {error}</div>;
  if (projectId && !project) return <div className="flex justify-center p-8">No project found</div>;
  
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      {profile?.subscription_tier === 'premium' && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-700">
            <span className="font-medium">Premium Feature: </span>
            Your plan includes access to enhanced AI planning features with integration capabilities.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PlanningTabs 
            projectId={projectId || ''} 
            ideaId={ideaId || undefined}
            onUpdateDocument={handleUpdateDocument}
          />
        </div>
        
        <div className="lg:col-span-1">
          {documentContent ? (
            <PlanningDocument 
              content={documentContent} 
              lastUpdated={lastUpdated}
              projectId={projectId}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Planning Document</CardTitle>
                <CardDescription>
                  Your project planning document will appear here as you generate or edit content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border border-dashed rounded-md p-8 text-center text-gray-500">
                  <p>Generate content using the planning tabs to populate this document.</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>
                Continue your project journey with these options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full justify-between"
                variant="outline"
                onClick={handleProceedToVisualPlanning}
              >
                <div className="flex items-center">
                  <Layout className="h-4 w-4 mr-2" />
                  <span>Visual Planning</span>
                </div>
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
              
              <Button 
                className="w-full justify-between"
                variant="outline"
                onClick={handleCreateInLovable}
              >
                <span>Create in Lovable</span>
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
              
              <Button 
                className="w-full justify-between"
                variant="outline"
                onClick={() => navigate('/ideas')}
              >
                <span>Return to Ideas Hub</span>
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}