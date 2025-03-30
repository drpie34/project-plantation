import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMarketResearch } from '@/hooks/useMarketResearch';
import { documentService } from '@/services/documentService';
import { documentGenerationService } from '@/services/documentGenerationService';
import { supabase } from '@/integrations/supabase/client';
import MarketResearchTabs from '@/components/MarketResearch/MarketResearchTabs';
import MarketResearchDocument from '@/components/MarketResearch/MarketResearchDocument';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/common';
import { 
  ChevronRightIcon, 
  Save, 
  RefreshCcw, 
  ArrowLeft 
} from 'lucide-react';

export default function MarketResearch() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const ideaId = searchParams.get('ideaId');
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('competitors');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [editMode, setEditMode] = useState<string | null>(null);
  
  // States for each section content
  const [competitorAnalysis, setCompetitorAnalysis] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [marketTrends, setMarketTrends] = useState('');
  const [pricingStrategies, setPricingStrategies] = useState('');
  const [technicalFeasibility, setTechnicalFeasibility] = useState('');
  
  const [marketResearchDocument, setMarketResearchDocument] = useState<any>(null);
  
  const { loadIdeaDetails } = useMarketResearch(projectId || '');
  
  // Load idea details when ideaId is provided
  useEffect(() => {
    if (ideaId) {
      console.log('MarketResearch: Loading idea details for ideaId:', ideaId);
      loadIdeaDetails(ideaId);
    }
  }, [ideaId, loadIdeaDetails]);
  
  // Load existing market research document if available
  useEffect(() => {
    const loadMarketResearchDocument = async () => {
      if (!projectId) return;
      
      setIsLoading(true);
      try {
        // Fetch all documents for the project
        const docs = await documentService.getProjectDocuments(projectId);
        
        // Find market research document
        const marketResearchDoc = docs.find(doc => doc.type === 'market_research');
        
        if (marketResearchDoc) {
          setMarketResearchDocument(marketResearchDoc);
          
          // Parse the document content and update states
          parseMarketResearchSections(marketResearchDoc.content);
          setLastUpdated(new Date(marketResearchDoc.updated_at));
        }
      } catch (error) {
        console.error('Error loading market research document:', error);
        toast({
          title: 'Error',
          description: 'Failed to load market research document',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMarketResearchDocument();
  }, [projectId, toast]);
  
  // Parse the market research document content into sections
  const parseMarketResearchSections = (content: string) => {
    // Initialize with default content
    const sections = {
      competitorAnalysis: '',
      targetAudience: '',
      marketTrends: '',
      pricingStrategies: '',
      technicalFeasibility: ''
    };
    
    // Guard against empty content
    if (!content || content.trim() === '') {
      return sections;
    }
    
    try {
      // Extract Competitor Analysis section
      const competitorsStart = content.indexOf('<!-- SECTION:competitors -->');
      const competitorsEnd = content.indexOf('<!-- END:competitors -->');
      
      if (competitorsStart !== -1 && competitorsEnd !== -1 && competitorsStart < competitorsEnd) {
        const extracted = content.substring(
          competitorsStart + '<!-- SECTION:competitors -->'.length, 
          competitorsEnd
        ).trim();
        if (extracted) {
          setCompetitorAnalysis(extracted);
        }
      }
      
      // Extract Target Audience section
      const audienceStart = content.indexOf('<!-- SECTION:audience -->');
      const audienceEnd = content.indexOf('<!-- END:audience -->');
      
      if (audienceStart !== -1 && audienceEnd !== -1 && audienceStart < audienceEnd) {
        const extracted = content.substring(
          audienceStart + '<!-- SECTION:audience -->'.length, 
          audienceEnd
        ).trim();
        if (extracted) {
          setTargetAudience(extracted);
        }
      }
      
      // Extract Market Trends section
      const trendsStart = content.indexOf('<!-- SECTION:trends -->');
      const trendsEnd = content.indexOf('<!-- END:trends -->');
      
      if (trendsStart !== -1 && trendsEnd !== -1 && trendsStart < trendsEnd) {
        const extracted = content.substring(
          trendsStart + '<!-- SECTION:trends -->'.length, 
          trendsEnd
        ).trim();
        if (extracted) {
          setMarketTrends(extracted);
        }
      }
      
      // Extract Pricing Strategies section
      const pricingStart = content.indexOf('<!-- SECTION:pricing -->');
      const pricingEnd = content.indexOf('<!-- END:pricing -->');
      
      if (pricingStart !== -1 && pricingEnd !== -1 && pricingStart < pricingEnd) {
        const extracted = content.substring(
          pricingStart + '<!-- SECTION:pricing -->'.length, 
          pricingEnd
        ).trim();
        if (extracted) {
          setPricingStrategies(extracted);
        }
      }
      
      // Extract Technical Feasibility section
      const technicalStart = content.indexOf('<!-- SECTION:technical -->');
      const technicalEnd = content.indexOf('<!-- END:technical -->');
      
      if (technicalStart !== -1 && technicalEnd !== -1 && technicalStart < technicalEnd) {
        const extracted = content.substring(
          technicalStart + '<!-- SECTION:technical -->'.length, 
          technicalEnd
        ).trim();
        if (extracted) {
          setTechnicalFeasibility(extracted);
        }
      }
    } catch (error) {
      console.error('Error parsing market research sections:', error);
    }
  };
  
  // Format the document content with all sections
  const formatMarketResearchContent = () => {
    return `# Market Research

<!-- SECTION:competitors -->
${competitorAnalysis || 'No competitor analysis available yet.'}
<!-- END:competitors -->

<!-- SECTION:audience -->
${targetAudience || 'No target audience analysis available yet.'}
<!-- END:audience -->

<!-- SECTION:trends -->
${marketTrends || 'No market trends analysis available yet.'}
<!-- END:trends -->

<!-- SECTION:pricing -->
${pricingStrategies || 'No pricing strategies analysis available yet.'}
<!-- END:pricing -->

<!-- SECTION:technical -->
${technicalFeasibility || 'No technical feasibility analysis available yet.'}
<!-- END:technical -->

Last updated: ${new Date().toLocaleString()}`;
  };
  
  // Save the market research document
  const saveMarketResearchDocument = async () => {
    if (!projectId || !profile?.id) {
      toast({
        title: 'Error',
        description: 'Missing project or user information',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const content = formatMarketResearchContent();
      
      // If we already have a document, update it
      if (marketResearchDocument) {
        const updatedDoc = await documentService.updateDocument(
          marketResearchDocument.id,
          { content }
        );
        
        if (updatedDoc) {
          setMarketResearchDocument(updatedDoc);
          setLastUpdated(new Date());
          
          toast({
            title: 'Success',
            description: 'Market research document updated',
          });
        }
      } else {
        // Create a new document
        const newDoc = await documentService.createDocument({
          title: 'Market Research',
          type: 'market_research',
          content,
          user_id: profile.id,
          project_id: projectId,
          is_auto_generated: false
        });
        
        if (newDoc) {
          setMarketResearchDocument(newDoc);
          setLastUpdated(new Date());
          
          toast({
            title: 'Success',
            description: 'Market research document created',
          });
        }
      }
      
      // Also save to localStorage as backup
      localStorage.setItem(
        `document_${projectId}_market_research`, 
        content
      );
    } catch (error) {
      console.error('Error saving market research document:', error);
      toast({
        title: 'Error',
        description: 'Failed to save market research document',
        variant: 'destructive',
      });
      
      // Save to localStorage as fallback
      localStorage.setItem(
        `document_${projectId}_market_research`, 
        formatMarketResearchContent()
      );
    } finally {
      setIsSaving(false);
      setEditMode(null);
    }
  };
  
  // Handle section edit toggle
  const handleEditSection = (section: string) => {
    setEditMode(section);
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditMode(null);
    
    // Reset to original content if we have a document
    if (marketResearchDocument) {
      parseMarketResearchSections(marketResearchDocument.content);
    }
  };
  
  // AI Generate specific section content
  const generateSectionContent = async (section: string) => {
    setIsSaving(true);
    
    try {
      // In a real implementation, this would call an AI function
      // For now, we'll simulate a delay and return mock content
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let result = '';
      switch (section) {
        case 'competitors':
          result = `## Competitor Analysis\n\n### Main Competitors\n- Competitor A: Market leader with 45% market share, strong in enterprise segment\n- Competitor B: Growing rapidly with innovative features, targeting mid-market\n- Competitor C: Budget option with limited features but aggressive pricing\n\n### Competitive Advantages & Disadvantages\n\n| Competitor | Strengths | Weaknesses |\n|------------|-----------|------------|\n| Competitor A | Brand recognition, enterprise features | Expensive, slow innovation |\n| Competitor B | Modern UI, strong mobile apps | Limited integration options |\n| Competitor C | Low cost, simple to use | Missing advanced features, poor support |\n\n### Market Gaps\nThe analysis reveals an opportunity in the mid-market segment for a solution that combines enterprise-grade features with modern UI and reasonable pricing.`;
          setCompetitorAnalysis(result);
          break;
        case 'audience':
          result = `## Target Audience Profile\n\n### Primary Audience\n- **Demographics**: Small to medium business owners and product managers\n- **Age Range**: 30-45 years old\n- **Technical Proficiency**: Moderate to high\n- **Industry Focus**: Technology, marketing, and professional services\n\n### User Personas\n\n1. **Sarah - Product Manager at Tech Startup**\n   - Needs: Efficient project tracking, team collaboration, integration with dev tools\n   - Pain Points: Current solutions are either too complex or too simple\n   - Goals: Ship features faster, improve team coordination\n\n2. **Michael - Small Business Owner**\n   - Needs: Simple interface, client reporting, cost management\n   - Pain Points: Enterprise solutions are expensive and overkill\n   - Goals: Better resource allocation, improved client satisfaction\n\n### Audience Size & Growth\nThe target audience represents approximately 15 million professionals globally, with a projected 12% annual growth rate.`;
          setTargetAudience(result);
          break;
        case 'trends':
          result = `## Market Trends & Demand\n\n### Current Market Size\nThe global market for project management software is valued at $5.37 billion (2023) with a CAGR of 10.9% expected through 2028.\n\n### Key Trends\n1. **AI Integration**: Increasing demand for AI-powered automation and insights\n2. **Remote Work Solutions**: Continued growth in tools that facilitate distributed teams\n3. **Low-Code Development**: Rising popularity of visual programming interfaces\n4. **Verticalization**: Industry-specific solutions gaining traction\n\n### Emerging Opportunities\n- Integration of project management with AI assistants and workflow automation\n- Visual planning tools that reduce complexity while maintaining power\n- Cross-platform solutions that work seamlessly across devices\n\n### Risk Factors\n- Market saturation in general project management\n- Potential economic slowdown affecting SaaS spending\n- Privacy regulations affecting data handling`;
          setMarketTrends(result);
          break;
        case 'pricing':
          result = `## Pricing & Monetization Strategies\n\n### Competitive Pricing Analysis\n| Competitor | Free Tier | Basic | Premium | Enterprise |\n|------------|-----------|-------|---------|------------|\n| Competitor A | Limited | $9/user/mo | $24/user/mo | Custom |\n| Competitor B | Yes | $12/user/mo | $35/user/mo | $49/user/mo |\n| Competitor C | No | $5/user/mo | $15/user/mo | $25/user/mo |\n\n### Recommended Pricing Model\n- **Freemium Model**: Basic features free for up to 3 users\n- **Pro Plan**: $10/user/month with full feature access\n- **Business Plan**: $22/user/month with advanced analytics and priority support\n- **Annual Discount**: 20% discount for annual commitment\n\n### Monetization Opportunities\n- Integration marketplace with revenue sharing\n- Template marketplace for specialized workflows\n- White-label reseller program\n- Professional services and implementation support`;
          setPricingStrategies(result);
          break;
        case 'technical':
          result = `## Technical Feasibility\n\n### Core Technology Requirements\n- Frontend: React with modern component libraries\n- Backend: Node.js microservices architecture\n- Database: PostgreSQL with specialized time-series data for analytics\n- Real-time capabilities: WebSockets for collaborative features\n\n### Development Complexity Assessment\n| Feature | Complexity | Build Time Estimate |\n|---------|------------|----------------------|\n| User management | Low | 2-3 weeks |\n| Project visualization | High | 8-10 weeks |\n| Reporting dashboard | Medium | 4-6 weeks |\n| AI assistant | High | 10-12 weeks |\n\n### Scaling Considerations\n- Serverless architecture for cost-effective scaling\n- CDN for global content delivery\n- Caching strategy for performance optimization\n\n### Technical Risks\n- Real-time collaboration complexity\n- Integration complexity with numerous third-party tools\n- AI training data requirements`;
          setTechnicalFeasibility(result);
          break;
      }
      
      // After generating content, save the document
      await saveMarketResearchDocument();
      
      toast({
        title: "Research generated",
        description: `${section.charAt(0).toUpperCase() + section.slice(1)} analysis has been generated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate research. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setEditMode(null);
    }
  };
  
  // Generate all sections at once
  const generateAllSections = async () => {
    setIsSaving(true);
    
    try {
      await Promise.all([
        generateSectionContent('competitors'),
        generateSectionContent('audience'),
        generateSectionContent('trends'),
        generateSectionContent('pricing'),
        generateSectionContent('technical')
      ]);
      
      // Save combined document after all sections are generated
      await saveMarketResearchDocument();
      
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
      setIsSaving(false);
    }
  };

  // Handle section content change
  const handleSectionChange = (section: string, content: string) => {
    switch (section) {
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
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Market Research</h1>
          <p className="text-muted-foreground">
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleString()}` : 'Create or generate market research for your project'}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Button>
          {!marketResearchDocument ? (
            <Button 
              onClick={generateAllSections}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              {isSaving ? "Generating..." : "Generate All Research"}
            </Button>
          ) : (
            <Button 
              onClick={saveMarketResearchDocument}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save All Changes"}
            </Button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="competitors" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="audience">Target Audience</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="technical">Technical Feasibility</TabsTrigger>
        </TabsList>
        
        {/* Competitor Analysis Tab */}
        <TabsContent value="competitors" className="pt-4 space-y-4 w-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>Competitor Analysis</span>
                <div className="flex space-x-2">
                  {editMode === 'competitors' ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={saveMarketResearchDocument}
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditSection('competitors')}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => generateSectionContent('competitors')}
                        disabled={isSaving}
                      >
                        {isSaving ? "Generating..." : "Generate with AI"}
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
              <CardDescription>
                Analysis of competitors, their products, and positioning in the market
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editMode === 'competitors' ? (
                <Textarea
                  value={competitorAnalysis}
                  onChange={(e) => handleSectionChange('competitors', e.target.value)}
                  className="min-h-[400px] text-sm"
                  placeholder="Enter competitor analysis or generate with AI..."
                />
              ) : (
                <div className="prose max-w-none bg-blue-50 border border-blue-100 rounded-lg p-4 min-h-[200px]">
                  {competitorAnalysis ? (
                    <div dangerouslySetInnerHTML={{ __html: competitorAnalysis.replace(/\n/g, '<br/>') }} />
                  ) : (
                    <div className="text-center text-gray-500 py-10">
                      <p>No competitor analysis yet.</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => generateSectionContent('competitors')}
                        className="mt-2"
                      >
                        Generate with AI
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Target Audience Tab */}
        <TabsContent value="audience" className="pt-4 space-y-4 w-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>Target Audience</span>
                <div className="flex space-x-2">
                  {editMode === 'audience' ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={saveMarketResearchDocument}
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditSection('audience')}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => generateSectionContent('audience')}
                        disabled={isSaving}
                      >
                        {isSaving ? "Generating..." : "Generate with AI"}
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
              <CardDescription>
                Analysis of your target customers, their needs, and demographics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editMode === 'audience' ? (
                <Textarea
                  value={targetAudience}
                  onChange={(e) => handleSectionChange('audience', e.target.value)}
                  className="min-h-[400px] text-sm"
                  placeholder="Enter target audience analysis or generate with AI..."
                />
              ) : (
                <div className="prose max-w-none bg-green-50 border border-green-100 rounded-lg p-4 min-h-[200px]">
                  {targetAudience ? (
                    <div dangerouslySetInnerHTML={{ __html: targetAudience.replace(/\n/g, '<br/>') }} />
                  ) : (
                    <div className="text-center text-gray-500 py-10">
                      <p>No target audience analysis yet.</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => generateSectionContent('audience')}
                        className="mt-2"
                      >
                        Generate with AI
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Market Trends Tab */}
        <TabsContent value="trends" className="pt-4 space-y-4 w-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>Market Trends</span>
                <div className="flex space-x-2">
                  {editMode === 'trends' ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={saveMarketResearchDocument}
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditSection('trends')}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => generateSectionContent('trends')}
                        disabled={isSaving}
                      >
                        {isSaving ? "Generating..." : "Generate with AI"}
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
              <CardDescription>
                Analysis of current market trends, growth potential, and emerging opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editMode === 'trends' ? (
                <Textarea
                  value={marketTrends}
                  onChange={(e) => handleSectionChange('trends', e.target.value)}
                  className="min-h-[400px] text-sm"
                  placeholder="Enter market trends analysis or generate with AI..."
                />
              ) : (
                <div className="prose max-w-none bg-purple-50 border border-purple-100 rounded-lg p-4 min-h-[200px]">
                  {marketTrends ? (
                    <div dangerouslySetInnerHTML={{ __html: marketTrends.replace(/\n/g, '<br/>') }} />
                  ) : (
                    <div className="text-center text-gray-500 py-10">
                      <p>No market trends analysis yet.</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => generateSectionContent('trends')}
                        className="mt-2"
                      >
                        Generate with AI
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Pricing Strategies Tab */}
        <TabsContent value="pricing" className="pt-4 space-y-4 w-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>Pricing Strategies</span>
                <div className="flex space-x-2">
                  {editMode === 'pricing' ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={saveMarketResearchDocument}
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditSection('pricing')}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => generateSectionContent('pricing')}
                        disabled={isSaving}
                      >
                        {isSaving ? "Generating..." : "Generate with AI"}
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
              <CardDescription>
                Analysis of pricing models, monetization strategies, and revenue potential
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editMode === 'pricing' ? (
                <Textarea
                  value={pricingStrategies}
                  onChange={(e) => handleSectionChange('pricing', e.target.value)}
                  className="min-h-[400px] text-sm"
                  placeholder="Enter pricing strategies analysis or generate with AI..."
                />
              ) : (
                <div className="prose max-w-none bg-yellow-50 border border-yellow-100 rounded-lg p-4 min-h-[200px]">
                  {pricingStrategies ? (
                    <div dangerouslySetInnerHTML={{ __html: pricingStrategies.replace(/\n/g, '<br/>') }} />
                  ) : (
                    <div className="text-center text-gray-500 py-10">
                      <p>No pricing strategies analysis yet.</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => generateSectionContent('pricing')}
                        className="mt-2"
                      >
                        Generate with AI
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Technical Feasibility Tab */}
        <TabsContent value="technical" className="pt-4 space-y-4 w-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>Technical Feasibility</span>
                <div className="flex space-x-2">
                  {editMode === 'technical' ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={saveMarketResearchDocument}
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditSection('technical')}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => generateSectionContent('technical')}
                        disabled={isSaving}
                      >
                        {isSaving ? "Generating..." : "Generate with AI"}
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
              <CardDescription>
                Analysis of technical requirements, implementation challenges, and feasibility assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editMode === 'technical' ? (
                <Textarea
                  value={technicalFeasibility}
                  onChange={(e) => handleSectionChange('technical', e.target.value)}
                  className="min-h-[400px] text-sm"
                  placeholder="Enter technical feasibility analysis or generate with AI..."
                />
              ) : (
                <div className="prose max-w-none bg-orange-50 border border-orange-100 rounded-lg p-4 min-h-[200px]">
                  {technicalFeasibility ? (
                    <div dangerouslySetInnerHTML={{ __html: technicalFeasibility.replace(/\n/g, '<br/>') }} />
                  ) : (
                    <div className="text-center text-gray-500 py-10">
                      <p>No technical feasibility analysis yet.</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => generateSectionContent('technical')}
                        className="mt-2"
                      >
                        Generate with AI
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            Content from your research is automatically saved to the Document Hub
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full justify-between"
            variant="outline"
            onClick={() => navigate(`/projects/${projectId}/planning`)}
          >
            <span>Proceed to Project Planning</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          
          <Button 
            className="w-full justify-between"
            variant="outline"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            <span>Return to Project Overview</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>

          <Button 
            className="w-full justify-between"
            variant="outline"
            onClick={() => navigate(`/projects/${projectId}?tab=document_hub`)}
          >
            <span>View in Document Hub</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}