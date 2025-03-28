
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const [openNewIdeaModal, setOpenNewIdeaModal] = useState(false);
  const [useAIGeneration, setUseAIGeneration] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
        
        <div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/projects')}
          >
            <FolderClosed className="h-4 w-4 mr-2" />
            View Projects
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <IdeasDashboard />
      </div>
    </div>
  );
}
