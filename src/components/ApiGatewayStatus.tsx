
import { useState } from 'react';
import { callApiGateway } from '@/utils/apiGateway';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

// Define the type for the API response
interface ApiGatewayResponse {
  message: string;
  configuredKeys: Record<string, string>;
  receivedAction?: string;
}

export function ApiGatewayStatus() {
  const [status, setStatus] = useState<ApiGatewayResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkApiGateway = async () => {
    setLoading(true);
    try {
      const result = await callApiGateway('check-status') as ApiGatewayResponse;
      setStatus(result);
      toast({
        title: 'API Gateway Check',
        description: 'Successfully connected to the API Gateway',
      });
    } catch (error) {
      console.error('Error checking API Gateway:', error);
      toast({
        title: 'API Gateway Error',
        description: error instanceof Error ? error.message : 'Failed to connect to API Gateway',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>API Gateway Status</CardTitle>
        <CardDescription>
          Check the status of your API Gateway and configured API keys
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status && (
          <div className="space-y-4">
            <Alert>
              <AlertTitle>Gateway Status</AlertTitle>
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Configured API Keys:</h3>
              <ul className="list-disc pl-5 space-y-1">
                {Object.entries(status.configuredKeys || {}).map(([service, status]) => (
                  <li key={service} className="text-sm">
                    {service}: <span className={status === 'configured' ? 'text-green-500' : 'text-red-500'}>
                      {status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {!status && !loading && (
          <div className="py-8 text-center text-gray-500">
            Click the button below to check API Gateway status
          </div>
        )}

        {loading && (
          <div className="py-8 text-center text-gray-500">
            Checking API Gateway status...
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={checkApiGateway} disabled={loading}>
          {loading ? 'Checking...' : 'Check API Gateway Status'}
        </Button>
      </CardFooter>
    </Card>
  );
}
