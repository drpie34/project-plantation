
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiGatewayStatus } from '@/components/ApiGatewayStatus';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/ui/logo';

export default function Dashboard() {
  const { profile } = useAuth();
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="grid gap-6">
        <div className="flex flex-col items-center mb-4">
          <Logo size="xl" className="mb-4" />
          <h1 className="text-3xl font-bold">Welcome to App Whisperer</h1>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Account Summary</CardTitle>
              <CardDescription>Overview of your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Subscription:</span>
                  <span className="capitalize">{profile?.subscription_tier || 'Free'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Credits Remaining:</span>
                  <span>{profile?.credits_remaining || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <ApiGatewayStatus />
        </div>
      </div>
    </div>
  );
}
