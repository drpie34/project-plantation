
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Lightbulb, FolderClosed } from 'lucide-react';
import IdeasDashboard from '@/components/IdeasHub/IdeasDashboard';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function IdeasHub() {
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentProjects = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('projects')
          .select('id, title, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(3);
        
        setRecentProjects(data || []);
      } catch (error) {
        console.error('Error fetching recent projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentProjects();
  }, [user]);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="mr-2" 
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Ideas Hub</h1>
            <p className="text-muted-foreground">Manage, filter and organize all your SaaS ideas</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate('/projects')}
          >
            <FolderClosed className="h-4 w-4 mr-2" />
            View Projects
          </Button>
          <Button 
            onClick={() => navigate('/projects/new')}
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Start New Project
          </Button>
        </div>
      </div>

      <Tabs defaultValue="ideas" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="ideas">All Ideas</TabsTrigger>
          <TabsTrigger value="projects">Recent Projects</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ideas">
          <IdeasDashboard />
        </TabsContent>
        
        <TabsContent value="projects">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : recentProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentProjects.map((project) => (
                <Card 
                  key={project.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <CardContent className="pt-6">
                    <h3 className="font-medium text-lg mb-1">{project.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Updated {new Date(project.updated_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
              
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow border-dashed flex items-center justify-center"
                onClick={() => navigate('/projects')}
              >
                <CardContent className="text-center py-10">
                  <p className="text-muted-foreground">View all projects</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">No projects created yet</p>
                <Button onClick={() => navigate('/projects/new')}>Create Your First Project</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
