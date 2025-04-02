import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { callApiGateway } from '@/utils/apiGateway';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle, 
  Lightbulb, 
  Folder, 
  Sparkles,
  Layers
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProjects } from '@/hooks/useProjects';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { projects } = useProjects();
  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  useEffect(() => {
    // Track page view for analytics - wrapped in try/catch to prevent crashes
    if (profile?.id) {
      try {
        // Use a timeout to not block the UI rendering
        setTimeout(() => {
          callApiGateway('trackActivity', {
            user_id: profile.id,
            activity_type: 'page_view',
            entity_type: 'dashboard',
            entity_id: 'dashboard',
            details: { page: 'dashboard' }
          }).catch(err => {
            console.error('Failed to track activity:', err);
            // Don't rethrow, this is non-critical functionality
          });
        }, 100);
      } catch (err) {
        // Catch any synchronous errors
        console.error('Error setting up activity tracking:', err);
      }
    }
    
    // Load recent projects
    const fetchRecentProjects = async () => {
      if (!profile?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', profile.id)
          .order('updated_at', { ascending: false })
          .limit(3);
          
        if (error) throw error;
        setRecentProjects(data || []);
      } catch (err) {
        console.error('Error fetching recent projects:', err);
        // Set an empty array to prevent undefined errors
        setRecentProjects([]);
      }
    };
    
    fetchRecentProjects();
  }, [profile?.id]);

  const handleGenerateNewIdea = () => {
    navigate('/new-idea');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}!</h1>
        <p className="text-gray-500">
          This is your App Whisperer dashboard. From here, you can access all your projects, ideas, and tools.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="col-span-2 space-y-6">
          {/* Account Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>Your subscription and credits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Subscription</span>
                  <Badge className="capitalize bg-blue-100 text-blue-800 hover:bg-blue-100">
                    {profile?.subscription_tier || 'Free'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Credits</span>
                  <Badge variant="outline" className="font-medium">
                    {profile?.credits_remaining || 0} credits remaining
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Credits Reset</span>
                  <span className="text-sm">
                    {profile?.credits_reset_date ? new Date(profile.credits_reset_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/profile/credits')}
              >
                Manage Credits
              </Button>
            </CardFooter>
          </Card>
          
          {/* Feature Spotlight Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Feature Spotlight
              </CardTitle>
              <CardDescription>Try our latest capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="bg-blue-100 p-2 rounded-md">
                    <Lightbulb className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">AI Idea Generation</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Let AI help you generate innovative SaaS ideas based on your interests and industry preferences.
                    </p>
                    <Button
                      variant="link"
                      className="p-0 h-auto mt-1 text-blue-600"
                      onClick={handleGenerateNewIdea}
                    >
                      Try it now →
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="bg-green-100 p-2 rounded-md">
                    <Layers className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Enhanced Project Planning</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Our new tabbed interface makes planning your project simpler and more organized.
                    </p>
                    <Button
                      variant="link"
                      className="p-0 h-auto mt-1 text-green-600"
                      onClick={() => navigate('/projects')}
                    >
                      Explore projects →
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started quickly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start"
                onClick={handleGenerateNewIdea}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Generate New Idea
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/ideas')}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Browse Ideas Hub
              </Button>
              <Button 
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/projects')}
              >
                <Folder className="h-4 w-4 mr-2" />
                View All Projects
              </Button>
            </CardContent>
          </Card>
          
          {/* Recent Projects Card */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Your latest work</CardDescription>
            </CardHeader>
            <CardContent>
              {recentProjects.length > 0 ? (
                <div className="space-y-3">
                  {recentProjects.map(project => (
                    <div 
                      key={project.id} 
                      className="border rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <h3 className="font-medium truncate">{project.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Last updated: {new Date(project.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Folder className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p>No recent projects</p>
                  <Button 
                    variant="link" 
                    className="mt-2"
                    onClick={() => navigate('/ideas')}
                  >
                    Generate ideas to get started
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;