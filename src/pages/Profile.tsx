
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProfileDetails } from '@/components/profile/ProfileDetails';
import { NotificationSettings } from '@/components/profile/NotificationSettings';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubscriptionTierSwitcher } from '@/components/SubscriptionTierSwitcher';
import { Logo } from '@/components/ui/logo';

const Profile = () => {
  const { user, profile } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const { toast } = useToast();

  const validatePassword = () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }
    
    setIsUpdatingPassword(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      toast({
        title: 'Success',
        description: 'Password updated successfully',
      });
      
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleTierChange = () => {
    window.location.reload();
  };

  if (!user || !profile) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Your Profile</h2>
      
      <div className="grid grid-cols-1 gap-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Profile Details</TabsTrigger>
            <TabsTrigger value="account">Account Settings</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-6">
            <ProfileDetails />
          </TabsContent>
          
          <TabsContent value="account" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Manage your account details and password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-gray-500">
                    To change your email, please contact support
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>User ID</Label>
                  <Input
                    value={user.id}
                    disabled
                    className="bg-gray-50 text-gray-500 font-mono text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Account Created</Label>
                  <Input
                    value={new Date(profile.created_at).toLocaleString()}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">Change Password</h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      {passwordError && (
                        <p className="text-sm text-red-600">{passwordError}</p>
                      )}
                    </div>
                    
                    <Button type="submit" disabled={isUpdatingPassword}>
                      {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="subscription" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <SubscriptionTierSwitcher 
                  currentTier={profile.subscription_tier as 'free' | 'basic' | 'premium'} 
                  userId={user.id}
                  onTierChange={handleTierChange}
                />
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Current Plan</p>
                    <p className="text-xl font-medium capitalize">{profile.subscription_tier}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Credits Remaining</p>
                    <p className="text-xl font-medium text-green-600">{profile.credits_remaining}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Credits reset on {new Date(profile.credits_reset_date).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-6">
            <NotificationSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
