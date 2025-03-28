import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { AIModelIndicator } from '@/components/AIModelIndicator';
import { RefreshCcw, Save, PlayCircle, Workflow, Database, Layers, Calendar, Users } from 'lucide-react';

interface PlanningTabsProps {
  projectId: string;
  ideaId?: string;
  onUpdateDocument: (content: string) => void;
}

export default function PlanningTabs({ projectId, ideaId, onUpdateDocument }: PlanningTabsProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('scope');
  const [isLoading, setIsLoading] = useState(false);
  
  // State for each tab's content
  const [scope, setScope] = useState('');
  const [techStack, setTechStack] = useState('');
  const [roadmap, setRoadmap] = useState('');
  const [resources, setResources] = useState('');
  
  // Generated content for each tab
  const [generatedScope, setGeneratedScope] = useState('');
  const [generatedTechStack, setGeneratedTechStack] = useState('');
  const [generatedRoadmap, setGeneratedRoadmap] = useState('');
  const [generatedResources, setGeneratedResources] = useState('');

  // Sample mock function to generate planning content for any tab (would be replaced with actual API call)
  const generatePlan = async (tab: string, prompt: string) => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call an AI function
      // For now, we'll simulate a delay and return mock content
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let result = '';
      switch (tab) {
        case 'scope':
          result = `## Project Scope & MVP Definition

### Project Overview
This project aims to create a SaaS application that helps users generate, research, and develop business ideas efficiently using AI assistance. The application will provide comprehensive idea evaluation, market research, and development planning tools.

### MVP Features
1. **Idea Generation & Management**
   - AI-powered idea generation based on user interests and market trends
   - Idea organization with tags and categories
   - Idea evaluation and scoring

2. **Market Research**
   - Competitor analysis tool
   - Target audience definition
   - Market size and growth potential evaluation

3. **Project Planning**
   - MVP scope definition
   - Technology stack recommendation
   - Development roadmap creation
   - Resource estimation

### Out of Scope for MVP
- Detailed financial modeling
- Integration with third-party project management tools
- Custom branding options
- Team collaboration features (will be added in v2)

### Success Criteria
- Users can generate at least 10 quality business ideas
- Market research produced is accurate and actionable
- Project plans generated are realistic and implementable
- Minimum user satisfaction rating of 4.2/5`;
          setGeneratedScope(result);
          break;
        case 'techStack':
          result = `## Technology Stack & Integration Plan

### Frontend Technologies
- **Framework**: React with Next.js for server-side rendering
- **UI Library**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API for simple state, Zustand for complex state
- **Form Handling**: React Hook Form with Zod validation

### Backend Technologies
- **API**: Next.js API routes for simple functions, Supabase Edge Functions for complex operations
- **Database**: Supabase (PostgreSQL) for structured data
- **Authentication**: Supabase Auth with social login options
- **Storage**: Supabase Storage for user-generated content

### AI Integration
- **Primary LLM**: OpenAI GPT-4 for idea generation and analysis
- **Vector Database**: Supabase pgvector for semantic search
- **Document Processing**: LangChain for document analysis

### DevOps & Infrastructure
- **Hosting**: Vercel for frontend and serverless functions
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Monitoring**: Vercel Analytics and Sentry for error tracking

### Integration Points
1. **OpenAI API**: For AI-powered features
2. **Supabase**: For database, auth, and storage
3. **Stripe**: For subscription management
4. **SendGrid**: For transactional emails

### Security Considerations
- HTTPS for all connections
- JWT for authentication
- Row-level security in Supabase
- Regular security audits`;
          setGeneratedTechStack(result);
          break;
        case 'roadmap':
          result = `## Development Roadmap & Milestones

### Phase 1: Foundation (Weeks 1-3)
- Set up project repository and development environment
- Configure Supabase database schema and auth
- Create basic UI components and layouts
- Implement user authentication flow
- **Milestone**: Working authentication and basic navigation

### Phase 2: Core Features (Weeks 4-8)
- Implement idea generation and management features
- Create market research components
- Develop project planning functionality
- Add document generation capabilities
- **Milestone**: All core features functional in development environment

### Phase 3: AI Integration (Weeks 9-12)
- Integrate OpenAI API for idea generation
- Implement AI-powered market analysis
- Add project recommendations engine
- Create dynamic content generation
- **Milestone**: AI features fully functional

### Phase 4: Polishing & Testing (Weeks 13-16)
- Perform comprehensive testing
- Optimize for performance
- Implement feedback from beta testers
- Add final UI polish and animations
- **Milestone**: Production-ready application

### Launch Plan (Week 17)
- Final security audit
- Deploy to production
- Launch marketing campaign
- Monitor performance and gather initial feedback

### Post-Launch (Weeks 18-24)
- Implement critical feedback from initial users
- Develop secondary features based on user requests
- Optimize conversion funnel
- Begin planning for v2 features`;
          setGeneratedRoadmap(result);
          break;
        case 'resources':
          result = `## Resource and Time Estimation

### Team Requirements
- **1 Product Manager** (Full-time)
  - Responsible for feature prioritization, roadmap, and user research
  - Estimated effort: 40 hours/week

- **2 Full-Stack Developers** (Full-time)
  - Responsible for implementation of frontend and backend features
  - Estimated effort: 80 hours/week total

- **1 AI/ML Engineer** (Part-time)
  - Responsible for AI integration and optimization
  - Estimated effort: 20 hours/week

- **1 UI/UX Designer** (Part-time)
  - Responsible for user experience and interface design
  - Estimated effort: 20 hours/week

### Time Estimation
- **Total Development Time**: 17 weeks (4 months)
- **Buffer for Unexpected Challenges**: 3 weeks
- **Total Project Timeline**: 20 weeks (5 months)

### Budget Considerations
- **Development Costs**: $120,000 - $150,000
- **Infrastructure & Services**: $500 - $1,000 per month
- **AI API Costs**: $2,000 - $5,000 per month (depending on usage)
- **Marketing Budget**: $10,000 - $15,000 for initial launch

### Risk Assessment
- **High Risk Areas**:
  - AI integration complexity
  - User adoption and engagement
  - Scaling costs if usage grows rapidly

- **Mitigation Strategies**:
  - Start with simpler AI features and expand
  - Implement thorough user testing throughout development
  - Design infrastructure for cost-efficient scaling`;
          setGeneratedResources(result);
          break;
      }
      
      // Update the document with all content
      updateDocument();
      
      toast({
        title: "Plan generated",
        description: `${tab.charAt(0).toUpperCase() + tab.slice(1)} has been generated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to compile all planning into a single document
  const updateDocument = () => {
    const documentContent = `# Project Planning Document

## Project Scope & MVP Definition
${generatedScope || scope || "Not yet generated"}

## Technology Stack & Integration Plan
${generatedTechStack || techStack || "Not yet generated"}

## Development Roadmap & Milestones
${generatedRoadmap || roadmap || "Not yet generated"}

## Resource and Time Estimation
${generatedResources || resources || "Not yet generated"}`;

    onUpdateDocument(documentContent);
  };
  
  // Handle saving custom content
  const handleSaveContent = (tab: string, content: string) => {
    switch (tab) {
      case 'scope':
        setScope(content);
        break;
      case 'techStack':
        setTechStack(content);
        break;
      case 'roadmap':
        setRoadmap(content);
        break;
      case 'resources':
        setResources(content);
        break;
    }
    
    updateDocument();
    
    toast({
      title: "Content saved",
      description: `Your ${tab} plan has been saved.`,
    });
  };
  
  // Handle generating all sections at once
  const generateAll = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call an AI function to generate all sections
      await Promise.all([
        generatePlan('scope', ''),
        generatePlan('techStack', ''),
        generatePlan('roadmap', ''),
        generatePlan('resources', '')
      ]);
      
      toast({
        title: "All plans generated",
        description: "All project planning sections have been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate all plans. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Project Planning</h2>
        <Button 
          onClick={generateAll}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <PlayCircle className="w-4 h-4 mr-2" />
          {isLoading ? "Generating..." : "Generate Full Plan"}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Planning Components</CardTitle>
          <CardDescription>
            Define your project scope, technology, timeline, and resource requirements
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="scope" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="scope">
                <Workflow className="w-4 h-4 mr-2" />
                Project Scope
              </TabsTrigger>
              <TabsTrigger value="techStack">
                <Database className="w-4 h-4 mr-2" />
                Tech Stack
              </TabsTrigger>
              <TabsTrigger value="roadmap">
                <Layers className="w-4 h-4 mr-2" />
                Roadmap
              </TabsTrigger>
              <TabsTrigger value="resources">
                <Users className="w-4 h-4 mr-2" />
                Resources
              </TabsTrigger>
            </TabsList>
            
            {/* Project Scope Tab */}
            <TabsContent value="scope" className="pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Project Scope & MVP Definition</h3>
                  <p className="text-sm text-gray-500">Define your project scope, core features, and success criteria</p>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => generatePlan('scope', '')}
                  disabled={isLoading}
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  {isLoading ? "Generating..." : "Generate"}
                </Button>
              </div>
              
              {generatedScope ? (
                <div className="border rounded-md p-4 prose prose-blue max-w-none">
                  <div className="mb-2 flex justify-between items-center">
                    <Badge variant="outline" className="bg-blue-50">AI Generated</Badge>
                    <AIModelIndicator model="GPT-4" features={{ webSearch: false }} />
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: generatedScope.replace(/\n/g, '<br/>') }} />
                </div>
              ) : (
                <div className="space-y-4">
                  <Textarea 
                    placeholder="Define your project scope or generate with AI" 
                    className="min-h-[200px]"
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleSaveContent('scope', scope)}
                    disabled={!scope.trim()}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Scope
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {/* Tech Stack Tab */}
            <TabsContent value="techStack" className="pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Technology Stack & Integration Plan</h3>
                  <p className="text-sm text-gray-500">Define your technology choices, architecture, and integration points</p>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => generatePlan('techStack', '')}
                  disabled={isLoading}
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  {isLoading ? "Generating..." : "Generate"}
                </Button>
              </div>
              
              {generatedTechStack ? (
                <div className="border rounded-md p-4 prose prose-blue max-w-none">
                  <div className="mb-2 flex justify-between items-center">
                    <Badge variant="outline" className="bg-blue-50">AI Generated</Badge>
                    <AIModelIndicator model="GPT-4" features={{ webSearch: false }} />
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: generatedTechStack.replace(/\n/g, '<br/>') }} />
                </div>
              ) : (
                <div className="space-y-4">
                  <Textarea 
                    placeholder="Define your technology stack or generate with AI" 
                    className="min-h-[200px]"
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleSaveContent('techStack', techStack)}
                    disabled={!techStack.trim()}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Tech Stack
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {/* Roadmap Tab */}
            <TabsContent value="roadmap" className="pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Development Roadmap & Milestones</h3>
                  <p className="text-sm text-gray-500">Plan your development phases, milestones, and timeline</p>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => generatePlan('roadmap', '')}
                  disabled={isLoading}
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  {isLoading ? "Generating..." : "Generate"}
                </Button>
              </div>
              
              {generatedRoadmap ? (
                <div className="border rounded-md p-4 prose prose-blue max-w-none">
                  <div className="mb-2 flex justify-between items-center">
                    <Badge variant="outline" className="bg-blue-50">AI Generated</Badge>
                    <AIModelIndicator model="GPT-4" features={{ webSearch: false }} />
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: generatedRoadmap.replace(/\n/g, '<br/>') }} />
                </div>
              ) : (
                <div className="space-y-4">
                  <Textarea 
                    placeholder="Define your development roadmap or generate with AI" 
                    className="min-h-[200px]"
                    value={roadmap}
                    onChange={(e) => setRoadmap(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleSaveContent('roadmap', roadmap)}
                    disabled={!roadmap.trim()}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Roadmap
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {/* Resources Tab */}
            <TabsContent value="resources" className="pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Resource and Time Estimation</h3>
                  <p className="text-sm text-gray-500">Estimate required team, time, and budget for your project</p>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => generatePlan('resources', '')}
                  disabled={isLoading}
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  {isLoading ? "Generating..." : "Generate"}
                </Button>
              </div>
              
              {generatedResources ? (
                <div className="border rounded-md p-4 prose prose-blue max-w-none">
                  <div className="mb-2 flex justify-between items-center">
                    <Badge variant="outline" className="bg-blue-50">AI Generated</Badge>
                    <AIModelIndicator model="GPT-4" features={{ webSearch: false }} />
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: generatedResources.replace(/\n/g, '<br/>') }} />
                </div>
              ) : (
                <div className="space-y-4">
                  <Textarea 
                    placeholder="Estimate your resource requirements or generate with AI" 
                    className="min-h-[200px]"
                    value={resources}
                    onChange={(e) => setResources(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleSaveContent('resources', resources)}
                    disabled={!resources.trim()}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Estimates
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}