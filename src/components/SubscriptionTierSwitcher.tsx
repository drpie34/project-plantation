
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

type SubscriptionTier = 'free' | 'basic' | 'premium';

interface SubscriptionTierSwitcherProps {
  currentTier: SubscriptionTier;
  userId: string;
  onTierChange?: (tier: SubscriptionTier) => void;
}

export function SubscriptionTierSwitcher({ 
  currentTier, 
  userId,
  onTierChange 
}: SubscriptionTierSwitcherProps) {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(currentTier);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const tiers = [
    { 
      id: 'free', 
      name: 'Free', 
      description: 'Basic access with limited features',
      credits: 100,
      features: [
        'Basic AI models (GPT-4o-mini)',
        'Limited idea generation',
        'Basic market research'
      ]
    },
    { 
      id: 'basic', 
      name: 'Basic', 
      description: 'Enhanced capabilities for serious projects',
      credits: 500,
      features: [
        'Access to GPT-4o',
        'Web search integration',
        'Enhanced market research',
        'Project planning tools'
      ]
    },
    { 
      id: 'premium', 
      name: 'Premium', 
      description: 'Full access to all advanced features',
      credits: 2000,
      features: [
        'Access to Claude models',
        'Extended thinking capabilities',
        'Advanced document analysis',
        'Priority support'
      ]
    }
  ];

  const handleUpdateTier = async () => {
    if (selectedTier === currentTier) return;
    
    setIsUpdating(true);
    
    try {
      // Calculate new credit amount based on tier
      const creditsByTier = {
        free: 100,
        basic: 500,
        premium: 2000
      };
      
      // Update user subscription tier and reset credits
      const { error } = await supabase
        .from('users')
        .update({ 
          subscription_tier: selectedTier,
          credits_remaining: creditsByTier[selectedTier],
          credits_reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast({
        title: 'Subscription updated',
        description: `Your subscription has been updated to ${selectedTier}`,
      });
      
      if (onTierChange) {
        onTierChange(selectedTier);
      }
      
    } catch (error) {
      console.error('Error updating subscription tier:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update subscription tier',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Subscription Tiers</CardTitle>
        <CardDescription>
          Switch between subscription tiers to test different features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={selectedTier} 
          onValueChange={(value) => setSelectedTier(value as SubscriptionTier)}
          className="space-y-4"
        >
          {tiers.map(tier => (
            <div 
              key={tier.id}
              className={`flex items-start space-x-3 rounded-lg border p-4 ${
                selectedTier === tier.id ? 'border-primary bg-secondary/20' : 'border-border'
              }`}
            >
              <RadioGroupItem value={tier.id} id={tier.id} className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor={tier.id} className="text-base font-medium">
                    {tier.name}
                  </Label>
                  {currentTier === tier.id && (
                    <Badge variant="outline" className="ml-2">Current</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
                
                <div className="mt-2">
                  <p className="text-sm font-medium">Credits: {tier.credits}</p>
                  <ul className="mt-2 space-y-1">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="text-xs text-muted-foreground flex items-center">
                        <span className="mr-1.5">•</span> {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </RadioGroup>
        
        <div className="mt-6">
          <Button 
            onClick={handleUpdateTier} 
            disabled={selectedTier === currentTier || isUpdating}
            className="w-full"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              `Switch to ${selectedTier} tier`
            )}
          </Button>
        </div>
        
        <p className="mt-4 text-xs text-muted-foreground text-center">
          This is for testing purposes only. No payment will be processed.
        </p>
      </CardContent>
    </Card>
  );
}
