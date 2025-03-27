
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
import { callApiGateway } from '@/utils/apiGateway';
import { parseIdeasFromAIContent } from '@/utils/ideaParser';

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
      const prompt = buildIdeaGenerationPrompt(industry, interests);
      console.log("Sending prompt to AI:", prompt);
      
      const result = await callApiGateway('check-ai-router', {
        task: 'ideaGeneration',
        content: prompt,
        userTier: profile.subscription_tier || 'free',
        options: {
          systemPrompt: 'You are an expert in SaaS business models and startup ideas. Generate innovative, practical SaaS ideas based on the industry specified. Follow the exact formatting instructions provided by the user.',
          temperature: 0.7
        }
      });
      
      if (!result || !result.content) {
        throw new Error('Failed to generate ideas');
      }
      
      console.log("AI response:", result.content);
      
      const parsedIdeas = parseIdeasFromAIContent(result.content);
      
      console.log("Parsed ideas:", parsedIdeas);
      
      if (parsedIdeas.length === 0) {
        console.log("Parsing failed, creating fallback idea with raw content");
        
        await supabase
          .from('ideas')
          .insert({
            project_id: projectId,
            title: 'AI Generated Ideas (Raw)',
            description: 'The parser could not structure this content. Here is the raw output:',
            target_audience: '',
            problem_solved: '',
            ai_generated_data: {
              raw_content: result.content,
              parsing_failed: true
            }
          });
          
        toast({
          title: 'Partial Success',
          description: 'Ideas generated but could not be fully structured. Saved raw output.',
          variant: 'default',
        });
        
        await saveApiUsageAndUpdateCredits(user.id, profile.credits_remaining, result.usage);
        
        navigate(`/projects/${projectId}`);
        return;
      }
      
      // Save each parsed idea to the database
      for (const idea of parsedIdeas) {
        await supabase
          .from('ideas')
          .insert({
            project_id: projectId,
            title: idea.title || 'Untitled Idea',
            description: idea.description || 'No description provided',
            target_audience: idea.target_audience || '',
            problem_solved: idea.problem_solved || '',
            ai_generated_data: {
              key_features: idea.ai_generated_data.key_features || [],
              revenue_model: idea.ai_generated_data.revenue_model || ''
            }
          });
      }
      
      await saveApiUsageAndUpdateCredits(user.id, profile.credits_remaining, result.usage);
      
      toast({
        title: 'Success',
        description: `${parsedIdeas.length} ideas generated successfully`,
      });
      
      navigate(`/projects/${projectId}`);
    } catch (error: any) {
      console.error('Error generating ideas:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate ideas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to build the AI prompt
  const buildIdeaGenerationPrompt = (industry: string, interests?: string) => {
    return `Generate 3 innovative SaaS ideas for the ${industry} industry.
    ${interests ? `Focus areas or interests: ${interests}` : ''}
    
    For each idea, provide:
    1. A catchy title
    2. A brief description (2-3 sentences)
    3. The target audience
    4. The main problem it solves
    5. 3-5 key features
    6. A potential revenue model
    
    Format each idea EXACTLY with these headers:
    
    ## Idea 1: [TITLE]
    Description: [DESCRIPTION]
    Target Audience: [TARGET]
    Problem: [PROBLEM]
    Key Features:
    - [FEATURE 1]
    - [FEATURE 2]
    - [FEATURE 3]
    Revenue Model: [REVENUE MODEL]
    
    ## Idea 2: [TITLE]
    Description: [DESCRIPTION]
    Target Audience: [TARGET]
    Problem: [PROBLEM]
    Key Features:
    - [FEATURE 1]
    - [FEATURE 2]
    - [FEATURE 3]
    Revenue Model: [REVENUE MODEL]
    
    ## Idea 3: [TITLE]
    Description: [DESCRIPTION]
    Target Audience: [TARGET]
    Problem: [PROBLEM]
    Key Features:
    - [FEATURE 1]
    - [FEATURE 2]
    - [FEATURE 3]
    Revenue Model: [REVENUE MODEL]`;
  };
  
  // Helper function to save API usage and update credits
  const saveApiUsageAndUpdateCredits = async (userId: string, currentCredits: number, usage: any) => {
    await supabase
      .from('api_usage')
      .insert({
        user_id: userId,
        api_type: usage.api,
        model_used: usage.model,
        tokens_input: usage.inputTokens,
        tokens_output: usage.outputTokens,
        credits_used: usage.creditCost || 5,
        timestamp: new Date().toISOString()
      });
    
    const creditCost = usage.creditCost || 5;
    await supabase
      .from('users')
      .update({ 
        credits_remaining: currentCredits - creditCost 
      })
      .eq('id', userId);
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
