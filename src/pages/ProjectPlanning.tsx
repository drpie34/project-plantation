import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useProjectPlanning } from '@/hooks/useProjectPlanning';
import { documentGenerationService } from '@/services/documentGenerationService';
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
  const handleUpdateDocument = async (content: string, planningData: any = {}) => {
    setDocumentContent(content);
    setLastUpdated(new Date());
    
    // Display a toast notification to inform the user
    toast({
      title: "Document Updated",
      description: "Your project planning has been saved to the Document Hub",
    });
    
    // Ensure document is created in the Document Hub
    if (projectId && user?.id) {
      try {
        console.log('Automatically generating project planning document with data:', 
          JSON.stringify({
            projectId, 
            userId: user.id,
            contentLength: content.length,
            dataKeys: Object.keys(planningData)
          })
        );
        
        // Create planning data object from content and planningData
        const completeData = {
          ...planningData,
          // Add full content as fallback if specific sections are missing
          fullContent: content
        };
        
        // Create document immediately (no wait)
        documentGenerationService.createProjectPlanningDocument(
          user.id,
          projectId,
          completeData
        );
        
        // Also make a direct insert to ensure it's created
        const { error: directInsertError } = await supabase
          .from('documents')
          .insert({
            title: `Project Plan - ${new Date().toLocaleDateString()}`,
            type: 'project_planning',
            content: content,
            user_id: user.id,
            project_id: projectId,
            is_auto_generated: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (directInsertError) {
          console.error('Direct insertion error:', directInsertError);
          // Try upsert if insert fails
          const { error: upsertError } = await supabase
            .from('documents')
            .upsert({
              title: `Project Plan - ${new Date().toLocaleDateString()}`,
              type: 'project_planning',
              content: content,
              user_id: user.id,
              project_id: projectId,
              is_auto_generated: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (upsertError) {
            console.error('Upsert also failed:', upsertError);
          }
        }
        
        // Also save to localStorage as backup
        localStorage.setItem(
          `document_${projectId}_project_planning`, 
          content
        );
        
        console.log('Project planning document added to Document Hub through multiple methods');
      } catch (error) {
        console.error('Error auto-generating project planning document:', error);
        
        // Save to localStorage as fallback
        localStorage.setItem(`document_${projectId}_project_planning`, content);
        console.log('Saved to localStorage as fallback due to error');
      }
    } else {
      console.log('Cannot auto-generate document: missing project ID or user ID');
    }
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
      
      <div className="grid grid-cols-1 gap-6">
        <PlanningTabs 
          projectId={projectId || ''} 
          ideaId={ideaId || undefined}
          onUpdateDocument={handleUpdateDocument}
        />
        
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>
              Content from your planning is automatically saved to the Document Hub
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
              onClick={() => navigate(`/projects/${projectId}`)}
            >
              <span>Return to Project Overview</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            
            <Button 
              className="w-full justify-between"
              variant="outline"
              onClick={() => navigate(`/projects/${projectId}?tab=document-hub`)}
            >
              <span>View in Document Hub</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}