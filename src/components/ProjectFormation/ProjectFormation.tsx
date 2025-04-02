import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { callApiGateway } from '@/utils/apiGateway';
import { Idea } from '@/types/supabase';
import { documentService } from '@/services/documentService';
import { databaseService } from '@/services/databaseService';
import { useErrorHandler } from '@/services/errorService';

interface ProjectFormationProps {
  ideaId?: string;
  researchId?: string;
}

export default function ProjectFormation({ ideaId, researchId }: ProjectFormationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  
  // Get previous location from state, defaulting to ideas hub or the specific idea detail
  const previousPath = location.state?.from || (ideaId ? `/ideas/${ideaId}` : '/ideas');
  
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
  const [keyFeatures, setKeyFeatures] = useState('');
  const [additionalConsiderations, setAdditionalConsiderations] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [documentLastUpdated, setDocumentLastUpdated] = useState<Date | null>(null);

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
        
        // Convert JSON fields to proper types to match the Idea interface
        const typedIdeaData: Idea = {
          ...ideaData,
          status: ideaData.status as "draft" | "developing" | "ready" | "archived",
          // Ensure JSON fields are properly cast to expected types
          inspiration_sources: ideaData.inspiration_sources as Record<string, any>,
          collaboration_settings: ideaData.collaboration_settings as {
            visibility: 'private' | 'team' | 'public'
          },
          ai_generated_data: ideaData.ai_generated_data,
          tags: ideaData.tags || [],
          version_history: ideaData.version_history as Record<string, any>[]
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
      const keyFeaturesMatch = result.content.match(/Key Features:?(.+?)(?:\n\n|\n#|$)/is);
      const additionalConsiderationsMatch = result.content.match(/Additional Considerations:?(.+?)(?:\n\n|\n#|$)/is);
      
      // Create a function to update and log individual fields
      const updateField = (match: RegExpMatchArray | null, fieldName: string, setterFn: (value: string) => void) => {
        if (match && match[1].trim()) {
          const value = match[1].trim();
          console.log(`Updating ${fieldName} with value: ${value.substring(0, 50)}...`);
          setterFn(value);
          return true;
        }
        return false;
      };
      
      // Sequential updates with small delay to ensure all state updates are applied
      let delay = 0;
      const delayStep = 50; // 50ms between each update
      
      if (updateField(nameMatch, 'projectName', setProjectName)) {
        delay += delayStep;
        setTimeout(() => updateProjectDocument(), delay);
      }
      
      if (updateField(descMatch, 'projectDescription', setProjectDescription)) {
        delay += delayStep;
        setTimeout(() => updateProjectDocument(), delay);
      }
      
      if (updateField(goalsMatch, 'projectGoals', setProjectGoals)) {
        delay += delayStep;
        setTimeout(() => updateProjectDocument(), delay);
      }
      
      if (updateField(keyFeaturesMatch, 'keyFeatures', setKeyFeatures)) {
        delay += delayStep;
        setTimeout(() => updateProjectDocument(), delay);
      }
      
      if (updateField(additionalConsiderationsMatch, 'additionalConsiderations', setAdditionalConsiderations)) {
        delay += delayStep;
        setTimeout(() => updateProjectDocument(), delay);
      }
      
      // Final document update and save
      setTimeout(() => {
        updateProjectDocument();
        handleSaveDraft();
        console.log('Document updates and save complete');
      }, delay + delayStep);
      
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
    
    // Make sure the document is updated with the latest content
    const finalContent = updateProjectDocument();
    
    setIsSaving(true);
    let newProjectId = null;
    
    try {
      // STEP 1: Create the project directly with Supabase
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: projectName,
          description: projectDescription, // Use the raw description, not enhanced
          user_id: user.id,
          stage: 'planning',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (projectError) {
        throw new Error('Failed to create project: ' + projectError.message);
      }
      
      if (!projectData || !projectData.id) {
        throw new Error('Failed to create project: No project ID returned');
      }
      
      newProjectId = projectData.id;
      
      // STEP 2: Link idea to project if provided
      if (idea?.id) {
        await supabase
          .from('ideas')
          .update({ project_id: newProjectId })
          .eq('id', idea.id);
      }
      
      // STEP 3: Create the document
      console.log('Creating document for project ID:', newProjectId);
      
      // Check if user exists
      if (!user?.id) {
        throw new Error('User not found');
      }
      
      // Use our documentService to create a document
      try {
        // Create the document with the latest content
        const now = new Date().toISOString();
        const documentParams = {
          title: 'Project Overview',
          type: 'project_overview' as const,
          content: finalContent,
          user_id: user.id,
          project_id: newProjectId,
          is_auto_generated: true,
          created_at: now,
          updated_at: now
        };
        
        // Debug the document content
        console.log('==== DEBUG: Document creation ====');
        console.log('Project ID:', newProjectId);
        console.log('User ID:', user.id);
        console.log('Document title:', 'Project Overview');
        console.log('Content length:', finalContent.length);
        console.log('Content snippet:', finalContent.substring(0, 150) + '...');
        console.log('==== END DEBUG ====');
        
        // Create the document
        const newDocument = await documentService.createDocument(documentParams);
        
        if (!newDocument) {
          throw new Error('Failed to create project overview document');
        }
        
        console.log('==== SUCCESS: Document created ====');
        console.log('Document ID:', newDocument.id);
        console.log('==== END SUCCESS ====');
        
      } catch (documentError) {
        console.error('Document creation failed:', documentError);
        handleError('ProjectFormation', 'handleCreateProject', documentError, { 
          step: 'document_creation',
          projectId: newProjectId
        }, false);
        
        // Save to localStorage as fallback
        localStorage.setItem(`document_${newProjectId}_project_overview`, finalContent);
      }
      
      // Success path
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
      
      // Navigate to project page with overview tab active
      setTimeout(() => {
        navigate(`/projects/${newProjectId}?tab=overview`);
      }, 500);
      
    } catch (error) {
      console.error('Error in project creation process:', error);
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project',
        variant: 'destructive',
      });
      
      // If we created a project but failed later, navigate to it anyway
      if (newProjectId) {
        toast({
          title: 'Partial success',
          description: 'Project created but some elements may be missing',
        });
        
        setTimeout(() => {
          navigate(`/projects/${newProjectId}`);
        }, 1000);
      }
    } finally {
      setIsSaving(false);
    }
  }
  
  function updateProjectDocument() {
    // Create a complete document with section markers
    // IMPORTANT: This EXACT format is used to parse sections in ProjectDetail.tsx
    // DO NOT change whitespace or formatting between markers!!
    const content = `# ${projectName || 'Project Plan'}

<!-- SECTION:description -->
${projectDescription || 'No description provided yet.'}
<!-- END:description -->

<!-- SECTION:goals -->
${projectGoals || 'No goals defined yet.'}
<!-- END:goals -->

<!-- SECTION:features -->
${keyFeatures || 'No key features defined yet.'}
<!-- END:features -->

<!-- SECTION:considerations -->
${additionalConsiderations || 'No additional considerations defined yet.'}
<!-- END:considerations -->`;

    // Log the content length and a preview to help with debugging
    console.log(`updateProjectDocument: Content updated (${content.length} chars)`);
    console.log(`Content preview: ${content.substring(0, 150)}...`);

    // Update state with the new content
    setDocumentContent(content);
    setDocumentLastUpdated(new Date());
    
    // Return the content so it can be used directly when needed
    return content;
  }

  async function handleSaveDraft() {
    // First update the document content
    updateProjectDocument();
    
    // Then save the draft to the database
    try {
      // TODO: Implement actual saving to the database
      toast({
        title: 'Document Updated',
        description: 'Your project document has been updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save draft',
        variant: 'destructive',
      });
    }
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
              {idea && (
                <div className="border rounded-md p-4 mb-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Badge className="bg-blue-100 text-blue-800 mr-2">Idea</Badge>
                        <h3 className="font-medium">{idea.title}</h3>
                      </div>
                      
                      <details className="cursor-pointer">
                        <summary className="font-medium text-sm text-blue-600 hover:text-blue-800 transition-colors">
                          View idea details
                        </summary>
                        <div className="mt-3 space-y-2 p-3 bg-gray-50 rounded-md">
                          <div>
                            <h4 className="text-sm font-medium">Description</h4>
                            <p className="text-sm text-gray-600">{idea.description}</p>
                          </div>
                          
                          {idea.target_audience && (
                            <div>
                              <h4 className="text-sm font-medium">Target Audience</h4>
                              <p className="text-sm text-gray-600">{idea.target_audience}</p>
                            </div>
                          )}
                          
                          {idea.problem_solved && (
                            <div>
                              <h4 className="text-sm font-medium">Problem Solved</h4>
                              <p className="text-sm text-gray-600">{idea.problem_solved}</p>
                            </div>
                          )}
                          
                          {idea.tags && idea.tags.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium">Tags</h4>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {idea.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs bg-gray-100">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              )}
              
              {!idea && (
                <div className="border border-dashed rounded-md p-4 mb-6 flex justify-between items-center">
                  <span className="text-gray-500">No idea linked</span>
                  <Button variant="outline" size="sm" onClick={() => navigate('/ideas')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Select an Idea
                  </Button>
                </div>
              )}
              
              <div className="pt-6">
                <h3 className="text-lg font-medium mb-4">Create Your Project</h3>
                
                <div className="flex justify-end mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={handleGenerateProjectSuggestion}
                    disabled={isGenerating || !idea}
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">✨</span>
                        Fill All Fields with AI
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Project Name
                      </label>
                      {projectName ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-5 px-2 py-0 text-blue-600"
                          onClick={async () => {
                            setIsGenerating(true);
                            try {
                              if (!user) return;
                              
                              const { data } = await supabase
                                .from('users')
                                .select('subscription_tier')
                                .eq('id', user.id)
                                .single();
                              
                              const result = await callApiGateway('check-ai-router', {
                                task: 'projectSuggestion',
                                content: `
                                  Based on this project name: "${projectName}", 
                                  Complete or improve this project name to be more specific and appealing.
                                  Just return the improved name, nothing else.
                                `,
                                userTier: data?.subscription_tier || 'free'
                              });
                              
                              setProjectName(result.content.trim());
                            } catch (error) {
                              console.error('Error completing with AI:', error);
                              toast({
                                title: 'Error',
                                description: 'Failed to complete with AI',
                                variant: 'destructive',
                              });
                            } finally {
                              setIsGenerating(false);
                            }
                          }}
                          disabled={isGenerating}
                        >
                          Improve with AI
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-5 px-2 py-0 text-blue-600"
                          onClick={async () => {
                            if (!idea) return;
                            setIsGenerating(true);
                            try {
                              if (!user) return;
                              
                              const { data } = await supabase
                                .from('users')
                                .select('subscription_tier')
                                .eq('id', user.id)
                                .single();
                              
                              const result = await callApiGateway('check-ai-router', {
                                task: 'projectSuggestion',
                                content: `
                                  Generate a project name for this idea: 
                                  Title: ${idea.title}
                                  Description: ${idea.description}
                                  Target Audience: ${idea.target_audience || 'Not specified'}
                                  Problem: ${idea.problem_solved || 'Not specified'}
                                  Just return the name, nothing else.
                                `,
                                userTier: data?.subscription_tier || 'free'
                              });
                              
                              setProjectName(result.content.trim());
                            } catch (error) {
                              console.error('Error generating with AI:', error);
                              toast({
                                title: 'Error',
                                description: 'Failed to generate with AI',
                                variant: 'destructive',
                              });
                            } finally {
                              setIsGenerating(false);
                            }
                          }}
                          disabled={isGenerating || !idea}
                        >
                          Generate with AI
                        </Button>
                      )}
                    </div>
                    <Input 
                      placeholder="Enter project name" 
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      {projectDescription ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-5 px-2 py-0 text-blue-600"
                          onClick={async () => {
                            setIsGenerating(true);
                            try {
                              if (!user) return;
                              
                              const { data } = await supabase
                                .from('users')
                                .select('subscription_tier')
                                .eq('id', user.id)
                                .single();
                              
                              const result = await callApiGateway('check-ai-router', {
                                task: 'projectSuggestion',
                                content: `
                                  Complete or improve this project description: "${projectDescription}".
                                  Make it detailed and professional. Focus on what the project is about.
                                  Just return the improved description, nothing else.
                                `,
                                userTier: data?.subscription_tier || 'free'
                              });
                              
                              setProjectDescription(result.content.trim());
                            } catch (error) {
                              console.error('Error completing with AI:', error);
                              toast({
                                title: 'Error',
                                description: 'Failed to complete with AI',
                                variant: 'destructive',
                              });
                            } finally {
                              setIsGenerating(false);
                            }
                          }}
                          disabled={isGenerating}
                        >
                          Complete with AI
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-5 px-2 py-0 text-blue-600"
                          onClick={async () => {
                            if (!idea) return;
                            setIsGenerating(true);
                            try {
                              if (!user) return;
                              
                              const { data } = await supabase
                                .from('users')
                                .select('subscription_tier')
                                .eq('id', user.id)
                                .single();
                              
                              const result = await callApiGateway('check-ai-router', {
                                task: 'projectSuggestion',
                                content: `
                                  Generate a detailed description for this project based on the idea:
                                  Idea: ${idea.title}
                                  Description: ${idea.description}
                                  Target Audience: ${idea.target_audience || 'Not specified'}
                                  Problem: ${idea.problem_solved || 'Not specified'}
                                  Just return the description, nothing else.
                                `,
                                userTier: data?.subscription_tier || 'free'
                              });
                              
                              setProjectDescription(result.content.trim());
                              
                              // Immediately update the document to reflect changes
                              setTimeout(() => {
                                updateProjectDocument();
                              }, 50);
                            } catch (error) {
                              console.error('Error generating with AI:', error);
                              toast({
                                title: 'Error',
                                description: 'Failed to generate with AI',
                                variant: 'destructive',
                              });
                            } finally {
                              setIsGenerating(false);
                            }
                          }}
                          disabled={isGenerating || !idea}
                        >
                          Generate with AI
                        </Button>
                      )}
                    </div>
                    <Textarea 
                      placeholder="Describe your project"
                      rows={3}
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Goals
                      </label>
                      {projectGoals ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-5 px-2 py-0 text-blue-600"
                          onClick={async () => {
                            setIsGenerating(true);
                            try {
                              if (!user) return;
                              
                              const { data } = await supabase
                                .from('users')
                                .select('subscription_tier')
                                .eq('id', user.id)
                                .single();
                              
                              const result = await callApiGateway('check-ai-router', {
                                task: 'projectSuggestion',
                                content: `
                                  Complete or improve these project goals: "${projectGoals}".
                                  Make them SMART (Specific, Measurable, Achievable, Relevant, Time-bound).
                                  Format as bullet points. Just return the improved goals, nothing else.
                                `,
                                userTier: data?.subscription_tier || 'free'
                              });
                              
                              setProjectGoals(result.content.trim());
                            } catch (error) {
                              console.error('Error completing with AI:', error);
                              toast({
                                title: 'Error',
                                description: 'Failed to complete with AI',
                                variant: 'destructive',
                              });
                            } finally {
                              setIsGenerating(false);
                            }
                          }}
                          disabled={isGenerating}
                        >
                          Complete with AI
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-5 px-2 py-0 text-blue-600"
                          onClick={async () => {
                            if (!idea || !projectName || !projectDescription) return;
                            setIsGenerating(true);
                            try {
                              if (!user) return;
                              
                              const { data } = await supabase
                                .from('users')
                                .select('subscription_tier')
                                .eq('id', user.id)
                                .single();
                              
                              const result = await callApiGateway('check-ai-router', {
                                task: 'projectSuggestion',
                                content: `
                                  Generate SMART goals for this project:
                                  Project: ${projectName}
                                  Description: ${projectDescription}
                                  Based on idea: ${idea.description}
                                  Format as bullet points. Just return the goals as bullet points, nothing else.
                                `,
                                userTier: data?.subscription_tier || 'free'
                              });
                              
                              setProjectGoals(result.content.trim());
                              
                              // Immediately update the document to reflect changes
                              setTimeout(() => {
                                updateProjectDocument();
                              }, 50);
                            } catch (error) {
                              console.error('Error generating with AI:', error);
                              toast({
                                title: 'Error',
                                description: 'Failed to generate with AI',
                                variant: 'destructive',
                              });
                            } finally {
                              setIsGenerating(false);
                            }
                          }}
                          disabled={isGenerating || !idea || !projectName || !projectDescription}
                        >
                          Generate with AI
                        </Button>
                      )}
                    </div>
                    <Textarea 
                      placeholder="What are the main goals of this project?"
                      rows={3}
                      value={projectGoals}
                      onChange={(e) => setProjectGoals(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Key Features
                      </label>
                      {keyFeatures ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-5 px-2 py-0 text-blue-600"
                          onClick={async () => {
                            setIsGenerating(true);
                            try {
                              if (!user) return;
                              
                              const { data } = await supabase
                                .from('users')
                                .select('subscription_tier')
                                .eq('id', user.id)
                                .single();
                              
                              const result = await callApiGateway('check-ai-router', {
                                task: 'projectSuggestion',
                                content: `
                                  Complete or enhance these key features: "${keyFeatures}".
                                  Focus on the most valuable features for users. 
                                  Format as bullet points with brief descriptions.
                                  Just return the improved features, nothing else.
                                `,
                                userTier: data?.subscription_tier || 'free'
                              });
                              
                              setKeyFeatures(result.content.trim());
                            } catch (error) {
                              console.error('Error completing with AI:', error);
                              toast({
                                title: 'Error',
                                description: 'Failed to complete with AI',
                                variant: 'destructive',
                              });
                            } finally {
                              setIsGenerating(false);
                            }
                          }}
                          disabled={isGenerating}
                        >
                          Complete with AI
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-5 px-2 py-0 text-blue-600"
                          onClick={async () => {
                            if (!idea || !projectName || !projectDescription) return;
                            setIsGenerating(true);
                            try {
                              if (!user) return;
                              
                              const { data } = await supabase
                                .from('users')
                                .select('subscription_tier')
                                .eq('id', user.id)
                                .single();
                              
                              const result = await callApiGateway('check-ai-router', {
                                task: 'projectSuggestion',
                                content: `
                                  Generate key features for this SaaS project:
                                  Project: ${projectName}
                                  Description: ${projectDescription}
                                  Goals: ${projectGoals}
                                  Based on idea: ${idea.description}
                                  Format as bullet points with brief descriptions. Just return the features, nothing else.
                                `,
                                userTier: data?.subscription_tier || 'free'
                              });
                              
                              setKeyFeatures(result.content.trim());
                              
                              // Immediately update the document to reflect changes
                              setTimeout(() => {
                                updateProjectDocument();
                              }, 50);
                            } catch (error) {
                              console.error('Error generating with AI:', error);
                              toast({
                                title: 'Error',
                                description: 'Failed to generate with AI',
                                variant: 'destructive',
                              });
                            } finally {
                              setIsGenerating(false);
                            }
                          }}
                          disabled={isGenerating || !idea || !projectName || !projectDescription}
                        >
                          Generate with AI
                        </Button>
                      )}
                    </div>
                    <Textarea 
                      placeholder="List the key features of this project"
                      rows={4}
                      value={keyFeatures}
                      onChange={(e) => setKeyFeatures(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Additional Considerations
                      </label>
                      {additionalConsiderations ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-5 px-2 py-0 text-blue-600"
                          onClick={async () => {
                            setIsGenerating(true);
                            try {
                              if (!user) return;
                              
                              const { data } = await supabase
                                .from('users')
                                .select('subscription_tier')
                                .eq('id', user.id)
                                .single();
                              
                              const result = await callApiGateway('check-ai-router', {
                                task: 'projectSuggestion',
                                content: `
                                  Complete or enhance these additional considerations: "${additionalConsiderations}".
                                  Consider technical requirements, market considerations, challenges, and risks.
                                  Format as bullet points grouped by category (Technical, Market, Risks, etc.).
                                  Just return the improved considerations, nothing else.
                                `,
                                userTier: data?.subscription_tier || 'free'
                              });
                              
                              setAdditionalConsiderations(result.content.trim());
                            } catch (error) {
                              console.error('Error completing with AI:', error);
                              toast({
                                title: 'Error',
                                description: 'Failed to complete with AI',
                                variant: 'destructive',
                              });
                            } finally {
                              setIsGenerating(false);
                            }
                          }}
                          disabled={isGenerating}
                        >
                          Complete with AI
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-5 px-2 py-0 text-blue-600"
                          onClick={async () => {
                            if (!idea || !projectName || !projectDescription) return;
                            setIsGenerating(true);
                            try {
                              if (!user) return;
                              
                              const { data } = await supabase
                                .from('users')
                                .select('subscription_tier')
                                .eq('id', user.id)
                                .single();
                              
                              const result = await callApiGateway('check-ai-router', {
                                task: 'projectSuggestion',
                                content: `
                                  Generate additional considerations for this SaaS project:
                                  Project: ${projectName}
                                  Description: ${projectDescription}
                                  Goals: ${projectGoals}
                                  Features: ${keyFeatures}
                                  Based on idea: ${idea.description}
                                  Include technical requirements, market considerations, challenges, and risks.
                                  Format as bullet points grouped by category. Just return the considerations, nothing else.
                                `,
                                userTier: data?.subscription_tier || 'free'
                              });
                              
                              setAdditionalConsiderations(result.content.trim());
                              
                              // Immediately update the document to reflect changes
                              setTimeout(() => {
                                updateProjectDocument();
                              }, 50);
                            } catch (error) {
                              console.error('Error generating with AI:', error);
                              toast({
                                title: 'Error',
                                description: 'Failed to generate with AI',
                                variant: 'destructive',
                              });
                            } finally {
                              setIsGenerating(false);
                            }
                          }}
                          disabled={isGenerating || !idea || !projectName || !projectDescription}
                        >
                          Generate with AI
                        </Button>
                      )}
                    </div>
                    <Textarea 
                      placeholder="Any technical requirements, market considerations, or challenges"
                      rows={4}
                      value={additionalConsiderations}
                      onChange={(e) => setAdditionalConsiderations(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              
              {/* Document preview has been removed as requested */}
              
              {suggestedProject && !documentContent && (
                <div className="mt-6 space-y-4">
                  <Separator />
                  <h3 className="text-lg font-medium">AI-Generated Project Suggestion</h3>
                  
                  <div className="prose prose-blue max-w-none border rounded-md p-4 bg-blue-50">
                    <div dangerouslySetInnerHTML={{ __html: suggestedProject.content.replace(/\n/g, '<br/>') }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate(previousPath)}>
            Back
          </Button>
          <div>
            <Button 
              onClick={handleCreateProject} 
              disabled={isSaving || !projectName.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Project Development Journey</CardTitle>
          <CardDescription>
            Your recommended project workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-800 rounded-full h-8 w-8 flex items-center justify-center font-medium">1</div>
              <div className="flex-1">
                <h4 className="font-medium">Ideas Hub</h4>
                <p className="text-sm text-gray-600">Generate and refine your business ideas</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Current Step</Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-gray-100 text-gray-800 rounded-full h-8 w-8 flex items-center justify-center font-medium">2</div>
              <div className="flex-1">
                <h4 className="font-medium">Market Research</h4>
                <p className="text-sm text-gray-600">Validate your idea with comprehensive market analysis</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(ideaId ? `/market-research?ideaId=${ideaId}` : '/market-research')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-gray-100 text-gray-800 rounded-full h-8 w-8 flex items-center justify-center font-medium">3</div>
              <div className="flex-1">
                <h4 className="font-medium">Project Planning</h4>
                <p className="text-sm text-gray-600">Define scope, tech stack, roadmap, and resources</p>
              </div>
              <Button variant="ghost" size="sm" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-gray-100 text-gray-800 rounded-full h-8 w-8 flex items-center justify-center font-medium">4</div>
              <div className="flex-1">
                <h4 className="font-medium">Design & Development</h4>
                <p className="text-sm text-gray-600">Create visual designs and implement with Lovable.dev</p>
              </div>
              <Button variant="ghost" size="sm" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
