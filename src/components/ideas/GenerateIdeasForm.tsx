
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface GenerateIdeasFormProps {
  projectId: string;
  isLoading: boolean;
  creditsRemaining: number;
  onSubmit: (industry: string, interests: string) => Promise<void>;
}

const GenerateIdeasForm = ({ 
  projectId, 
  isLoading, 
  creditsRemaining, 
  onSubmit 
}: GenerateIdeasFormProps) => {
  const [industry, setIndustry] = useState('');
  const [interests, setInterests] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!industry.trim()) {
      toast({
        title: 'Error',
        description: 'Industry is required',
        variant: 'destructive',
      });
      return;
    }

    if (creditsRemaining < 5) {
      toast({
        title: 'Insufficient Credits',
        description: 'You need at least 5 credits to generate ideas',
        variant: 'destructive',
      });
      return;
    }

    await onSubmit(industry, interests);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Idea Generation</CardTitle>
        <CardDescription>
          Fill in details about your target industry and interests to generate SaaS ideas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="industry">Target Industry *</Label>
            <Input
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g., Healthcare, Real Estate, Education"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="interests">Specific Interests or Focus Areas</Label>
            <Textarea
              id="interests"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g., Automation, Mobile apps, B2B solutions"
              rows={4}
            />
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <p className="font-medium text-blue-800">Cost: 5 credits</p>
            <p className="text-sm text-blue-700 mt-1">
              Your current balance: {creditsRemaining} credits
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/projects/${projectId}`)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || creditsRemaining < 5}
            >
              {isLoading ? 'Generating...' : 'Generate Ideas'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GenerateIdeasForm;
