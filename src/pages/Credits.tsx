
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ApiUsage } from '@/types/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Credits = () => {
  const [apiUsage, setApiUsage] = useState<ApiUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApiUsage = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('api_usage')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Error fetching API usage:', error);
          return;
        }

        setApiUsage(data as ApiUsage[]);
      } catch (error) {
        console.error('Error in fetchApiUsage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiUsage();
  }, [user]);

  // Calculate total usage by category
  const calculateCategoryUsage = () => {
    const result = {
      openai: 0,
      claude: 0,
      other: 0,
    };

    apiUsage.forEach(usage => {
      if (usage.api_type === 'openai') {
        result.openai += usage.credits_used;
      } else if (usage.api_type === 'claude') {
        result.claude += usage.credits_used;
      } else {
        result.other += usage.credits_used;
      }
    });

    return result;
  };

  const categoryUsage = calculateCategoryUsage();
  const totalUsed = categoryUsage.openai + categoryUsage.claude + categoryUsage.other;
  
  // Get tier info
  const getTierInfo = () => {
    switch (profile?.subscription_tier) {
      case 'premium':
        return {
          name: 'Premium',
          initialCredits: 2000,
          models: ['GPT-4o', 'GPT-4o-mini', 'Claude 3.5 Sonnet', 'Claude 3.7 Sonnet'],
          features: ['Extended Thinking', 'Web Search', 'Large Document Analysis'],
          color: 'bg-purple-100 text-purple-800 border-purple-300'
        };
      case 'basic':
        return {
          name: 'Basic',
          initialCredits: 500,
          models: ['GPT-4o', 'GPT-4o-mini with Web Search'],
          features: ['Market Research with Web Search', 'Project Planning'],
          color: 'bg-blue-100 text-blue-800 border-blue-300'
        };
      default:
        return {
          name: 'Free',
          initialCredits: 100,
          models: ['GPT-4o-mini'],
          features: ['Basic idea generation', 'Simple market research'],
          color: 'bg-green-100 text-green-800 border-green-300'
        };
    }
  };

  const tierInfo = getTierInfo();
  const initialCredits = tierInfo.initialCredits;

  if (!profile) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Credits & Usage</h2>
        <Badge className={`text-sm py-1 px-3 ${tierInfo.color}`}>
          {tierInfo.name} Plan
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Credits Overview</CardTitle>
            <CardDescription>
              Track your credit usage and balance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Credits Used: {totalUsed}</span>
                <span className="text-sm">Total: {initialCredits}</span>
              </div>
              <Progress value={(totalUsed / initialCredits) * 100} />
              <p className="text-right text-sm text-green-600 font-medium">
                {profile.credits_remaining} credits remaining
              </p>
            </div>
            
            <div className="pt-4">
              <h4 className="text-sm font-medium mb-3">Usage Breakdown</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">OpenAI</span>
                  <span className="text-sm font-medium">{categoryUsage.openai} credits</span>
                </div>
                <Progress value={(categoryUsage.openai / (totalUsed || 1)) * 100} className="bg-blue-100" />
                
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm">Claude</span>
                  <span className="text-sm font-medium">{categoryUsage.claude} credits</span>
                </div>
                <Progress value={(categoryUsage.claude / (totalUsed || 1)) * 100} className="bg-purple-100" />
                
                {categoryUsage.other > 0 && (
                  <>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-sm">Other</span>
                      <span className="text-sm font-medium">{categoryUsage.other} credits</span>
                    </div>
                    <Progress value={(categoryUsage.other / (totalUsed || 1)) * 100} className="bg-gray-100" />
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Credit Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Current Plan</p>
              <p className="font-medium capitalize">{profile.subscription_tier}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Monthly Credits</p>
              <p className="font-medium">{initialCredits} credits</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Next Reset</p>
              <p className="font-medium">{new Date(profile.credits_reset_date).toLocaleDateString()}</p>
            </div>
            
            <div className="pt-2 border-t mt-4">
              <p className="text-sm text-gray-500 mb-2">Available AI Models</p>
              <div className="space-y-1">
                {tierInfo.models.map((model, index) => (
                  <p key={index} className="text-sm">• {model}</p>
                ))}
              </div>
            </div>
            
            <div className="pt-2 border-t mt-4">
              <p className="text-sm text-gray-500 mb-2">Plan Features</p>
              <div className="space-y-1">
                {tierInfo.features.map((feature, index) => (
                  <p key={index} className="text-sm">• {feature}</p>
                ))}
              </div>
            </div>
            
            <div className="pt-4 mt-4">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate('/profile')}
              >
                Change Subscription Tier
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Test all tiers without payment
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Usage History</CardTitle>
          <CardDescription>
            Recent API usage and credit deductions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading usage history...</p>
            </div>
          ) : apiUsage.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">Date</th>
                    <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">API</th>
                    <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">Model</th>
                    <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">Tokens</th>
                    <th className="py-2 px-3 text-right text-sm font-medium text-gray-500">Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {apiUsage.map((usage) => (
                    <tr key={usage.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3 text-sm">
                        {new Date(usage.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-sm">{usage.api_type}</td>
                      <td className="py-3 px-3 text-sm">{usage.model_used}</td>
                      <td className="py-3 px-3 text-sm">
                        {usage.tokens_input + usage.tokens_output}
                      </td>
                      <td className="py-3 px-3 text-sm text-right font-medium">
                        {usage.credits_used}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500">No usage history yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Credits;
