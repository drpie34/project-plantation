
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeftIcon } from 'lucide-react';

const GenerateIdeas = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [industry, setIndustry] = useState('');
  const [interests, setInterests] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProjectLoading, setIsProjectLoading] = useState(true);
  const { projectId } = useParams<{ projectId: string }>();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      if (!user || !projectId) return;
      
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching project:', error);
          toast({
            title: 'Error',
            description: 'Project not found',
            variant: 'destructive',
          });
          navigate('/projects');
          return;
        }

        setProject(data as Project);
      } catch (error) {
        console.error('Error in fetchProject:', error);
      } finally {
        setIsProjectLoading(false);
      }
    };

    fetchProject();
  }, [projectId, user, navigate, toast]);

  const handleGenerateIdeas = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!industry.trim()) {
      toast({
        title: 'Error',
        description: 'Industry is required',
        variant: 'destructive',
      });
      return;
    }

    if (!user || !projectId || !profile) {
      toast({
        title: 'Error',
        description: 'You must be logged in with a valid profile',
        variant: 'destructive',
      });
      return;
    }

    if (profile.credits_remaining < 5) {
      toast({
        title: 'Insufficient Credits',
        description: 'You need at least 5 credits to generate ideas',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // For Phase 1 we'll use a mock response since we don't have the actual OpenAI implementation yet
      // This would normally call an API endpoint that connects to OpenAI
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock ideas based on inputs
      const mockIdeas = [
        {
          title: `${industry} Analytics Dashboard`,
          description: `A comprehensive analytics platform for ${industry} businesses.`,
          target_audience: `${industry} business owners and managers`,
          problem_solved: `Lack of actionable insights in the ${industry} space`,
          ai_generated_data: {
            key_features: [
              'Real-time data visualization',
              'Custom reporting',
              'Predictive analytics'
            ],
            revenue_model: 'Monthly subscription'
          }
        },
        {
          title: `${industry} Connector`,
          description: `A platform that connects ${industry} professionals with clients.`,
          target_audience: `${industry} professionals and service seekers`,
          problem_solved: 'Difficulty finding reliable professional services',
          ai_generated_data: {
            key_features: [
              'Verified profiles',
              'Booking system',
              'Payment processing'
            ],
            revenue_model: 'Transaction fees'
          }
        },
        {
          title: `${industry} Automator`,
          description: `Workflow automation tool tailored for ${industry} processes.`,
          target_audience: `${industry} teams and organizations`,
          problem_solved: 'Manual, time-consuming workflows',
          ai_generated_data: {
            key_features: [
              'Process templates',
              'Integration with existing tools',
              'Analytics and optimization'
            ],
            revenue_model: 'Tiered subscription'
          }
        }
      ];
      
      // Store ideas in the database
      for (const idea of mockIdeas) {
        await supabase
          .from('ideas')
          .insert({
            project_id: projectId,
            title: idea.title,
            description: idea.description,
            target_audience: idea.target_audience,
            problem_solved: idea.problem_solved,
            ai_generated_data: idea.ai_generated_data
          });
      }
      
      // Log API usage
      await supabase
        .from('api_usage')
        .insert({
          user_id: user.id,
          api_type: 'openai',
          model_used: 'gpt-4o-mini',
          tokens_input: 200, // Estimated
          tokens_output: 800, // Estimated
          credits_used: 5,
          timestamp: new Date().toISOString()
        });
      
      // Update user credits
      await supabase
        .from('users')
        .update({ 
          credits_remaining: profile.credits_remaining - 5 
        })
        .eq('id', user.id);
      
      toast({
        title: 'Success',
        description: 'Ideas generated successfully',
      });
      
      navigate(`/projects/${projectId}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate ideas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isProjectLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-medium mb-2">Project not found</h2>
        <Button onClick={() => navigate('/projects')} className="mt-4">
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center space-x-2 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(`/projects/${projectId}`)}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Project
        </Button>
        <h2 className="text-3xl font-bold">Generate Ideas</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>AI Idea Generation</CardTitle>
          <CardDescription>
            Fill in details about your target industry and interests to generate SaaS ideas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerateIdeas} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="industry">Target Industry *</Label>
              <Input
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., Healthcare, Real Estate, Education"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interests">Specific Interests or Focus Areas</Label>
              <Textarea
                id="interests"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="e.g., Automation, Mobile apps, B2B solutions"
                rows={4}
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <p className="font-medium text-blue-800">Cost: 5 credits</p>
              <p className="text-sm text-blue-700 mt-1">
                Your current balance: {profile?.credits_remaining || 0} credits
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/projects/${projectId}`)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || (profile?.credits_remaining || 0) < 5}
              >
                {isLoading ? 'Generating...' : 'Generate Ideas'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GenerateIdeas;
