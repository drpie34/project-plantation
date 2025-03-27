
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ApiGatewayStatus } from '@/components/ApiGatewayStatus';
import { AIRouterTest } from '@/components/AIRouterTest';
import { callApiGateway } from '@/utils/apiGateway';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard = () => {
  const { profile } = useAuth();

  useEffect(() => {
    // Track page view for analytics
    if (profile?.id) {
      callApiGateway('trackActivity', {
        user_id: profile.id,
        activity_type: 'page_view',
        entity_type: 'dashboard',
        entity_id: 'dashboard',
        details: { page: 'dashboard' }
      }).catch(err => console.error('Failed to track activity:', err));
    }
  }, [profile?.id]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}!</h1>
        <p className="text-gray-500">
          This is your App Whisperer dashboard. From here, you can access all your projects, ideas, and tools.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="api-status">API Status</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
                <CardDescription>Your subscription and credits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subscription</span>
                    <span className="font-medium capitalize">{profile?.subscription_tier || 'Free'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Credits</span>
                    <span className="font-medium">{profile?.credits_remaining || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Credits Reset</span>
                    <span className="font-medium">
                      {profile?.credits_reset_date ? new Date(profile.credits_reset_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Feature Spotlight Card */}
            <Card>
              <CardHeader>
                <CardTitle>Feature Spotlight</CardTitle>
                <CardDescription>Try our latest capabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">AI Assistant</h3>
                    <p className="text-sm text-gray-500">
                      Get help with project planning, market research, and more with our AI assistant.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Collaboration Tools</h3>
                    <p className="text-sm text-gray-500">
                      Work with your team in real-time using our collaboration features.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-center">
            <AIRouterTest />
          </div>
        </TabsContent>
        
        <TabsContent value="api-status" className="flex justify-center">
          <ApiGatewayStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
