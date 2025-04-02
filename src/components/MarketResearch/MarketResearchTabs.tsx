import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { AIModelIndicator } from '@/components/AIModelIndicator';
import { RefreshCcw, Save, Users, TrendingUp, LineChart, Scale, FileSearch } from 'lucide-react';
import { ContentGenerator } from '@/components/common';
import { useAuth } from '@/context/AuthContext';
import { 
  documentSectionService, 
  MarketResearchSectionType 
} from '@/services/documentSectionService';

interface MarketResearchTabsProps {
  projectId: string;
  ideaId?: string;
  onUpdateDocument: (content: string) => void;
}

export default function MarketResearchTabs({ projectId, ideaId, onUpdateDocument }: MarketResearchTabsProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('audience');
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // State for each tab's content
  const [audienceAnalysis, setAudienceAnalysis] = useState('');
  const [marketTrends, setMarketTrends] = useState('');
  const [competitiveAnalysis, setCompetitiveAnalysis] = useState('');
  const [demandAnalysis, setDemandAnalysis] = useState('');
  const [regulatory, setRegulatory] = useState('');
  
  // Generated content for each tab
  const [generatedAudienceAnalysis, setGeneratedAudienceAnalysis] = useState('');
  const [generatedMarketTrends, setGeneratedMarketTrends] = useState('');
  const [generatedCompetitiveAnalysis, setGeneratedCompetitiveAnalysis] = useState('');
  const [generatedDemandAnalysis, setGeneratedDemandAnalysis] = useState('');
  const [generatedRegulatory, setGeneratedRegulatory] = useState('');
  
  // Load saved content for each section on initial load
  useEffect(() => {
    const loadSavedContent = async () => {
      if (!projectId || !user) return;
      
      setIsLoading(true);
      try {
        // Load audience section
        const audienceDoc = await documentSectionService.getSection(
          projectId,
          'market_research_audience'
        );
        if (audienceDoc?.content) {
          setGeneratedAudienceAnalysis(audienceDoc.content);
        }
        
        // Load trends section
        const trendsDoc = await documentSectionService.getSection(
          projectId,
          'market_research_trends'
        );
        if (trendsDoc?.content) {
          setGeneratedMarketTrends(trendsDoc.content);
        }
        
        // Load competitive section
        const competitiveDoc = await documentSectionService.getSection(
          projectId,
          'market_research_competitive'
        );
        if (competitiveDoc?.content) {
          setGeneratedCompetitiveAnalysis(competitiveDoc.content);
        }
        
        // Load demand section
        const demandDoc = await documentSectionService.getSection(
          projectId,
          'market_research_demand'
        );
        if (demandDoc?.content) {
          setGeneratedDemandAnalysis(demandDoc.content);
        }
        
        // Load regulatory section
        const regulatoryDoc = await documentSectionService.getSection(
          projectId,
          'market_research_regulatory'
        );
        if (regulatoryDoc?.content) {
          setGeneratedRegulatory(regulatoryDoc.content);
        }
        
        setInitialLoadComplete(true);
      } catch (error) {
        console.error('Error loading saved content:', error);
        toast({
          title: 'Error',
          description: 'Failed to load saved content.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSavedContent();
  }, [projectId, user, toast]);

  // Sample mock function to generate research for any tab (would be replaced with actual API call)
  const generateResearch = async (tab: string, prompt: string) => {
    if (!user || !projectId) return;
    
    setIsLoading(true);
    try {
      // In a real implementation, this would call an AI function
      // For now, we'll simulate a delay and return mock content
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let result = '';
      let sectionType: MarketResearchSectionType;
      
      switch (tab) {
        case 'audience':
          sectionType = 'market_research_audience';
          result = `## Audience Analysis\n\n### Demographics\n- **Age Range**: 25-45 years old\n- **Gender**: Balanced distribution\n- **Income Level**: Mid to high income ($75,000+ annually)\n- **Education**: College educated, tech-savvy professionals\n- **Geographic Distribution**: Urban and suburban areas in tech-forward regions\n\n### Psychographics\n- **Tech Adoption**: Early adopters and early majority\n- **Work Habits**: Remote/hybrid work arrangements\n- **Values**: Efficiency, productivity, work-life balance\n- **Pain Points**: Information overload, digital fatigue, context switching\n\n### User Personas\n\n#### Sarah Rodriguez, 32 - Product Manager\n- **Background**: 6 years in tech industry, manages remote team\n- **Goals**: Streamline team communication, reduce meeting time, track project progress efficiently\n- **Challenges**: Team scattered across time zones, difficulty prioritizing tasks, information silos\n- **Tech Stack**: Uses 5-8 different productivity tools daily\n\n#### Michael Chen, 41 - Small Business Owner\n- **Background**: Runs a digital marketing agency with 15 employees\n- **Goals**: Centralize client communication, simplify project tracking, improve resource allocation\n- **Challenges**: Managing multiple client relationships, tracking billable hours, maintaining quality across projects\n- **Tech Stack**: Cobbled together solution of various freemium tools`;
          setGeneratedAudienceAnalysis(result);
          break;
        case 'trends':
          sectionType = 'market_research_trends';
          result = `## Market Trends & Opportunities\n\n### Current Industry Trends\n- **AI Integration**: Growing adoption of AI assistants for workflow automation and data analysis (32% CAGR)\n- **No-Code/Low-Code**: Democratization of software development through visual builders (41% CAGR)\n- **Remote Work Tools**: Continued demand for tools supporting distributed teams (18% CAGR)\n- **Workspace Unification**: Consolidation of functionality into workspace platforms\n\n### Emerging Opportunities\n- **Vertical-Specific Solutions**: Industry-tailored versions of productivity tools showing 3x adoption rates\n- **AI-Powered Insights**: Predictive analytics and recommendation engines for business intelligence\n- **Cross-Platform Integration**: Seamless workflows across devices and contexts\n- **Privacy-Focused Alternatives**: Growing market for secure, privacy-respecting productivity tools\n\n### Technological Shifts\n- **Shift from Web to AI-Native**: Applications built around AI capabilities from the ground up\n- **Return to Native Apps**: Movement away from web-only toward optimized native experiences\n- **Ambient Computing**: Integration with smart home/office systems and voice interfaces\n\n### Customer Behavior Changes\n- **Tool Fatigue**: Increasing resistance to adopting new standalone tools\n- **Subscription Consolidation**: Users seeking to reduce number of recurring subscriptions\n- **Data Ownership**: Growing concern about data portability and vendor lock-in`;
          setGeneratedMarketTrends(result);
          break;
        case 'competitive':
          sectionType = 'market_research_competitive';
          result = `## Competitive Analysis\n\n### Direct Competitors\n\n| Competitor | Market Share | Strengths | Weaknesses | Pricing Model |\n|------------|--------------|-----------|------------|---------------|\n| CompA | 27% | Brand recognition, Enterprise integration | Complex UI, Slow innovation | $20-45/user/month |\n| CompB | 18% | Modern UI, AI features | Limited ecosystem, Poor customer support | $12-36/user/month |\n| CompC | 12% | Simplicity, Fast onboarding | Limited features, Poor scalability | $8-25/user/month |\n\n### SWOT Analysis\n\n#### Strengths\n- Innovative AI integration capabilities\n- Unified platform approach reduces tool switching\n- Superior data visualization features\n- Strong mobile experience\n\n#### Weaknesses\n- New entrant in established market\n- Limited integrations with legacy systems\n- No established customer base\n- Initial feature gaps compared to mature solutions\n\n#### Opportunities\n- Growing dissatisfaction with current market leaders\n- Underserved mid-market segment\n- AI expertise shortage creating demand for accessible tools\n- Remote work trend creating new use cases\n\n#### Threats\n- Low barriers to entry for basic features\n- Big tech companies expanding into productivity space\n- Potential economic downturn affecting software budgets\n- Rapid pace of innovation requiring constant development\n\n### Competitor Product Matrix\n\n| Feature | Our Product | CompA | CompB | CompC |\n|---------|-------------|-------|-------|-------|\n| AI Assistance | Advanced | Basic | Intermediate | None |\n| Automation | Yes | Limited | Yes | No |\n| Analytics | Comprehensive | Advanced | Basic | Limited |\n| API Access | Open | Limited | Premium Only | None |\n| Mobile App | Native | Web-only | Native | Limited |\n\n### Positioning Strategies\n- Position as "AI-first" alternative to legacy solutions\n- Emphasize simplicity and user experience vs. feature bloat\n- Target mid-market with enterprise features at accessible price point\n- Leverage data privacy as competitive differentiator`;
          setGeneratedCompetitiveAnalysis(result);
          break;
        case 'demand':
          sectionType = 'market_research_demand';
          result = `## Demand & Growth Potential\n\n### Market Size Estimates\n- **Total Addressable Market (TAM)**: $78.5 billion in 2025\n- **Serviceable Available Market (SAM)**: $42.3 billion\n- **Serviceable Obtainable Market (SOM)**: $2.1 billion (5% market share goal)\n\n### Growth Projections\n- **Industry CAGR**: 15.7% through 2028\n- **Projected First-Year Revenue**: $3.2 million\n- **Three-Year Revenue Target**: $28.5 million\n- **Five-Year Market Share Goal**: 3.8% of SAM\n\n### Keyword & Search Volume Analysis\n\n| Keyword | Monthly Search Volume | Trend | Competition |\n|---------|------------------------|-------|-------------|\n| productivity software | 74,000 | Stable | High |\n| AI workspace | 18,500 | +65% YoY | Medium |\n| team collaboration tool | 45,700 | +12% YoY | High |\n| project management AI | 22,300 | +83% YoY | Medium |\n| remote work software | 38,900 | -5% YoY | High |\n\n### User Acquisition Costs\n- **Estimated CAC**: $85-120 per user\n- **CAC:LTV Ratio Target**: 1:4.5\n- **Payback Period Goal**: 9 months\n\n### Potential Market Constraints\n- **Market Saturation**: 65% of target customers already using competitor solutions\n- **Switching Costs**: Average organizational switching cost estimated at $3,500-$8,200\n- **Budget Constraints**: 42% of target customers cite budget as primary adoption barrier`;
          setGeneratedDemandAnalysis(result);
          break;

        case 'regulatory':
          sectionType = 'market_research_regulatory';
          result = `## Legal & Regulatory Environment\n\n### Data Privacy Regulations\n\n#### GDPR Compliance Requirements\n- User data must be secured with appropriate technical measures\n- Must provide data portability and right to be forgotten\n- Privacy impact assessment required for AI features\n- Cross-border data transfer restrictions apply\n\n#### CCPA/CPRA Implications\n- Specific opt-out mechanisms required for California users\n- Data processing agreements needed with all vendors\n- Annual privacy notice updates and maintenance\n- 30-day cure period for violations (until 2023)\n\n### Intellectual Property Considerations\n- **Patent Landscape**: 47 active patents identified in target feature space\n- **Trademark Requirements**: Preliminary search shows name availability\n- **Third-Party Licensing**: API usage rights for integrated services\n- **Open Source Compliance**: License compatibility audit recommended\n\n### Industry-Specific Regulations\n\n#### Healthcare (If Targeting)\n- HIPAA compliance required for PHI handling\n- BAA agreements necessary with covered entities\n- Special security measures for medical data\n\n#### Financial Services (If Targeting)\n- SOC 2 Type II certification recommended\n- Compliance with financial record retention rules\n- Additional monitoring for high-risk transactions\n\n### Security Requirements\n- **SOC 2 Compliance**: Required for enterprise customers\n- **Encryption Standards**: In-transit and at-rest encryption mandatory\n- **Penetration Testing**: Quarterly tests recommended\n- **Incident Response**: 72-hour notification requirement in EU\n\n### Contracts & Terms Needed\n- Terms of Service with appropriate limitations of liability\n- Privacy Policy reflecting actual data practices\n- Data Processing Agreements for B2B customers\n- Service Level Agreements with uptime guarantees`;
          setGeneratedRegulatory(result);
          break;
          
        default:
          console.error(`Unknown tab: ${tab}`);
          return;
      }
      
      // Save the generated content to the document hub
      await saveSection(sectionType, result);
      
      // Update the combined document view for backwards compatibility
      updateCombinedDocument();
      
      toast({
        title: "Research generated",
        description: `${tab.charAt(0).toUpperCase() + tab.slice(1)} analysis has been generated and saved to Documents Hub.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate research. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save section to document hub
  const saveSection = async (sectionType: MarketResearchSectionType, content: string) => {
    if (!user || !projectId) return;
    
    try {
      await documentSectionService.saveSection(
        projectId,
        user.id,
        sectionType,
        content
      );
      
      // Also update the combined document view for backwards compatibility
      updateCombinedDocument();
    } catch (error) {
      console.error(`Error saving ${sectionType}:`, error);
      toast({
        title: 'Error',
        description: `Failed to save ${sectionType} document.`,
        variant: 'destructive',
      });
    }
  };
  
  // Function to compile all research into a single document (for backwards compatibility)
  const updateCombinedDocument = () => {
    const documentContent = `# Market Research Document

## Audience Analysis
${generatedAudienceAnalysis || audienceAnalysis || "Not yet generated"}

## Market Trends & Opportunities
${generatedMarketTrends || marketTrends || "Not yet generated"}

## Competitive Analysis
${generatedCompetitiveAnalysis || competitiveAnalysis || "Not yet generated"}

## Demand & Growth Potential
${generatedDemandAnalysis || demandAnalysis || "Not yet generated"}

## Legal & Regulatory Environment
${generatedRegulatory || regulatory || "Not yet generated"}`;

    onUpdateDocument(documentContent);
  };
  
  // Handle saving custom content
  const handleSaveContent = async (tab: string, content: string) => {
    switch (tab) {
      case 'audience':
        setAudienceAnalysis(content);
        await saveSection('market_research_audience', content);
        break;
      case 'trends':
        setMarketTrends(content);
        await saveSection('market_research_trends', content);
        break;
      case 'competitive':
        setCompetitiveAnalysis(content);
        await saveSection('market_research_competitive', content);
        break;
      case 'demand':
        setDemandAnalysis(content);
        await saveSection('market_research_demand', content);
        break;
      case 'regulatory':
        setRegulatory(content);
        await saveSection('market_research_regulatory', content);
        break;
    }
    
    toast({
      title: "Content saved",
      description: `Your ${tab} analysis has been saved and added to Documents Hub.`,
    });
  };
  

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Market Research</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Research Components</CardTitle>
          <CardDescription>
            Analyze different aspects of your market to refine your product strategy
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="audience" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="audience">
                <Users className="w-4 h-4 mr-2" />
                Audience
              </TabsTrigger>
              <TabsTrigger value="trends">
                <TrendingUp className="w-4 h-4 mr-2" />
                Market Trends
              </TabsTrigger>
              <TabsTrigger value="competitive">
                <Scale className="w-4 h-4 mr-2" />
                Competition
              </TabsTrigger>
              <TabsTrigger value="demand">
                <LineChart className="w-4 h-4 mr-2" />
                Demand
              </TabsTrigger>
              <TabsTrigger value="regulatory">
                <FileSearch className="w-4 h-4 mr-2" />
                Regulatory
              </TabsTrigger>
            </TabsList>
            
            {/* Audience Analysis Tab */}
            <TabsContent value="audience" className="pt-4 space-y-4">
              <ContentGenerator
                sectionTitle="Audience Analysis"
                sectionDescription="Demographics, psychographics, and user personas"
                userContent={audienceAnalysis}
                generatedContent={generatedAudienceAnalysis}
                guidedQuestions={[
                  "Who is your primary target audience? Describe their age range, gender distribution, income level, and education.",
                  "What are the key psychographic characteristics of your audience? Consider their values, interests, and lifestyle.",
                  "What pain points or challenges does your audience face that your product will solve?",
                  "Describe a primary user persona in detail, including their background, goals, and frustrations.",
                  "Where do your target users currently look for solutions similar to yours?"
                ]}
                onContentChange={(content) => setAudienceAnalysis(content)}
                onSaveContent={() => handleSaveContent('audience', audienceAnalysis)}
                onGenerateContent={async (userThoughts) => {
                  // In a real implementation, you would pass userThoughts to the API
                  await generateResearch('audience', userThoughts || '');
                }}
                onExpandContent={async (content) => {
                  if (!user || !projectId) return;
                  
                  setIsLoading(true);
                  try {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    const expandedContent = content + "\n\n## Additional Analysis\nThe AI has expanded this content with additional insights and analysis based on market research best practices.";
                    
                    setGeneratedAudienceAnalysis(expandedContent);
                    await saveSection('market_research_audience', expandedContent);
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to expand content.",
                      variant: "destructive",
                    });
                  } finally {
                    setIsLoading(false);
                  }
                }}
                isLoading={isLoading}
              />
            </TabsContent>
            
            {/* Market Trends Tab */}
            <TabsContent value="trends" className="pt-4 space-y-4">
              <ContentGenerator
                sectionTitle="Market Trends & Opportunities"
                sectionDescription="Current trends, emerging opportunities, and growth potential"
                userContent={marketTrends}
                generatedContent={generatedMarketTrends}
                guidedQuestions={[
                  "What are the 3-5 most significant current trends in your industry?",
                  "How are customer needs and behaviors changing in your market?",
                  "What emerging technologies are impacting your industry?",
                  "What are the growth projections for your market segment in the next 3-5 years?",
                  "What untapped opportunities exist in your market that competitors aren't addressing?"
                ]}
                onContentChange={(content) => setMarketTrends(content)}
                onSaveContent={() => handleSaveContent('trends', marketTrends)}
                onGenerateContent={async (userThoughts) => {
                  await generateResearch('trends', userThoughts || '');
                }}
                onExpandContent={async (content) => {
                  if (!user || !projectId) return;
                  
                  setIsLoading(true);
                  try {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    const expandedContent = content + "\n\n## Market Opportunity Analysis\nThe AI has expanded this content with additional market opportunity insights based on current industry trends.";
                    
                    setGeneratedMarketTrends(expandedContent);
                    await saveSection('market_research_trends', expandedContent);
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to expand content.",
                      variant: "destructive",
                    });
                  } finally {
                    setIsLoading(false);
                  }
                }}
                isLoading={isLoading}
              />
            </TabsContent>
            
            {/* Competitive Analysis Tab */}
            <TabsContent value="competitive" className="pt-4 space-y-4">
              <ContentGenerator
                sectionTitle="Competitive Analysis"
                sectionDescription="SWOT analysis, competitor matrix, and positioning strategies"
                userContent={competitiveAnalysis}
                generatedContent={generatedCompetitiveAnalysis}
                guidedQuestions={[
                  "Who are your top 3-5 direct competitors? What are their market shares?",
                  "What strengths and weaknesses does your product have compared to competitors?",
                  "What opportunities and threats exist in the competitive landscape?",
                  "What unique selling proposition (USP) differentiates your product?",
                  "What pricing strategies do competitors use, and how will yours compare?"
                ]}
                onContentChange={(content) => setCompetitiveAnalysis(content)}
                onSaveContent={() => handleSaveContent('competitive', competitiveAnalysis)}
                onGenerateContent={async (userThoughts) => {
                  await generateResearch('competitive', userThoughts || '');
                }}
                onExpandContent={async (content) => {
                  if (!user || !projectId) return;
                  
                  setIsLoading(true);
                  try {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    const expandedContent = content + "\n\n## Competitor Positioning Map\nThe AI has added a detailed positioning analysis showing how your product compares to competitors across key dimensions.";
                    
                    setGeneratedCompetitiveAnalysis(expandedContent);
                    await saveSection('market_research_competitive', expandedContent);
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to expand content.",
                      variant: "destructive",
                    });
                  } finally {
                    setIsLoading(false);
                  }
                }}
                isLoading={isLoading}
              />
            </TabsContent>
            
            {/* Demand Analysis Tab */}
            <TabsContent value="demand" className="pt-4 space-y-4">
              <ContentGenerator
                sectionTitle="Demand & Growth Potential"
                sectionDescription="Market size estimates, keyword analysis, and growth projections"
                userContent={demandAnalysis}
                generatedContent={generatedDemandAnalysis}
                guidedQuestions={[
                  "What is the total addressable market (TAM) size for your product?",
                  "What is the current growth rate of your market segment?",
                  "What factors will drive demand for your product in the next 1-3 years?",
                  "What search terms or keywords do potential customers use when looking for solutions like yours?",
                  "What pricing expectations exist in your market, and how will you position your offering?"
                ]}
                onContentChange={(content) => setDemandAnalysis(content)}
                onSaveContent={() => handleSaveContent('demand', demandAnalysis)}
                onGenerateContent={async (userThoughts) => {
                  await generateResearch('demand', userThoughts || '');
                }}
                onExpandContent={async (content) => {
                  if (!user || !projectId) return;
                  
                  setIsLoading(true);
                  try {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    const expandedContent = content + "\n\n## Market Growth Forecast\nThe AI has enhanced your analysis with detailed growth projections and market size forecasts based on industry data.";
                    
                    setGeneratedDemandAnalysis(expandedContent);
                    await saveSection('market_research_demand', expandedContent);
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to expand content.",
                      variant: "destructive",
                    });
                  } finally {
                    setIsLoading(false);
                  }
                }}
                isLoading={isLoading}
              />
            </TabsContent>
            
            
            {/* Regulatory Environment Tab */}
            <TabsContent value="regulatory" className="pt-4 space-y-4">
              <ContentGenerator
                sectionTitle="Legal & Regulatory Environment"
                sectionDescription="Compliance requirements, legal considerations, and industry regulations"
                userContent={regulatory}
                generatedContent={generatedRegulatory}
                guidedQuestions={[
                  "What data privacy regulations (GDPR, CCPA, etc.) apply to your product or service?",
                  "What industry-specific regulations or compliance requirements exist in your market?",
                  "What intellectual property considerations (patents, trademarks, copyrights) are relevant?",
                  "What licensing or certification requirements apply to your business?",
                  "What contractual agreements or terms of service will you need to implement?"
                ]}
                onContentChange={(content) => setRegulatory(content)}
                onSaveContent={() => handleSaveContent('regulatory', regulatory)}
                onGenerateContent={async (userThoughts) => {
                  await generateResearch('regulatory', userThoughts || '');
                }}
                onExpandContent={async (content) => {
                  if (!user || !projectId) return;
                  
                  setIsLoading(true);
                  try {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    const expandedContent = content + "\n\n## Compliance Strategy\nThe AI has enhanced your analysis with a structured compliance strategy and implementation plan.";
                    
                    setGeneratedRegulatory(expandedContent);
                    await saveSection('market_research_regulatory', expandedContent);
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to expand content.",
                      variant: "destructive",
                    });
                  } finally {
                    setIsLoading(false);
                  }
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