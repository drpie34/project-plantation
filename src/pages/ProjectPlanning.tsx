
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { AIModelIndicator } from '@/components/AIModelIndicator';
import { ExtendedThinkingDisplay } from '@/components/ExtendedThinkingDisplay';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useProjectPlanning } from '@/hooks/useProjectPlanning';

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
  
  const [requirements, setRequirements] = useState<string>('');
  const [planningType, setPlanningType] = useState<string>('timeline');
  
  const {
    generatePlan,
    isLoading: isGenerating,
    result: planResult,
    creditsRemaining,
    defaultRequirements,
    loadIdeaDetails
  } = useProjectPlanning(projectId || '');
  
  useEffect(() => {
    if (!projectId) return;
    
    const fetchData = async () => {
      setLoading(true);
      
      try {
        if (!user) {
          navigate('/login');
          return;
        }
        
        // Get project details
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
  }, [projectId, navigate, user, toast]);

  // Load idea details when ideaId is provided
  useEffect(() => {
    if (ideaId) {
      loadIdeaDetails(ideaId);
    }
  }, [ideaId]);

  // Set the requirements when defaultRequirements changes
  useEffect(() => {
    if (defaultRequirements) {
      setRequirements(defaultRequirements);
    }
  }, [defaultRequirements]);
  
  const handleGeneratePlan = async () => {
    if (!requirements) {
      setError('Please enter project requirements');
      toast({
        title: 'Missing information',
        description: 'Please enter project requirements',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await generatePlan(requirements, planningType as 'timeline' | 'resources' | 'technical' | 'general');
      
      toast({
        title: 'Plan generated',
        description: `Generated with ${planResult?.model || 'AI'}. ${creditsRemaining} credits remaining.`,
      });
      
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message);
      toast({
        title: 'Error generating plan',
        description: error.message || 'Failed to generate project plan',
        variant: 'destructive',
      });
    }
  };
  
  if (loading) return <div className="flex justify-center p-8">Loading project data...</div>;
  if (error && !project) return <div className="flex justify-center p-8">Error: {error}</div>;
  if (!project) return <div className="flex justify-center p-8">No project found</div>;
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Project Planning for {project.title}</h1>
      
      {profile?.subscription_tier === 'premium' && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-md p-4 mb-6">
          <p className="text-blue-700">
            <span className="font-medium">Premium Feature: </span>
            Your plan includes access to Claude's Extended Thinking mode, which provides deeper analysis and step-by-step reasoning for better project planning.
          </p>
        </div>
      )}
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Project Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Planning Type
                </label>
                <Tabs value={planningType} onValueChange={setPlanningType} className="w-full">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="timeline">Timeline & Milestones</TabsTrigger>
                    <TabsTrigger value="resources">Resource Planning</TabsTrigger>
                    <TabsTrigger value="technical">Technical Architecture</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="timeline">
                    <p className="text-sm text-gray-500 mb-2">
                      Generate a project timeline with key milestones, deadlines, and dependencies.
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="resources">
                    <p className="text-sm text-gray-500 mb-2">
                      Plan required resources, team roles, skills, and budget allocations.
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="technical">
                    <p className="text-sm text-gray-500 mb-2">
                      Create a technical architecture plan including components, technologies, and implementation approach.
                    </p>
                  </TabsContent>
                </Tabs>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Requirements
                </label>
                <Textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={8}
                  placeholder="Describe your project requirements, goals, constraints, and any other relevant details..."
                  className="mb-2"
                />
                <p className="text-xs text-gray-500">
                  The more details you provide, the more accurate your project plan will be.
                </p>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Credits available: {profile?.credits_remaining || 0}
                </p>
                <Button
                  onClick={handleGeneratePlan}
                  disabled={isGenerating || !requirements}
                >
                  {isGenerating ? 'Generating...' : 'Generate Plan'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {planResult && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>Project Plan</span>
                <AIModelIndicator 
                  model={planResult.model} 
                  features={{ extendedThinking: planResult.extendedThinking }}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {planResult.extendedThinking && planResult.thinking && (
                <ExtendedThinkingDisplay thinking={planResult.thinking} />
              )}
              
              <div className="prose prose-blue max-w-none">
                <div dangerouslySetInnerHTML={{ __html: planResult.content }} />
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={() => generatePlan('', 'general')}>
                  Generate Another Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
