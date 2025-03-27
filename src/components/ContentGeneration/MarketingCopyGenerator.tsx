
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useMarketingCopy } from '@/hooks/useMarketingCopy';

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
  const [activeTab, setActiveTab] = useState<ContentType>('landing');
  const [formData, setFormData] = useState<FormData>({
    productName: '',
    description: '',
    targetAudience: '',
    keyFeatures: '',
    tonality: 'professional',
    contentType: 'landing'
  });
  const [saveTitle, setSaveTitle] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { 
    generateCopy, 
    saveCopy, 
    isLoading, 
    error, 
    generatedContent,
    reset
  } = useMarketingCopy(projectId);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'contentType') {
      setActiveTab(value as ContentType);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (creditsRemaining < 5) {
        toast({
          title: 'Insufficient Credits',
          description: 'You need at least 5 credits to generate marketing copy',
          variant: 'destructive',
        });
        return;
      }
      
      await generateCopy({
        ...formData,
        contentType: activeTab
      });
      
      toast({
        title: 'Marketing Copy Generated',
        description: 'Your marketing copy has been generated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate marketing copy',
        variant: 'destructive',
      });
    }
  };
  
  const handleCopyToClipboard = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent.text);
      toast({
        title: 'Copied to clipboard',
        description: 'The content has been copied to your clipboard',
      });
    }
  };
  
  const handleSave = async () => {
    if (!saveTitle.trim()) {
      toast({
        title: 'Title required',
        description: 'Please provide a title for your marketing copy',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await saveCopy(saveTitle);
      
      toast({
        title: 'Saved',
        description: 'Your marketing copy has been saved successfully',
      });
      
      setShowSaveForm(false);
      setSaveTitle('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save marketing copy',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="landing" value={activeTab} onValueChange={(v) => setActiveTab(v as ContentType)}>
        <TabsList className="grid grid-cols-4 mb-4">
          {contentTypes.map((type) => (
            <TabsTrigger
              key={type.value}
              value={type.value}
              onClick={() => handleSelectChange('contentType', type.value)}
            >
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {!generatedContent ? (
          <Card>
            <CardHeader>
              <CardTitle>Generate {activeTab === 'landing' ? 'Landing Page Copy' : 
                             activeTab === 'email' ? 'Email Campaign Copy' :
                             activeTab === 'social' ? 'Social Media Posts' : 'Ad Copy'}</CardTitle>
              <CardDescription>
                Fill in the details about your product to generate compelling copy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Name *</label>
                  <Input
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    placeholder="e.g., TaskMaster Pro"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Description *</label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Briefly describe your product and its main value proposition"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Audience</label>
                  <Input
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    placeholder="e.g., Small business owners, freelancers, etc."
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Key Features & Benefits</label>
                  <Textarea
                    name="keyFeatures"
                    value={formData.keyFeatures}
                    onChange={handleInputChange}
                    placeholder="List the key features and benefits of your product (one per line)"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tone</label>
                  <Select 
                    value={formData.tonality}
                    onValueChange={(value) => handleSelectChange('tonality', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {tonalities.map((tone) => (
                        <SelectItem key={tone.value} value={tone.value}>
                          {tone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <div className="text-sm text-gray-500">
                    Cost: 5 credits (You have {creditsRemaining} credits)
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading || creditsRemaining < 5}
                    className="flex items-center"
                  >
                    {isLoading ? 'Generating...' : (
                      <>
                        <SparklesIcon className="mr-2 h-4 w-4" />
                        Generate Copy
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Generated {
                  activeTab === 'landing' ? 'Landing Page' : 
                  activeTab === 'email' ? 'Email' :
                  activeTab === 'social' ? 'Social Media' : 'Ad'
                } Copy</CardTitle>
                <AIModelIndicator model={generatedContent.model} />
              </div>
              <CardDescription>
                Here's your AI-generated copy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap mb-4 min-h-[300px]">
                {generatedContent.text}
              </div>
              
              {showSaveForm && (
                <div className="bg-blue-50 p-4 rounded-md mb-4 border border-blue-100">
                  <h3 className="font-medium mb-2">Save this copy</h3>
                  <div className="flex space-x-2">
                    <Input
                      value={saveTitle}
                      onChange={(e) => setSaveTitle(e.target.value)}
                      placeholder="Enter a title for this copy"
                      className="bg-white"
                    />
                    <Button onClick={handleSave} variant="outline">
                      Save
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3 mt-4">
                <Button
                  variant="outline"
                  onClick={handleCopyToClipboard}
                  className="flex items-center"
                >
                  <CopyIcon className="mr-2 h-4 w-4" />
                  Copy to Clipboard
                </Button>
                
                {!showSaveForm ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowSaveForm(true)}
                    className="flex items-center"
                  >
                    <SaveIcon className="mr-2 h-4 w-4" />
                    Save Copy
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setShowSaveForm(false)}
                  >
                    Cancel
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  onClick={() => reset()}
                >
                  Generate new copy
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </Tabs>
    </div>
  );
}
