import { useEffect, useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { Idea, IdeaCategory } from '@/types/supabase';
import { useIdeaForm } from '@/hooks/useIdeaForm';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import IdeaFormFields from './IdeaFormFields';
import CategorySelector from './CategorySelector';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Sparkles, 
  PenLine, 
  ArrowRight, 
  Target 
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface NewIdeaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (idea: Idea) => void;
  categories: IdeaCategory[];
  useAI?: boolean;
  initialData?: Idea;
  isEditing?: boolean;
}

export default function NewIdeaDialog({ 
  isOpen, 
  onClose, 
  onCreate, 
  categories,
  useAI = false,
  initialData,
  isEditing = false
}: NewIdeaDialogProps) {
  const { projects, fetchProjects } = useProjects();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [inputMethod, setInputMethod] = useState<'manual' | 'ai'>(useAI ? 'ai' : 'manual');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdea, setGeneratedIdea] = useState<Idea | null>(null);
  
  // AI generation parameters
  const [industry, setIndustry] = useState('');
  const [focusArea, setFocusArea] = useState('');
  const [creativeScope, setCreativeScope] = useState([50]); // Initial value 50%
  
  const {
    formData,
    selectedProject,
    selectedCategories,
    isSubmitting,
    setSelectedProject,
    setFormData,
    handleChange,
    handleTagsChange,
    handleCategoryChange,
    handleSubmit
  } = useIdeaForm({ 
    onCreate: (idea) => {
      onCreate(idea);
      setGeneratedIdea(null);
    }, 
    onClose,
    initialData,
    isEditing
  });
  
  // Load user's projects and set initial project when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchProjects().then(fetchedProjects => {
        if (fetchedProjects && fetchedProjects.length > 0) {
          // If editing, use the project from initialData
          if (isEditing && initialData) {
            setSelectedProject(initialData.project_id);
          } else if (!selectedProject) {
            // Otherwise, use the first project if none selected
            setSelectedProject(fetchedProjects[0].id);
          }
        }
      });
    }
  }, [isOpen, fetchProjects, selectedProject, setSelectedProject, isEditing, initialData]);
  
  // Initialize form data with initialData when editing
  useEffect(() => {
    if (isEditing && initialData && isOpen) {
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        target_audience: initialData.target_audience || '',
        problem_solved: initialData.problem_solved || '',
        tags: initialData.tags || []
      });
    }
  }, [isEditing, initialData, isOpen, setFormData]);
  
  // Reset generated idea when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setGeneratedIdea(null);
    }
  }, [isOpen]);
  
  // Handle AI idea generation
  const generateIdea = async () => {
    if (!industry.trim()) {
      toast({
        title: 'Input required',
        description: 'Please enter a target industry',
        variant: 'destructive',
      });
      return;
    }
    
    // Check if user has enough credits
    if ((profile?.credits_remaining || 0) < 5) {
      toast({
        title: 'Insufficient credits',
        description: 'You need at least 5 credits to generate an idea',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Mock AI generation for now - in a real implementation, this would call an AI service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // The creative scope will influence how focused or creative the generated idea is
      const creativityLevel = creativeScope[0] / 100; // Convert to 0-1 scale
      
      // This is where you would normally call your AI generation service
      // For this example, we'll just create a mock result
      const mockIdeas = [
        {
          title: `Smart ${industry} Analytics Platform`,
          description: `A SaaS platform that uses AI to analyze ${industry} data and provide actionable insights for businesses.`,
          target_audience: `${industry} businesses looking to optimize operations and increase profitability.`,
          problem_solved: "Businesses in this industry struggle with making data-driven decisions due to complex and unstructured data sources.",
          tags: [industry, "Analytics", "AI", "SaaS"]
        },
        {
          title: `${industry} Workflow Automation`,
          description: `An integrated system that automates routine tasks and workflows in the ${industry} sector, saving time and reducing errors.`,
          target_audience: `${industry} professionals and teams who need to streamline operations.`,
          problem_solved: "Manual processes and repetitive tasks that waste valuable time and resources in this industry.",
          tags: [industry, "Automation", "Productivity", "Workflow"]
        },
        {
          title: `${industry} Collaborative Platform`,
          description: `A collaborative workspace designed specifically for ${industry} teams to communicate, share resources, and track projects.`,
          target_audience: `Distributed teams in the ${industry} sector who need better collaboration tools.`,
          problem_solved: "Communication gaps and inefficient project management in distributed ${industry} teams.",
          tags: [industry, "Collaboration", "Teams", "Project Management"]
        }
      ];
      
      // Select a random idea from our mock ideas
      // In a real implementation, this would be the AI-generated idea
      const randomIndex = Math.floor(Math.random() * mockIdeas.length);
      const generatedContent = mockIdeas[randomIndex];
      
      // If focus area is provided, incorporate it into the idea
      if (focusArea.trim()) {
        generatedContent.title = `${generatedContent.title} for ${focusArea}`;
        generatedContent.description = generatedContent.description.replace(`${industry} data`, `${industry} ${focusArea} data`);
        generatedContent.tags.push(focusArea);
      }
      
      // Create a new idea object
      const newIdea: Partial<Idea> = {
        title: generatedContent.title,
        description: generatedContent.description,
        target_audience: generatedContent.target_audience,
        problem_solved: generatedContent.problem_solved,
        tags: generatedContent.tags,
        status: 'draft',
        // Add any other required fields
      };
      
      // Set the generated idea to display to the user
      setGeneratedIdea(newIdea as Idea);
      
      // Also update the form data so it's ready for submission
      setFormData({
        ...formData,
        title: newIdea.title || '',
        description: newIdea.description || '',
        target_audience: newIdea.target_audience || '',
        problem_solved: newIdea.problem_solved || '',
        tags: newIdea.tags || [],
      });
      
      toast({
        title: 'Idea generated',
        description: 'AI has generated an idea based on your inputs',
      });
    } catch (error) {
      console.error('Error generating idea:', error);
      toast({
        title: 'Generation failed',
        description: 'Failed to generate idea. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Idea' : 'Create New Idea'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details of your idea' : 'Add details about your SaaS idea manually or let AI generate one for you'}
          </DialogDescription>
        </DialogHeader>
        
        {!isEditing ? (
          <Tabs 
            defaultValue={inputMethod} 
            value={inputMethod} 
            onValueChange={(value) => setInputMethod(value as 'manual' | 'ai')}
            className="mt-2"
          >
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="manual" className="flex gap-2 items-center">
                <PenLine className="h-4 w-4" />
                Manual Input
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex gap-2 items-center">
                <Sparkles className="h-4 w-4" />
                AI Generation
              </TabsTrigger>
            </TabsList>
            
            {/* Manual Input Tab */}
            <TabsContent value="manual">
              <IdeaFormFields 
                formData={formData}
                handleChange={handleChange}
                handleTagsChange={handleTagsChange}
                projects={projects}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
              />
              
              {categories.length > 0 && (
                <CategorySelector 
                  categories={categories}
                  selectedCategories={selectedCategories}
                  onChange={handleCategoryChange}
                />
              )}
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Idea'
                  )}
                </Button>
              </DialogFooter>
            </TabsContent>
            
            {/* AI Generation Tab */}
            <TabsContent value="ai">
              {!generatedIdea ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="industry" className="text-right">
                      Target Industry <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="industry"
                      name="industry"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="e.g., Healthcare, Education, Fintech"
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="focusArea" className="text-right">
                      Focus Area
                    </Label>
                    <Input
                      id="focusArea"
                      name="focusArea"
                      value={focusArea}
                      onChange={(e) => setFocusArea(e.target.value)}
                      placeholder="e.g., Mobile apps, SMB market, Enterprise"
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 pt-4">
                    <Label htmlFor="creativeScope" className="text-right">
                      Idea Scope
                    </Label>
                    <div className="col-span-3 space-y-6">
                      <Slider
                        id="creativeScope"
                        value={creativeScope}
                        onValueChange={setCreativeScope}
                        max={100}
                        step={1}
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Focused</span>
                        <span>Creative</span>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
                        <p className="text-sm text-blue-800">
                          {creativeScope[0] < 30 ? (
                            "Generate highly focused ideas that strictly follow industry standards and conventional approaches."
                          ) : creativeScope[0] < 70 ? (
                            "Generate balanced ideas that combine proven approaches with some innovative elements."
                          ) : (
                            "Generate highly creative ideas that think outside the box and explore novel concepts."
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4 pt-4">
                    <div className="col-span-4 flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Cost: <span className="font-medium">5 credits</span>
                      </div>
                      <Button 
                        onClick={generateIdea} 
                        disabled={isGenerating || !industry.trim() || (profile?.credits_remaining || 0) < 5}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Idea
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <p className="text-xs text-gray-500">
                      AI will generate an idea based on your input and preferences. You'll have a chance to review and edit it before creating.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="border rounded-md p-4 bg-blue-50">
                    <div className="flex justify-between items-start mb-4">
                      <Badge className="bg-blue-100 text-blue-800">AI Generated Idea</Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setGeneratedIdea(null)}
                        className="h-8 px-2 text-gray-500"
                      >
                        Try Again
                      </Button>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">{generatedIdea.title}</h3>
                    <p className="mb-4">{generatedIdea.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Target Audience</h4>
                        <p className="text-sm">{generatedIdea.target_audience}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Problem Solved</h4>
                        <p className="text-sm">{generatedIdea.problem_solved}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      {generatedIdea.tags?.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {projects.length > 0 ? (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="project" className="text-right">
                        Project <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex items-center gap-4 col-span-3">
                        <select
                          id="project"
                          className="w-full rounded-md border border-input bg-background px-3 py-2"
                          value={selectedProject}
                          onChange={(e) => setSelectedProject(e.target.value)}
                        >
                          {projects.map(project => (
                            <option key={project.id} value={project.id}>
                              {project.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-md p-4 bg-yellow-50 text-yellow-800 text-sm">
                      No projects found. A project will be created automatically.
                    </div>
                  )}
                  
                  {categories.length > 0 && (
                    <CategorySelector 
                      categories={categories}
                      selectedCategories={selectedCategories}
                      onChange={handleCategoryChange}
                    />
                  )}
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleSubmit} 
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Create Idea
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="mt-2">
            <IdeaFormFields 
              formData={formData}
              handleChange={handleChange}
              handleTagsChange={handleTagsChange}
              projects={projects}
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
            />
            
            {categories.length > 0 && (
              <CategorySelector 
                categories={categories}
                selectedCategories={selectedCategories}
                onChange={handleCategoryChange}
              />
            )}
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}