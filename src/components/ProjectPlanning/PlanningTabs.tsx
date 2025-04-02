import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { AIModelIndicator } from '@/components/AIModelIndicator';
import { ContentGenerator } from '@/components/common';
import { 
  RefreshCcw, 
  Save, 
  Target, 
  ListTodo, 
  DollarSign, 
  AlertTriangle, 
  Users, 
  BarChart3 
} from 'lucide-react';
import { documentSectionService, ProjectPlanningSectionType } from '@/services/documentSectionService';
import { supabase } from '@/integrations/supabase/client';

interface PlanningTabsProps {
  projectId: string;
  ideaId?: string;
  onUpdateDocument: (content: string) => void;
}

export default function PlanningTabs({ projectId, ideaId, onUpdateDocument }: PlanningTabsProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('objectives');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // State for each tab's content
  const [objectives, setObjectives] = useState('');
  const [tasks, setTasks] = useState('');
  const [resources, setResources] = useState('');
  const [risks, setRisks] = useState('');
  const [stakeholders, setStakeholders] = useState('');
  const [metrics, setMetrics] = useState('');
  
  // Generated content for each tab
  const [generatedObjectives, setGeneratedObjectives] = useState('');
  const [generatedTasks, setGeneratedTasks] = useState('');
  const [generatedResources, setGeneratedResources] = useState('');
  const [generatedRisks, setGeneratedRisks] = useState('');
  const [generatedStakeholders, setGeneratedStakeholders] = useState('');
  const [generatedMetrics, setGeneratedMetrics] = useState('');

  // Get current user ID on component mount
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
    };
    getUser();
  }, []);

  // Load existing section content from individual documents
  useEffect(() => {
    if (projectId && userId) {
      loadSections();
    }
  }, [projectId, userId]);

  // Load all section documents
  const loadSections = async () => {
    try {
      setIsLoading(true);
      
      // Load each section document
      const objectivesDoc = await documentSectionService.getSection(projectId, 'project_planning_objectives');
      if (objectivesDoc?.content) setGeneratedObjectives(objectivesDoc.content);
      
      const tasksDoc = await documentSectionService.getSection(projectId, 'project_planning_tasks');
      if (tasksDoc?.content) setGeneratedTasks(tasksDoc.content);
      
      const resourcesDoc = await documentSectionService.getSection(projectId, 'project_planning_resources');
      if (resourcesDoc?.content) setGeneratedResources(resourcesDoc.content);
      
      const risksDoc = await documentSectionService.getSection(projectId, 'project_planning_risks');
      if (risksDoc?.content) setGeneratedRisks(risksDoc.content);
      
      const stakeholdersDoc = await documentSectionService.getSection(projectId, 'project_planning_stakeholders');
      if (stakeholdersDoc?.content) setGeneratedStakeholders(stakeholdersDoc.content);
      
      const metricsDoc = await documentSectionService.getSection(projectId, 'project_planning_metrics');
      if (metricsDoc?.content) setGeneratedMetrics(metricsDoc.content);
      
      // Update the consolidated document for backward compatibility
      updateDocument();
    } catch (error) {
      console.error('Error loading section documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load existing plan sections.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save a specific section to its individual document
  const saveSection = async (sectionType: ProjectPlanningSectionType, content: string) => {
    if (!userId || !projectId) {
      console.error('Cannot save section: missing userId or projectId');
      return;
    }
    
    try {
      await documentSectionService.saveSection(projectId, userId, sectionType, content);
      
      toast({
        title: 'Section saved',
        description: `Your ${sectionType.replace('project_planning_', '').replace('_', ' ')} plan has been saved to Documents Hub.`,
      });
    } catch (error) {
      console.error(`Error saving section ${sectionType}:`, error);
      toast({
        title: 'Error',
        description: 'Failed to save section document.',
        variant: 'destructive',
      });
    }
  };

  // Sample mock function to generate planning content for any tab (would be replaced with actual API call)
  const generatePlan = async (tab: string, prompt: string) => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call an AI function
      // For now, we'll simulate a delay and return mock content
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let result = '';
      let sectionType: ProjectPlanningSectionType;
      
      switch (tab) {
        case 'objectives':
          sectionType = 'project_planning_objectives';
          result = `## Objectives & Goals

### Primary Objective
Build and launch a SaaS productivity platform that helps knowledge workers manage tasks, documents, and collaboration in a unified interface.

### SMART Goals

1. **Specific**: Develop a minimum viable product (MVP) with core functionality for task management, document organization, and team collaboration features.

2. **Measurable**: 
   - Complete MVP development within 6 months
   - Achieve 100 beta users within first month post-launch
   - Reach 1,000 active users within 3 months of public launch
   - Attain 10% month-over-month user growth during first year

3. **Achievable**: 
   - Focus on narrow, well-defined feature set for initial release
   - Utilize existing frameworks and libraries to accelerate development
   - Implement proven UX patterns to reduce design complexity
   - Adopt iterative development approach with biweekly releases

4. **Relevant**:
   - Addresses validated market need for unified productivity tools
   - Leverages team's technical expertise in web application development
   - Aligns with long-term business strategy for recurring revenue model
   - Builds on existing user research and competitor analysis

5. **Time-bound**:
   - Product requirements finalized by Month 1
   - Alpha version ready for internal testing by Month 3
   - Beta version launched to selected users by Month 5
   - Public launch by Month 6

### Success Criteria
- User onboarding completion rate exceeds 75%
- User retention rate of 60%+ after 30 days
- Average session duration of 25+ minutes
- Net Promoter Score (NPS) of 40 or higher`;
          setGeneratedObjectives(result);
          break;
        case 'tasks':
          sectionType = 'project_planning_tasks';
          result = `## Tasks & Timeline

### Phase 1: Planning & Research (Weeks 1-4)
- [ ] **Week 1-2**: Finalize product requirements document
  - [ ] Complete user persona development
  - [ ] Prioritize feature list for MVP
  - [ ] Define UI/UX guidelines and design system
- [ ] **Week 3-4**: Create technical specification document
  - [ ] Determine technology stack
  - [ ] Define database schema
  - [ ] Design system architecture
  - [ ] Plan API endpoints
- [ ] **Week 3-4**: Set up development infrastructure
  - [ ] Configure version control
  - [ ] Set up CI/CD pipeline
  - [ ] Establish development, staging, and production environments

### Phase 2: Core Development (Weeks 5-16)
- [ ] **Weeks 5-8**: User authentication & account management
  - [ ] Implement registration and login flows
  - [ ] Create account settings and preferences
  - [ ] Build user profile features
- [ ] **Weeks 9-12**: Task management module
  - [ ] Develop task creation and editing
  - [ ] Implement task organization (lists, tags)
  - [ ] Build task scheduling and reminders
- [ ] **Weeks 13-16**: Document management module
  - [ ] Create document storage and organization
  - [ ] Implement document editing and versioning
  - [ ] Develop document sharing capabilities

### Phase 3: Collaboration Features (Weeks 17-20)
- [ ] **Weeks 17-18**: Team collaboration features
  - [ ] Implement team creation and management
  - [ ] Develop permissions system
  - [ ] Create activity feeds
- [ ] **Weeks 19-20**: Communication tools
  - [ ] Build commenting functionality
  - [ ] Implement notifications system
  - [ ] Create basic messaging features

### Phase 4: Testing & Refinement (Weeks 21-24)
- [ ] **Week 21**: Alpha testing (internal)
  - [ ] Conduct usability testing
  - [ ] Perform security audit
  - [ ] Run performance testing
- [ ] **Weeks 22-23**: Beta testing
  - [ ] Recruit beta testers
  - [ ] Collect and analyze feedback
  - [ ] Prioritize pre-launch fixes
- [ ] **Week 24**: Launch preparation
  - [ ] Finalize pricing model
  - [ ] Complete documentation
  - [ ] Prepare marketing materials

### Key Milestones
- **End of Month 1**: Product requirements and technical specifications completed
- **End of Month 3**: Alpha version ready for internal testing
- **End of Month 5**: Beta version launched to selected users
- **End of Month 6**: Public launch`;
          setGeneratedTasks(result);
          break;
        case 'resources':
          sectionType = 'project_planning_resources';
          result = `## Resource Allocation

### Human Resources

#### Core Team Requirements
- **Product Manager** (1, full-time)
  - Responsibilities: Product strategy, roadmap planning, feature prioritization
  - Estimated time: 40 hours/week for 6 months
  - Estimated cost: $45,000 ($90K annual salary)

- **UI/UX Designer** (1, full-time)
  - Responsibilities: User interface design, user experience, design system
  - Estimated time: 40 hours/week for 4 months
  - Estimated cost: $33,000 ($100K annual salary)

- **Frontend Developers** (2, full-time)
  - Responsibilities: Building responsive web app, implementing UI components
  - Estimated time: 80 hours/week combined for 6 months
  - Estimated cost: $90,000 ($90K annual salary each)

- **Backend Developers** (2, full-time)
  - Responsibilities: API development, database design, server infrastructure
  - Estimated time: 80 hours/week combined for 6 months
  - Estimated cost: $100,000 ($100K annual salary each)

- **QA Engineer** (1, half-time initially, full-time for last 2 months)
  - Responsibilities: Test planning, manual testing, automated testing
  - Estimated time: 20 hours/week for 4 months, 40 hours/week for 2 months
  - Estimated cost: $30,000 ($80K annual salary)

- **DevOps Engineer** (1, part-time)
  - Responsibilities: CI/CD, infrastructure setup, monitoring
  - Estimated time: 20 hours/week for 6 months
  - Estimated cost: $25,000 ($100K annual salary)

#### Contractors/Specialists (as needed)
- **Security Consultant** - $10,000 (audit and recommendations)
- **Legal Consultant** - $5,000 (Terms of Service, Privacy Policy)
- **Marketing Specialist** - $15,000 (launch strategy and execution)

### Technical Resources

#### Infrastructure (monthly costs)
- **Cloud Hosting**: $500/month
- **Database Services**: $200/month
- **Content Delivery Network**: $100/month
- **Monitoring & Logging**: $150/month
- **Email Service**: $50/month
- **Authentication Services**: $100/month

#### Development Tools (annual subscriptions)
- **Design Tools**: $2,400/year
- **Development IDEs**: $3,600/year
- **Project Management Software**: $1,800/year
- **CI/CD Tools**: $2,400/year
- **Testing Tools**: $1,200/year

### Financial Summary

#### Development Budget
- **Personnel Costs**: $353,000
- **Infrastructure (6 months)**: $6,600
- **Tools (prorated for 6 months)**: $5,700
- **Specialists/Contractors**: $30,000
- **Contingency (15%)**: $59,295

**Total Development Budget**: $454,595

#### Post-Launch Monthly Burn Rate
- **Core Team**: $43,000/month
- **Infrastructure**: $1,100/month 
- **Tools**: $950/month
- **Marketing & Customer Acquisition**: $10,000/month

**Monthly Operational Costs**: $55,050`;
          setGeneratedResources(result);
          break;
        case 'risks':
          sectionType = 'project_planning_risks';
          result = `## Risk Management

### Identified Risks

#### Technical Risks

| Risk | Probability | Impact | Severity | Mitigation Strategy |
|------|-------------|--------|----------|---------------------|
| **Integration complexity with third-party services** | High | Medium | High | Start with core integrations only; create abstraction layer for easier future additions; thorough integration testing |
| **Scalability issues** | Medium | High | High | Design for scale from start; implement load testing; use proven scalable cloud services |
| **Security vulnerabilities** | Medium | Critical | High | Regular security audits; follow security best practices; penetration testing before launch |
| **Data loss/corruption** | Low | Critical | Medium | Regular backups; validate data integrity; implement redundancy |
| **Browser compatibility issues** | Medium | Medium | Medium | Cross-browser testing; use established frameworks; progressive enhancement approach |

#### Product Risks

| Risk | Probability | Impact | Severity | Mitigation Strategy |
|------|-------------|--------|----------|---------------------|
| **Feature creep delaying launch** | High | High | High | Strict MVP definition; prioritize features rigorously; defer non-essential functionality |
| **Poor user experience** | Medium | High | High | Early usability testing; gather feedback throughout development; iterative UX improvements |
| **Missing market needs** | Medium | High | High | Validate with potential users throughout development; beta testing program; flexible roadmap |
| **Performance issues** | Medium | Medium | Medium | Set performance budgets; regular performance testing; optimize during development |
| **Accessibility compliance issues** | Medium | Medium | Medium | Follow WCAG standards; accessibility testing; include in QA process |

#### Business Risks

| Risk | Probability | Impact | Severity | Mitigation Strategy |
|------|-------------|--------|----------|---------------------|
| **Budget overruns** | High | High | High | Detailed cost tracking; regular financial reviews; contingency budget; phase functionality if needed |
| **Schedule delays** | High | Medium | High | Agile development approach; buffer time in schedule; minimum viable scope definition |
| **Team turnover** | Medium | High | High | Knowledge sharing; documentation; competitive compensation; positive work culture |
| **Competition releasing similar product** | Medium | High | High | Accelerate timeline for unique features; focus on differentiation; monitor competitor activities |
| **Insufficient user adoption** | Medium | Critical | High | Early marketing; beta program; focus on core user value; easy onboarding |

### Contingency Plans

#### Technical Contingencies
- **Fallback Integrations**: Identify alternative service providers for critical integrations
- **Performance Issues**: Ready-to-implement caching strategies and performance optimizations
- **Security Incident**: Documented incident response plan and communication templates

#### Project Management Contingencies
- **Timeline Slippage**: Prioritized feature list with clear "cut line" for launch
- **Resource Shortage**: Identified potential contractors who can join quickly if needed
- **Quality Issues**: Pre-defined quality gates with go/no-go criteria

#### Business Contingencies
- **Pivot Strategy**: Alternative product positioning if initial approach doesn't resonate
- **Budget Exhaustion Plan**: Minimum viable features that could be released with reduced scope
- **Competitor Response**: Differentiation strategy focusing on unique value proposition`;
          setGeneratedRisks(result);
          break;
        case 'stakeholders':
          sectionType = 'project_planning_stakeholders';
          result = `## Stakeholder Analysis

### Internal Stakeholders

| Stakeholder | Role/Influence | Key Interests | Engagement Strategy |
|-------------|----------------|---------------|---------------------|
| **Executive Team** | Decision makers; budget approval; strategic direction | ROI; market position; alignment with company vision | Monthly executive reviews; strategic alignment documents; clear success metrics reporting |
| **Development Team** | Build and maintain the product; technical feasibility | Clear requirements; reasonable timelines; technical challenges | Weekly standups; documentation; involvement in planning; regular feedback sessions |
| **Product Management** | Define features; prioritize work; user advocacy | User needs; market fit; feature completeness | Daily collaboration; shared access to user research; joint decision-making process |
| **Marketing Team** | Positioning; messaging; customer acquisition | Value proposition; target audience; launch timing | Bi-weekly updates; early access to product; messaging workshops |
| **Sales Team** | Revenue generation; customer relationships | Pricing; competitive advantages; feature comparisons | Regular demos; sales enablement materials; feedback channels |
| **Customer Support** | User assistance; feedback collection | Usability; documentation; known issues | Training sessions; knowledge base creation; feedback loops |
| **Investors/Board** | Funding; governance; strategic oversight | Growth metrics; market validation; financial performance | Quarterly presentations; milestone achievements; financial projections |

### External Stakeholders

| Stakeholder | Role/Influence | Key Interests | Engagement Strategy |
|-------------|----------------|---------------|---------------------|
| **End Users** | Product adoption; feedback; advocacy | Usability; value delivery; reliability; support | Beta program; user testing; feedback channels; community building |
| **Integration Partners** | Extend product functionality; co-marketing | API stability; documentation; mutual benefits | Partner program; technical documentation; relationship management |
| **Technology Vendors** | Infrastructure; tools; services | Usage volume; long-term contracts; reference cases | Service level agreements; regular reviews; clear requirements |
| **Competitors** | Market influence; potential threats | Differentiation points; feature parity; pricing models | Competitive analysis; market intelligence; positioning strategy |
| **Industry Analysts** | Market perception; recommendations | Innovation; market trends; product positioning | Analyst briefings; product roadmap sharing; case studies |
| **Regulatory Bodies** | Compliance requirements; potential limitations | Data protection; accessibility; industry standards | Compliance reviews; documentation; proactive communication |

### Communication Plan

#### Regular Communications
- **Daily**: Development team standups
- **Weekly**: Cross-functional project status meetings
- **Bi-weekly**: Stakeholder updates (email newsletter format)
- **Monthly**: Executive review and steering committee
- **Quarterly**: Board/investor presentations and roadmap reviews

#### Key Stakeholder Touchpoints
- Pre-development requirements validation
- Alpha testing invitations and feedback collection
- Beta program onboarding and feedback sessions
- Pre-launch readiness review
- Post-launch retrospective and feedback analysis

#### Feedback Channels
- Dedicated stakeholder feedback portal
- Regular user testing sessions
- Feature request and prioritization process
- Automated usage analytics and reporting
- Customer support ticket analysis`;
          setGeneratedStakeholders(result);
          break;
        case 'metrics':
          sectionType = 'project_planning_metrics';
          result = `## Metrics & Success Criteria

### Business KPIs

| Metric | Target | Measurement Method | Reporting Frequency |
|--------|--------|-------------------|---------------------|
| **Customer Acquisition Cost (CAC)** | < $100 per customer | Marketing spend ÷ New customers | Monthly |
| **Customer Lifetime Value (LTV)** | > $500 per customer | (Average Revenue Per User × Gross Margin) ÷ Churn Rate | Quarterly |
| **LTV:CAC Ratio** | > 3:1 | LTV ÷ CAC | Quarterly |
| **Monthly Recurring Revenue (MRR)** | $50,000 by month 6 | Sum of monthly subscription revenue | Weekly |
| **Revenue Growth Rate** | 15% month-over-month | (Current MRR - Previous MRR) ÷ Previous MRR | Monthly |
| **Gross Margin** | > 75% | (Revenue - COGS) ÷ Revenue | Monthly |
| **Cash Burn Rate** | < $60,000/month | Total monthly expenses | Weekly |
| **Months of Runway** | > 12 months | Available Cash ÷ Burn Rate | Monthly |

### Product KPIs

| Metric | Target | Measurement Method | Reporting Frequency |
|--------|--------|-------------------|---------------------|
| **User Activation Rate** | > 60% | Users completing onboarding ÷ Signed-up users | Weekly |
| **Feature Adoption Rate** | > 40% per core feature | Users using feature ÷ Total active users | Weekly |
| **Monthly Active Users (MAU)** | 5,000 by month 6 post-launch | Count of unique users with session in last 30 days | Weekly |
| **Daily Active Users (DAU)** | 1,500 by month 6 post-launch | Count of unique users with session in last day | Daily |
| **DAU/MAU Ratio** | > 0.3 | DAU ÷ MAU | Weekly |
| **Average Session Duration** | > 20 minutes | Average time users spend in app per session | Weekly |
| **Average Actions Per Session** | > 15 actions | Average count of user interactions per session | Weekly |
| **User Retention Rate** | > 60% at 30 days | Users active in month 1 and month 2 ÷ Users active in month 1 | Monthly |

### Technical KPIs

| Metric | Target | Measurement Method | Reporting Frequency |
|--------|--------|-------------------|---------------------|
| **Application Performance** | < 2 second load time | Average page load speed | Daily |
| **API Response Time** | < 200ms average | Average API endpoint response time | Daily |
| **System Uptime** | > 99.9% | Total uptime ÷ Total time period | Weekly |
| **Error Rate** | < 0.5% | Errors ÷ Total requests | Daily |
| **Deployment Frequency** | 2+ per week | Count of production deployments | Weekly |
| **Deployment Success Rate** | > 95% | Successful deployments ÷ Total deployments | Weekly |
| **Mean Time to Recovery (MTTR)** | < 2 hours | Average time to resolve production incidents | Monthly |
| **Code Coverage** | > 80% | Lines of code covered by tests ÷ Total lines of code | Weekly |

### Success Criteria for Launch

#### Minimum Success Criteria (Must achieve all)
- Complete all critical MVP features
- Pass all security and performance tests
- Successfully onboard at least 100 beta users
- Achieve < 1% critical error rate in production
- Maintain API response times under 500ms at projected load

#### Target Success Criteria (Aim to achieve most)
- 1,000 registered users within first month
- 50% of free trial users convert to paid
- Net Promoter Score (NPS) of 40+
- Feature adoption rate of 70%+ for core features
- Customer support ticket volume < 0.1 per user

#### Stretch Success Criteria
- 3,000+ registered users within first month
- 70% of free trial users convert to paid
- Net Promoter Score (NPS) of 60+
- Feature adoption rate of 85%+ for core features
- Average of 3+ workspace collaborators per account`;
          setGeneratedMetrics(result);
          break;
        default:
          throw new Error(`Unknown tab: ${tab}`);
      }
      
      // Save the generated content to its individual document
      if (userId) {
        await saveSection(sectionType, result);
      }
      
      // Update the consolidated document for backward compatibility
      updateDocument();
      
      toast({
        title: "Plan generated",
        description: `${tab.charAt(0).toUpperCase() + tab.slice(1)} has been generated successfully.`,
      });
    } catch (error) {
      console.error('Error generating plan:', error);
      toast({
        title: "Error",
        description: "Failed to generate plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to compile all planning into a single document (for backward compatibility)
  const updateDocument = () => {
    const documentContent = `# Project Planning Document

## Objectives & Goals
${generatedObjectives || objectives || "Not yet generated"}

## Tasks & Timeline
${generatedTasks || tasks || "Not yet generated"}

## Resource Allocation
${generatedResources || resources || "Not yet generated"}

## Risk Management
${generatedRisks || risks || "Not yet generated"}

## Stakeholder Analysis
${generatedStakeholders || stakeholders || "Not yet generated"}

## Metrics & Success Criteria
${generatedMetrics || metrics || "Not yet generated"}`;

    onUpdateDocument(documentContent);
  };
  
  // Handle saving custom content
  const handleSaveContent = async (tab: string, content: string) => {
    if (!userId || !projectId) {
      console.error("Cannot save content: missing userId or projectId");
      return;
    }
    
    // First update the local state
    switch (tab) {
      case 'objectives':
        setObjectives(content);
        await saveSection('project_planning_objectives', content);
        break;
      case 'tasks':
        setTasks(content);
        await saveSection('project_planning_tasks', content);
        break;
      case 'resources':
        setResources(content);
        await saveSection('project_planning_resources', content);
        break;
      case 'risks':
        setRisks(content);
        await saveSection('project_planning_risks', content);
        break;
      case 'stakeholders':
        setStakeholders(content);
        await saveSection('project_planning_stakeholders', content);
        break;
      case 'metrics':
        setMetrics(content);
        await saveSection('project_planning_metrics', content);
        break;
    }
    
    // Update the consolidated document for backward compatibility
    updateDocument();
  };
  
  // Handle expanding content
  const handleExpandContent = async (tab: string, content: string) => {
    if (!userId || !projectId) {
      console.error("Cannot expand content: missing userId or projectId");
      return;
    }
    
    setIsLoading(true);
    try {
      // Simulate AI expansion
      await new Promise(resolve => setTimeout(resolve, 1500));
      let expandedContent = '';
      let sectionType: ProjectPlanningSectionType;
      
      switch (tab) {
        case 'objectives':
          sectionType = 'project_planning_objectives';
          expandedContent = content + "\n\n## Success Criteria\nThe AI has added specific success criteria and KPIs to measure the achievement of your objectives.";
          setGeneratedObjectives(expandedContent);
          break;
        case 'tasks':
          sectionType = 'project_planning_tasks';
          expandedContent = content + "\n\n## Task Prioritization\nThe AI has enhanced your timeline with task prioritization guidelines and critical path analysis.";
          setGeneratedTasks(expandedContent);
          break;
        case 'resources':
          sectionType = 'project_planning_resources';
          expandedContent = content + "\n\n## Resource Optimization\nThe AI has enhanced your resource plan with optimization strategies and cost-saving recommendations.";
          setGeneratedResources(expandedContent);
          break;
        case 'risks':
          sectionType = 'project_planning_risks';
          expandedContent = content + "\n\n## Risk Response Planning\nThe AI has enhanced your risk analysis with detailed contingency plans and risk response strategies.";
          setGeneratedRisks(expandedContent);
          break;
        case 'stakeholders':
          sectionType = 'project_planning_stakeholders';
          expandedContent = content + "\n\n## Stakeholder Engagement Strategy\nThe AI has enhanced your analysis with a detailed engagement plan for each key stakeholder group.";
          setGeneratedStakeholders(expandedContent);
          break;
        case 'metrics':
          sectionType = 'project_planning_metrics';
          expandedContent = content + "\n\n## Performance Dashboard\nThe AI has added a structured framework for tracking, measuring, and reporting your key performance indicators.";
          setGeneratedMetrics(expandedContent);
          break;
        default:
          throw new Error(`Unknown tab: ${tab}`);
      }
      
      // Save expanded content to individual document
      await saveSection(sectionType, expandedContent);
      
      // Update the consolidated document for backward compatibility
      updateDocument();
    } catch (error) {
      console.error('Error expanding content:', error);
      toast({
        title: "Error",
        description: "Failed to expand content.",
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
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Planning Components</CardTitle>
          <CardDescription>
            Define your project goals, timeline, resources, and success criteria
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="objectives" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="objectives">
                <Target className="w-4 h-4 mr-2" />
                Objectives
              </TabsTrigger>
              <TabsTrigger value="tasks">
                <ListTodo className="w-4 h-4 mr-2" />
                Tasks & Timeline
              </TabsTrigger>
              <TabsTrigger value="resources">
                <DollarSign className="w-4 h-4 mr-2" />
                Resources
              </TabsTrigger>
              <TabsTrigger value="risks">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Risks
              </TabsTrigger>
              <TabsTrigger value="stakeholders">
                <Users className="w-4 h-4 mr-2" />
                Stakeholders
              </TabsTrigger>
              <TabsTrigger value="metrics">
                <BarChart3 className="w-4 h-4 mr-2" />
                Metrics
              </TabsTrigger>
            </TabsList>
            
            {/* Objectives Tab */}
            <TabsContent value="objectives" className="pt-4 space-y-4">
              <ContentGenerator
                sectionTitle="Objectives & Goals"
                sectionDescription="Define SMART goals for your project"
                userContent={objectives}
                generatedContent={generatedObjectives}
                guidedQuestions={[
                  "What is the primary objective of your project in one sentence?",
                  "What specific measurable outcomes are you aiming to achieve?",
                  "What achievable milestones will demonstrate progress?",
                  "How is this project relevant to your overall business strategy?",
                  "What are your time-bound deadlines for key deliverables?"
                ]}
                onContentChange={(content) => setObjectives(content)}
                onSaveContent={() => handleSaveContent('objectives', objectives)}
                onGenerateContent={async (userThoughts) => {
                  await generatePlan('objectives', userThoughts || '');
                }}
                onExpandContent={async (content) => {
                  await handleExpandContent('objectives', content);
                }}
                isLoading={isLoading}
              />
            </TabsContent>
            
            {/* Tasks & Timeline Tab */}
            <TabsContent value="tasks" className="pt-4 space-y-4">
              <ContentGenerator
                sectionTitle="Tasks & Timeline"
                sectionDescription="Define project tasks, milestones, and timeline"
                userContent={tasks}
                generatedContent={generatedTasks}
                guidedQuestions={[
                  "What are the major phases of your project?",
                  "What are the key tasks required for each phase?",
                  "What are the critical milestones and their target dates?",
                  "What dependencies exist between different tasks?",
                  "How will you track progress and manage the timeline?"
                ]}
                onContentChange={(content) => setTasks(content)}
                onSaveContent={() => handleSaveContent('tasks', tasks)}
                onGenerateContent={async (userThoughts) => {
                  await generatePlan('tasks', userThoughts || '');
                }}
                onExpandContent={async (content) => {
                  await handleExpandContent('tasks', content);
                }}
                isLoading={isLoading}
              />
            </TabsContent>
            
            {/* Resources Tab */}
            <TabsContent value="resources" className="pt-4 space-y-4">
              <ContentGenerator
                sectionTitle="Resource Allocation"
                sectionDescription="Budget and resources needed for your project"
                userContent={resources}
                generatedContent={generatedResources}
                guidedQuestions={[
                  "What human resources (team members, skills) are required for your project?",
                  "What is your overall budget for this project?",
                  "What technology or equipment investments will be needed?",
                  "What external services or vendors might you need to engage?",
                  "How will resources be allocated across different project phases?"
                ]}
                onContentChange={(content) => setResources(content)}
                onSaveContent={() => handleSaveContent('resources', resources)}
                onGenerateContent={async (userThoughts) => {
                  await generatePlan('resources', userThoughts || '');
                }}
                onExpandContent={async (content) => {
                  await handleExpandContent('resources', content);
                }}
                isLoading={isLoading}
              />
            </TabsContent>
            
            {/* Risks Tab */}
            <TabsContent value="risks" className="pt-4 space-y-4">
              <ContentGenerator
                sectionTitle="Risk Management"
                sectionDescription="Identify potential risks and mitigation strategies"
                userContent={risks}
                generatedContent={generatedRisks}
                guidedQuestions={[
                  "What are the top technical risks that could impact your project?",
                  "What market or business risks might affect your project's success?",
                  "What resource or operational risks should you be prepared for?",
                  "How would you rate each risk in terms of likelihood and impact?",
                  "What specific strategies will you implement to mitigate each major risk?"
                ]}
                onContentChange={(content) => setRisks(content)}
                onSaveContent={() => handleSaveContent('risks', risks)}
                onGenerateContent={async (userThoughts) => {
                  await generatePlan('risks', userThoughts || '');
                }}
                onExpandContent={async (content) => {
                  await handleExpandContent('risks', content);
                }}
                isLoading={isLoading}
              />
            </TabsContent>
            
            {/* Stakeholders Tab */}
            <TabsContent value="stakeholders" className="pt-4 space-y-4">
              <ContentGenerator
                sectionTitle="Stakeholder Analysis"
                sectionDescription="Identify and analyze project stakeholders"
                userContent={stakeholders}
                generatedContent={generatedStakeholders}
                guidedQuestions={[
                  "Who are the key internal stakeholders for your project?",
                  "Who are the external stakeholders that will be affected by or influence your project?",
                  "What are the primary interests and concerns of each stakeholder group?",
                  "How much influence does each stakeholder have over project success?",
                  "What communication strategies will you use for different stakeholder groups?"
                ]}
                onContentChange={(content) => setStakeholders(content)}
                onSaveContent={() => handleSaveContent('stakeholders', stakeholders)}
                onGenerateContent={async (userThoughts) => {
                  await generatePlan('stakeholders', userThoughts || '');
                }}
                onExpandContent={async (content) => {
                  await handleExpandContent('stakeholders', content);
                }}
                isLoading={isLoading}
              />
            </TabsContent>
            
            {/* Metrics Tab */}
            <TabsContent value="metrics" className="pt-4 space-y-4">
              <ContentGenerator
                sectionTitle="Metrics & Success Criteria"
                sectionDescription="Define KPIs and success criteria for your project"
                userContent={metrics}
                generatedContent={generatedMetrics}
                guidedQuestions={[
                  "What are the primary business metrics you'll use to measure project success?",
                  "What technical or operational KPIs will you track?",
                  "What are the minimum success criteria for your project?",
                  "How will you measure user satisfaction or product adoption?",
                  "What tools or methods will you use to gather and analyze metrics?"
                ]}
                onContentChange={(content) => setMetrics(content)}
                onSaveContent={() => handleSaveContent('metrics', metrics)}
                onGenerateContent={async (userThoughts) => {
                  await generatePlan('metrics', userThoughts || '');
                }}
                onExpandContent={async (content) => {
                  await handleExpandContent('metrics', content);
                }}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}