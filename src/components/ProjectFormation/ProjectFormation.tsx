
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, Plus, ArrowRight } from 'lucide-react';
import { generateProjectSuggestion, createProject } from '@/utils/projectFormation';
import { Idea } from '@/types/supabase';

interface ProjectFormationProps {
  ideaId?: string;
  researchId?: string;
}

export default function ProjectFormation({ ideaId, researchId }: ProjectFormationProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [idea, setIdea] = useState<Idea | null>(null);
  const [research, setResearch] = useState<any | null>(null);
  const [suggestedProject, setSuggestedProject] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectGoals, setProjectGoals] = useState('');

  useEffect(() => {
    if (ideaId || researchId) {
      fetchRelatedData();
    } else {
      setIsLoading(false);
    }
  }, [ideaId, researchId]);
  
  async function fetchRelatedData() {
    setIsLoading(true);
    
    try {
      // Fetch idea data if ideaId is provided
      if (ideaId) {
        const { data: ideaData, error: ideaError } = await supabase
          .from('ideas')
          .select('*')
          .eq('id', ideaId)
          .single();
        
        if (ideaError) throw ideaError;
        
        // Cast the status to the correct type to ensure it matches the Idea type
        const typedIdeaData = {
          ...ideaData,
          status: ideaData.status as "draft" | "developing" | "ready" | "archived"
        };
        
        setIdea(typedIdeaData);
        
        // Set initial project name based on idea
        if (ideaData?.title) {
          setProjectName(ideaData.title);
        }
      }
      
      // Fetch research data if researchId is provided
      if (researchId) {
        // Note: Since the market_research table doesn't exist yet, we'll handle this gracefully
        try {
          console.warn('Note: market_research table might not exist yet');
          // No need to actually query for research data since it will fail
          // Just inform the user through the console
        } catch (researchError) {
          console.warn('Research data not found, likely the table does not exist yet:', researchError);
        }
        setResearch(null);
      }
    } catch (error: any) {
      console.error('Error fetching related data:', error);
      setError('Failed to load related data');
      
      toast({
        title: 'Error',
        description: 'Failed to load related data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handleGenerateProjectSuggestion() {
    setIsGenerating(true);
    
    try {
      if (!user) {
        navigate('/login');
        return;
      }
      
      // Get user tier
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();
      
      if (userError) throw userError;
      
      // Route to appropriate AI
      const result = await generateProjectSuggestion({
        idea,
        research,
        userTier: userData.subscription_tier
      });
      
      setSuggestedProject(result);
      
      // Try to extract project name and description from AI response
      const nameMatch = result.content.match(/Project Name:?(.+?)(?:\n|$)/i);
      const descMatch = result.content.match(/Description:?(.+?)(?:\n\n|\n#|$)/is);
      const goalsMatch = result.content.match(/Goals:?(.+?)(?:\n\n|\n#|$)/is);
      
      if (nameMatch && nameMatch[1].trim()) {
        setProjectName(nameMatch[1].trim());
      }
      
      if (descMatch && descMatch[1].trim()) {
        setProjectDescription(descMatch[1].trim());
      }
      
      if (goalsMatch && goalsMatch[1].trim()) {
        setProjectGoals(goalsMatch[1].trim());
      }
      
    } catch (error: any) {
      console.error('Error generating project suggestion:', error);
      setError('Failed to generate project suggestion');
      
      toast({
        title: 'Error',
        description: 'Failed to generate project suggestion',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  }
  
  async function handleCreateProject() {
    if (!projectName.trim()) {
      toast({
        title: 'Error',
        description: 'Project name is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const newProject = await createProject({
        title: projectName,
        description: projectDescription,
        userId: user.id,
        ideaId: idea?.id || null
      });
      
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
      
      navigate(`/projects/${newProject.id}`);
    } catch (error: any) {
      console.error('Error creating project:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }
  
  async function handleSaveDraft() {
    // Implement save draft functionality
    toast({
      title: 'Not implemented',
      description: 'Save draft functionality is not implemented yet',
    });
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>
            Form a new project based on your ideas and research
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Related Information</h3>
                
                {idea ? (
                  <div className="border rounded-md p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="outline" className="mb-2">Idea</Badge>
                        <h4 className="font-medium">{idea.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{idea.description}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/ideas/${idea.id}`)}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed rounded-md p-4 flex justify-between items-center">
                    <span className="text-gray-500">No idea linked</span>
                    <Button variant="outline" size="sm" onClick={() => navigate('/ideas')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Idea
                    </Button>
                  </div>
                )}
                
                {research ? (
                  <div className="border rounded-md p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="outline" className="mb-2">Market Research</Badge>
                        <h4 className="font-medium">{research.search_query}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {research.ai_analysis?.length > 150
                            ? research.ai_analysis.substring(0, 150) + '...'
                            : research.ai_analysis}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/research/${research.id}`)}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed rounded-md p-4 flex justify-between items-center">
                    <span className="text-gray-500">No market research linked</span>
                    <Button variant="outline" size="sm" onClick={() => navigate('/research/new')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Research
                    </Button>
                  </div>
                )}
              </div>
              
              {(idea || research) && !suggestedProject && (
                <div className="flex justify-center mt-6">
                  <Button
                    onClick={handleGenerateProjectSuggestion}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Generate Project Suggestion
                      </>
                    )}
                  </Button>
                </div>
              )}
              
              {suggestedProject && (
                <div className="mt-6 space-y-4">
                  <Separator />
                  <h3 className="text-lg font-medium">AI-Generated Project Suggestion</h3>
                  
                  <div className="prose prose-blue max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: suggestedProject.content.replace(/\n/g, '<br/>') }} />
                  </div>
                  
                  <Separator />
                  
                  <div className="pt-2">
                    <h3 className="text-md font-medium mb-3">Create Your Project</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Project Name
                        </label>
                        <Input 
                          placeholder="Enter project name" 
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <Textarea 
                          placeholder="Describe your project"
                          rows={3}
                          value={projectDescription}
                          onChange={(e) => setProjectDescription(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Goals
                        </label>
                        <Textarea 
                          placeholder="What are the main goals of this project?"
                          rows={3}
                          value={projectGoals}
                          onChange={(e) => setProjectGoals(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" className="mr-2" onClick={handleSaveDraft} disabled={isSaving}>
            Save Draft
          </Button>
          <Button onClick={handleCreateProject} disabled={isSaving || !projectName.trim()}>
            {isSaving ? 'Creating...' : 'Create Project'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
