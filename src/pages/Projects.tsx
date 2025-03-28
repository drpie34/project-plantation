import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Project } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { PageHeader, CardContainer, LoadingSpinner, EmptyState } from '@/components/common';
import { useErrorHandler } from '@/services/errorService';
import { databaseService } from '@/services/databaseService';
import { UI_CONFIG, FEATURE_CONFIG } from '@/config';

const Projects = () => {
  const { projects, isLoading, fetchProjects } = useProjects();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  const [error, setError] = useState<string | null>(null);

  // Example of direct use of databaseService as an alternative
  const fetchProjectsAlternative = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await databaseService.getAll<Project>(
        'projects',
        [{ column: 'user_id', operation: 'eq', value: user.id }],
        { 
          orderBy: { column: 'updated_at', ascending: false },
          limit: FEATURE_CONFIG.TIER_LIMITS.PREMIUM.PROJECTS
        }
      );

      if (error) {
        setError('Failed to load projects');
        handleError('Projects', 'fetchProjectsAlternative', error);
        return;
      }

      // We could set projects here if needed
      console.log('Projects loaded with databaseService:', data);
    } catch (error) {
      handleError('Projects', 'fetchProjectsAlternative', error);
    }
  };

  useEffect(() => {
    // Main method using the hook
    fetchProjects();
    
    // Alternative method using direct database service (for demonstration)
    // fetchProjectsAlternative();
  }, [user]);

  return (
    <div className="container space-y-6 py-8">
      <PageHeader
        title="Projects"
        description="Create and manage your SaaS projects"
        actions={
          <Button onClick={() => navigate('/ideas')} variant="outline">
            <Lightbulb className="mr-2 h-4 w-4" />
            Go to Ideas Hub
          </Button>
        }
      />
      
      <div className="grid gap-6 md:grid-cols-1">
        <CardContainer
          title="Project Workflow"
          description="Your SaaS projects all begin in the Ideas Hub"
        >
          <p className="mb-4 text-sm text-gray-600">
            Projects are created from ideas in your Ideas Hub. To start a new project, first create 
            or select an idea, then click the "Start Project" button on that idea.
          </p>
          <Button variant="outline" onClick={() => navigate('/ideas')}>
            Browse Ideas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContainer>
        
        {error && (
          <div className="mt-4">
            <ErrorDisplay error={error} retry={fetchProjects} />
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="large" />
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <CardContainer
                key={project.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                title={project.title}
                description={`Stage: ${project.stage.charAt(0).toUpperCase() + project.stage.slice(1)}`}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <p className="line-clamp-3 text-gray-600 mb-4">
                  {project.description || 'No description provided'}
                </p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
                  <span>Updated: {new Date(project.updated_at).toLocaleDateString()}</span>
                </div>
              </CardContainer>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No projects yet"
            description="Start with an idea from the Ideas Hub to create your first SaaS project"
            icon={<Lightbulb className="h-12 w-12" />}
            action={{
              label: "Browse Ideas",
              onClick: () => navigate('/ideas')
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Projects;
