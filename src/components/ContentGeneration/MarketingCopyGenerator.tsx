
import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy as CopyIcon, Save as SaveIcon, Sparkles as SparklesIcon } from 'lucide-react';
import { AIModelIndicator } from '@/components/AIModelIndicator';
import { useToast } from '@/hooks/use-toast';
import { callApiGateway } from '@/utils/apiGateway';

interface MarketingCopyGeneratorProps {
  projectId: string;
  userId: string;
  creditsRemaining: number;
}

type ContentType = 'landing' | 'email' | 'social' | 'ads';
type Tonality = 'professional' | 'friendly' | 'technical' | 'creative' | 'minimal';

interface FormData {
  productName: string;
  description: string;
  targetAudience: string;
  keyFeatures: string;
  tonality: Tonality;
  contentType: ContentType;
}

interface GeneratedContent {
  text: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    model: string;
    api: string;
  };
}

const contentTypes = [
  { value: 'landing', label: 'Landing Page' },
  { value: 'email', label: 'Email Campaign' },
  { value: 'social', label: 'Social Media Posts' },
  { value: 'ads', label: 'Ad Copy' }
];

const tonalities = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly & Approachable' },
  { value: 'technical', label: 'Technical & Detailed' },
  { value: 'creative', label: 'Creative & Bold' },
  { value: 'minimal', label: 'Minimalist' }
];

export default function MarketingCopyGenerator({ 
  projectId, 
  userId, 
  creditsRemaining 
}: MarketingCopyGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [activeTab, setActiveTab] = useState<ContentType>('landing');
  const [formData, setFormData] = useState<FormData>({
    productName: '',
    description: '',
    targetAudience: '',
    keyFeatures: '',
    tonality: 'professional',
    contentType: 'landing'
  });
  
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productName || !formData.description) {
      setError('Please fill in the required fields');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await callApiGateway('generateMarketingCopy', {
        userId,
        projectId,
        ...formData
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Error generating marketing copy');
      }
      
      setGeneratedContent(result.content);
      toast({
        title: "Marketing copy generated",
        description: "Your marketing copy has been successfully generated",
      });
      
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'An unexpected error occurred');
      toast({
        title: "Generation failed",
        description: error.message || 'Failed to generate marketing copy',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent.text);
      toast({
        title: "Copied to clipboard",
        description: "The marketing copy has been copied to your clipboard",
      });
    }
  };
  
  const handleSave = async () => {
    if (!generatedContent) return;
    
    try {
      const result = await callApiGateway('saveMarketingCopy', {
        userId,
        projectId,
        contentType: formData.contentType,
        title: `${formData.productName} - ${contentTypes.find(t => t.value === formData.contentType)?.label}`,
        content: generatedContent
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Error saving content');
      }
      
      toast({
        title: "Content saved",
        description: "Your marketing copy has been saved to the project",
      });
      
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Save failed",
        description: error.message || 'Failed to save marketing copy',
        variant: "destructive"
      });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleContentTypeChange = (value: ContentType) => {
    setFormData(prev => ({ ...prev, contentType: value }));
    setActiveTab(value);
  };
  
  const handleTonalityChange = (value: Tonality) => {
    setFormData(prev => ({ ...prev, tonality: value }));
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Marketing Copy Generator</CardTitle>
          <CardDescription>
            Use AI to generate compelling marketing copy for your SaaS product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  placeholder="E.g., TaskFlow Pro"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Target Audience
                </label>
                <Input
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  placeholder="E.g., Small business owners, Marketing teams"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Product Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your product and its main value proposition"
                rows={3}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Key Features & Benefits
              </label>
              <Textarea
                name="keyFeatures"
                value={formData.keyFeatures}
                onChange={handleInputChange}
                placeholder="List the main features and benefits (one per line)"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate each feature/benefit with a new line
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Content Type
                </label>
                <Select
                  value={formData.contentType}
                  onValueChange={(value) => handleContentTypeChange(value as ContentType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tone of Voice
                </label>
                <Select
                  value={formData.tonality}
                  onValueChange={(value) => handleTonalityChange(value as Tonality)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {tonalities.map(tone => (
                      <SelectItem key={tone.value} value={tone.value}>
                        {tone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            
            <div className="flex justify-between items-center pt-2">
              <div className="text-sm text-gray-500">
                Credits available: {creditsRemaining}
              </div>
              <Button
                type="submit"
                disabled={isLoading || !formData.productName || !formData.description}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Generate Copy
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Generated Marketing Copy</CardTitle>
                <CardDescription>
                  {contentTypes.find(t => t.value === formData.contentType)?.label} for {formData.productName}
                </CardDescription>
              </div>
              <AIModelIndicator model={generatedContent.model} />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContentType)}>
              <TabsList className="mb-4">
                {contentTypes.map(type => (
                  <TabsTrigger key={type.value} value={type.value}>
                    {type.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {contentTypes.map(type => (
                <TabsContent key={type.value} value={type.value} className="space-y-4">
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ 
                      __html: generatedContent.text.replace(/\n/g, '<br />') 
                    }} />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCopy}>
              <CopyIcon className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button onClick={handleSave}>
              <SaveIcon className="h-4 w-4 mr-2" />
              Save to Project
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
