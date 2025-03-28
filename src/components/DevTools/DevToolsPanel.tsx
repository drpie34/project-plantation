import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import ApiLogger from './ApiLogger';
import { setUseMockData, isUsingMockData } from '@/utils/mockAiResponses';
import { apiLogStore } from '@/utils/apiGateway';
import { Wrench, Code, MessageSquare, Activity, Server, Cpu } from 'lucide-react';
import { AIRouterTest } from '@/components/AIRouterTest';
import { ApiGatewayStatus } from '@/components/ApiGatewayStatus';

export default function DevToolsPanel() {
  const [mockDataEnabled, setMockDataEnabled] = useState(isUsingMockData());
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  const toggleMockData = () => {
    const newValue = !mockDataEnabled;
    setMockDataEnabled(newValue);
    setUseMockData(newValue);
  };
  
  const toggleLogging = () => {
    apiLogStore.enableLogging(!apiLogStore.isLoggingEnabled());
  };
  
  if (!isPanelOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setIsPanelOpen(true)}
          className="bg-gray-800 hover:bg-gray-700 text-white rounded-full h-12 w-12 shadow-lg"
        >
          <Wrench className="h-5 w-5" />
        </Button>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Developer Tools
              </CardTitle>
              <CardDescription>Tools for debugging and development</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsPanelOpen(false)}>
              Close
            </Button>
          </div>
        </CardHeader>
        
        <div className="flex-grow overflow-hidden flex flex-col">
          <Tabs defaultValue="api-logger" className="flex-grow flex flex-col">
            <div className="border-b px-4">
              <TabsList className="mt-2">
                <TabsTrigger value="api-logger" className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>AI API Logger</span>
                </TabsTrigger>
                <TabsTrigger value="api-tools" className="flex items-center gap-1">
                  <Server className="h-4 w-4" />
                  <span>API Tools</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-1">
                  <Code className="h-4 w-4" />
                  <span>Dev Settings</span>
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  <span>Performance</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-grow overflow-auto p-4">
              <TabsContent value="api-logger" className="mt-0 h-full">
                <ApiLogger />
              </TabsContent>
              
              <TabsContent value="api-tools" className="mt-0 h-full space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <ApiGatewayStatus />
                  </div>
                  <div>
                    <AIRouterTest />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Development Settings</CardTitle>
                    <CardDescription>
                      Configure developer tools and testing options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">API Settings</h3>
                      <div className="flex items-center justify-between border p-4 rounded-md">
                        <div>
                          <h4 className="font-medium">Mock AI API Responses</h4>
                          <p className="text-sm text-muted-foreground">
                            Use mock data instead of calling real AI APIs. Useful for testing UI without consuming credits.
                          </p>
                        </div>
                        <Switch 
                          checked={mockDataEnabled}
                          onCheckedChange={toggleMockData}
                          id="mock-data-toggle"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between border p-4 rounded-md">
                        <div>
                          <h4 className="font-medium">Enable API Logging</h4>
                          <p className="text-sm text-muted-foreground">
                            Log all API calls to the developer console and API Logger tab.
                          </p>
                        </div>
                        <Switch 
                          checked={apiLogStore.isLoggingEnabled()}
                          onCheckedChange={toggleLogging}
                          id="logging-toggle"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="performance" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Monitoring</CardTitle>
                    <CardDescription>
                      Monitor application performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                      Performance monitoring tools will be added in a future update.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}