
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusIcon } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error fetching projects:', error);
          return;
        }

        setProjects(data as Project[]);
      } catch (error) {
        console.error('Error in fetchProjects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Your Projects</h2>
        <Button onClick={() => navigate('/projects/new')}>
          <PlusIcon className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <CardDescription>
                  Stage: <span className="capitalize">{project.stage}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-gray-600 mb-4">
                  {project.description || 'No description provided'}
                </p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
                  <span>Updated: {new Date(project.updated_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <h3 className="text-xl font-medium mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-6">
                Create your first SaaS project to get started with idea generation
              </p>
              <Button onClick={() => navigate('/projects/new')}>
                <PlusIcon className="mr-2 h-4 w-4" /> Create Project
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Projects;
