import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { AIModelIndicator } from '@/components/AIModelIndicator';
import { RefreshCcw, Save, PlayCircle } from 'lucide-react';

interface MarketResearchTabsProps {
  projectId: string;
  ideaId?: string;
  onUpdateDocument: (content: string) => void;
}

export default function MarketResearchTabs({ projectId, ideaId, onUpdateDocument }: MarketResearchTabsProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('competitors');
  const [isLoading, setIsLoading] = useState(false);
  
  // State for each tab's content
  const [competitorAnalysis, setCompetitorAnalysis] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [marketTrends, setMarketTrends] = useState('');
  const [pricingStrategies, setPricingStrategies] = useState('');
  const [technicalFeasibility, setTechnicalFeasibility] = useState('');
  
  // Generated content for each tab
  const [generatedCompetitorAnalysis, setGeneratedCompetitorAnalysis] = useState('');
  const [generatedTargetAudience, setGeneratedTargetAudience] = useState('');
  const [generatedMarketTrends, setGeneratedMarketTrends] = useState('');
  const [generatedPricingStrategies, setGeneratedPricingStrategies] = useState('');
  const [generatedTechnicalFeasibility, setGeneratedTechnicalFeasibility] = useState('');

  // Sample mock function to generate research for any tab (would be replaced with actual API call)
  const generateResearch = async (tab: string, prompt: string) => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call an AI function
      // For now, we'll simulate a delay and return mock content
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let result = '';
      switch (tab) {
        case 'competitors':
          result = `## Competitor Analysis\n\n### Main Competitors\n- Competitor A: Market leader with 45% market share, strong in enterprise segment\n- Competitor B: Growing rapidly with innovative features, targeting mid-market\n- Competitor C: Budget option with limited features but aggressive pricing\n\n### Competitive Advantages & Disadvantages\n\n| Competitor | Strengths | Weaknesses |\n|------------|-----------|------------|\n| Competitor A | Brand recognition, enterprise features | Expensive, slow innovation |\n| Competitor B | Modern UI, strong mobile apps | Limited integration options |\n| Competitor C | Low cost, simple to use | Missing advanced features, poor support |\n\n### Market Gaps\nThe analysis reveals an opportunity in the mid-market segment for a solution that combines enterprise-grade features with modern UI and reasonable pricing.`;
          setGeneratedCompetitorAnalysis(result);
          break;
        case 'audience':
          result = `## Target Audience Profile\n\n### Primary Audience\n- **Demographics**: Small to medium business owners and product managers\n- **Age Range**: 30-45 years old\n- **Technical Proficiency**: Moderate to high\n- **Industry Focus**: Technology, marketing, and professional services\n\n### User Personas\n\n1. **Sarah - Product Manager at Tech Startup**\n   - Needs: Efficient project tracking, team collaboration, integration with dev tools\n   - Pain Points: Current solutions are either too complex or too simple\n   - Goals: Ship features faster, improve team coordination\n\n2. **Michael - Small Business Owner**\n   - Needs: Simple interface, client reporting, cost management\n   - Pain Points: Enterprise solutions are expensive and overkill\n   - Goals: Better resource allocation, improved client satisfaction\n\n### Audience Size & Growth\nThe target audience represents approximately 15 million professionals globally, with a projected 12% annual growth rate.`;
          setGeneratedTargetAudience(result);
          break;
        case 'trends':
          result = `## Market Trends & Demand\n\n### Current Market Size\nThe global market for project management software is valued at $5.37 billion (2023) with a CAGR of 10.9% expected through 2028.\n\n### Key Trends\n1. **AI Integration**: Increasing demand for AI-powered automation and insights\n2. **Remote Work Solutions**: Continued growth in tools that facilitate distributed teams\n3. **Low-Code Development**: Rising popularity of visual programming interfaces\n4. **Verticalization**: Industry-specific solutions gaining traction\n\n### Emerging Opportunities\n- Integration of project management with AI assistants and workflow automation\n- Visual planning tools that reduce complexity while maintaining power\n- Cross-platform solutions that work seamlessly across devices\n\n### Risk Factors\n- Market saturation in general project management\n- Potential economic slowdown affecting SaaS spending\n- Privacy regulations affecting data handling`;
          setGeneratedMarketTrends(result);
          break;
        case 'pricing':
          result = `## Pricing & Monetization Strategies\n\n### Competitive Pricing Analysis\n| Competitor | Free Tier | Basic | Premium | Enterprise |\n|------------|-----------|-------|---------|------------|\n| Competitor A | Limited | $9/user/mo | $24/user/mo | Custom |\n| Competitor B | Yes | $12/user/mo | $35/user/mo | $49/user/mo |\n| Competitor C | No | $5/user/mo | $15/user/mo | $25/user/mo |\n\n### Recommended Pricing Model\n- **Freemium Model**: Basic features free for up to 3 users\n- **Pro Plan**: $10/user/month with full feature access\n- **Business Plan**: $22/user/month with advanced analytics and priority support\n- **Annual Discount**: 20% discount for annual commitment\n\n### Monetization Opportunities\n- Integration marketplace with revenue sharing\n- Template marketplace for specialized workflows\n- White-label reseller program\n- Professional services and implementation support`;
          setGeneratedPricingStrategies(result);
          break;
        case 'technical':
          result = `## Technical Feasibility\n\n### Core Technology Requirements\n- Frontend: React with modern component libraries\n- Backend: Node.js microservices architecture\n- Database: PostgreSQL with specialized time-series data for analytics\n- Real-time capabilities: WebSockets for collaborative features\n\n### Development Complexity Assessment\n| Feature | Complexity | Build Time Estimate |\n|---------|------------|----------------------|\n| User management | Low | 2-3 weeks |\n| Project visualization | High | 8-10 weeks |\n| Reporting dashboard | Medium | 4-6 weeks |\n| AI assistant | High | 10-12 weeks |\n\n### Scaling Considerations\n- Serverless architecture for cost-effective scaling\n- CDN for global content delivery\n- Caching strategy for performance optimization\n\n### Technical Risks\n- Real-time collaboration complexity\n- Integration complexity with numerous third-party tools\n- AI training data requirements`;
          setGeneratedTechnicalFeasibility(result);
          break;
      }
      
      // Update the document with all content
      updateDocument();
      
      toast({
        title: "Research generated",
        description: `${tab.charAt(0).toUpperCase() + tab.slice(1)} analysis has been generated successfully.`,
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
  
  // Function to compile all research into a single document
  const updateDocument = () => {
    const documentContent = `# Market Research Document

## Competitor Analysis
${generatedCompetitorAnalysis || competitorAnalysis || "Not yet generated"}

## Target Audience Profile
${generatedTargetAudience || targetAudience || "Not yet generated"}

## Market Trends & Demand
${generatedMarketTrends || marketTrends || "Not yet generated"}

## Pricing & Monetization Strategies
${generatedPricingStrategies || pricingStrategies || "Not yet generated"}

## Technical Feasibility
${generatedTechnicalFeasibility || technicalFeasibility || "Not yet generated"}`;

    onUpdateDocument(documentContent);
  };
  
  // Handle saving custom content
  const handleSaveContent = (tab: string, content: string) => {
    switch (tab) {
      case 'competitors':
        setCompetitorAnalysis(content);
        break;
      case 'audience':
        setTargetAudience(content);
        break;
      case 'trends':
        setMarketTrends(content);
        break;
      case 'pricing':
        setPricingStrategies(content);
        break;
      case 'technical':
        setTechnicalFeasibility(content);
        break;
    }
    
    updateDocument();
    
    toast({
      title: "Content saved",
      description: `Your ${tab} analysis has been saved.`,
    });
  };
  
  // Handle generating all sections at once
  const generateAll = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call an AI function to generate all sections
      await Promise.all([
        generateResearch('competitors', ''),
        generateResearch('audience', ''),
        generateResearch('trends', ''),
        generateResearch('pricing', ''),
        generateResearch('technical', '')
      ]);
      
      toast({
        title: "All research generated",
        description: "All market research sections have been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate all research. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Market Research</h2>
        <Button 
          onClick={generateAll}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <PlayCircle className="w-4 h-4 mr-2" />
          {isLoading ? "Generating..." : "Generate All Research"}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Research Components</CardTitle>
          <CardDescription>
            Analyze different aspects of your market to refine your product strategy
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="competitors" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="competitors">Competitors</TabsTrigger>
              <TabsTrigger value="audience">Target Audience</TabsTrigger>
              <TabsTrigger value="trends">Market Trends</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="technical">Technical Feasibility</TabsTrigger>
            </TabsList>
            
            {/* Competitor Analysis Tab */}
            <TabsContent value="competitors" className="pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Competitor Analysis</h3>
                  <p className="text-sm text-gray-500">Analyze competitors, market positioning, and opportunities</p>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => generateResearch('competitors', '')}
                  disabled={isLoading}
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  {isLoading ? "Generating..." : "Generate"}
                </Button>
              </div>
              
              {generatedCompetitorAnalysis ? (
                <div className="border rounded-md p-4 prose prose-blue max-w-none">
                  <div className="mb-2 flex justify-between items-center">
                    <Badge variant="outline" className="bg-blue-50">AI Generated</Badge>
                    <AIModelIndicator model="GPT-4" features={{ webSearch: true }} />
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: generatedCompetitorAnalysis.replace(/\n/g, '<br/>') }} />
                </div>
              ) : (
                <div className="space-y-4">
                  <Textarea 
                    placeholder="Enter your competitor analysis or generate with AI" 
                    className="min-h-[200px]"
                    value={competitorAnalysis}
                    onChange={(e) => setCompetitorAnalysis(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleSaveContent('competitors', competitorAnalysis)}
                    disabled={!competitorAnalysis.trim()}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Analysis
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {/* Target Audience Tab */}
            <TabsContent value="audience" className="pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Target Audience Profile</h3>
                  <p className="text-sm text-gray-500">Define your ideal users, their needs, and market size</p>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => generateResearch('audience', '')}
                  disabled={isLoading}
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  {isLoading ? "Generating..." : "Generate"}
                </Button>
              </div>
              
              {generatedTargetAudience ? (
                <div className="border rounded-md p-4 prose prose-blue max-w-none">
                  <div className="mb-2 flex justify-between items-center">
                    <Badge variant="outline" className="bg-blue-50">AI Generated</Badge>
                    <AIModelIndicator model="GPT-4" features={{ webSearch: true }} />
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: generatedTargetAudience.replace(/\n/g, '<br/>') }} />
                </div>
              ) : (
                <div className="space-y-4">
                  <Textarea 
                    placeholder="Describe your target audience or generate with AI" 
                    className="min-h-[200px]"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleSaveContent('audience', targetAudience)}
                    disabled={!targetAudience.trim()}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Analysis
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {/* Market Trends Tab */}
            <TabsContent value="trends" className="pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Market Trends & Demand</h3>
                  <p className="text-sm text-gray-500">Analyze market size, growth trends, and demand factors</p>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => generateResearch('trends', '')}
                  disabled={isLoading}
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  {isLoading ? "Generating..." : "Generate"}
                </Button>
              </div>
              
              {generatedMarketTrends ? (
                <div className="border rounded-md p-4 prose prose-blue max-w-none">
                  <div className="mb-2 flex justify-between items-center">
                    <Badge variant="outline" className="bg-blue-50">AI Generated</Badge>
                    <AIModelIndicator model="GPT-4" features={{ webSearch: true }} />
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: generatedMarketTrends.replace(/\n/g, '<br/>') }} />
                </div>
              ) : (
                <div className="space-y-4">
                  <Textarea 
                    placeholder="Describe market trends or generate with AI" 
                    className="min-h-[200px]"
                    value={marketTrends}
                    onChange={(e) => setMarketTrends(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleSaveContent('trends', marketTrends)}
                    disabled={!marketTrends.trim()}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Analysis
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {/* Pricing & Monetization Tab */}
            <TabsContent value="pricing" className="pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Pricing & Monetization Strategies</h3>
                  <p className="text-sm text-gray-500">Analyze pricing options, revenue models, and monetization strategies</p>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => generateResearch('pricing', '')}
                  disabled={isLoading}
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  {isLoading ? "Generating..." : "Generate"}
                </Button>
              </div>
              
              {generatedPricingStrategies ? (
                <div className="border rounded-md p-4 prose prose-blue max-w-none">
                  <div className="mb-2 flex justify-between items-center">
                    <Badge variant="outline" className="bg-blue-50">AI Generated</Badge>
                    <AIModelIndicator model="GPT-4" features={{ webSearch: true }} />
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: generatedPricingStrategies.replace(/\n/g, '<br/>') }} />
                </div>
              ) : (
                <div className="space-y-4">
                  <Textarea 
                    placeholder="Describe pricing strategies or generate with AI" 
                    className="min-h-[200px]"
                    value={pricingStrategies}
                    onChange={(e) => setPricingStrategies(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleSaveContent('pricing', pricingStrategies)}
                    disabled={!pricingStrategies.trim()}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Analysis
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {/* Technical Feasibility Tab */}
            <TabsContent value="technical" className="pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Technical Feasibility</h3>
                  <p className="text-sm text-gray-500">Analyze technical requirements, complexity, and implementation challenges</p>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => generateResearch('technical', '')}
                  disabled={isLoading}
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  {isLoading ? "Generating..." : "Generate"}
                </Button>
              </div>
              
              {generatedTechnicalFeasibility ? (
                <div className="border rounded-md p-4 prose prose-blue max-w-none">
                  <div className="mb-2 flex justify-between items-center">
                    <Badge variant="outline" className="bg-blue-50">AI Generated</Badge>
                    <AIModelIndicator model="GPT-4" features={{ webSearch: true }} />
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: generatedTechnicalFeasibility.replace(/\n/g, '<br/>') }} />
                </div>
              ) : (
                <div className="space-y-4">
                  <Textarea 
                    placeholder="Evaluate technical feasibility or generate with AI" 
                    className="min-h-[200px]"
                    value={technicalFeasibility}
                    onChange={(e) => setTechnicalFeasibility(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleSaveContent('technical', technicalFeasibility)}
                    disabled={!technicalFeasibility.trim()}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Analysis
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