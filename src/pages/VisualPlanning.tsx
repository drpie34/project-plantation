
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VisualPlanningTabs from '@/components/VisualPlanning/VisualPlanningTabs';
import VisualPlans from '@/components/VisualPlanning/VisualPlans';

export default function VisualPlanning() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (error) throw error;
        setProject(data);
      } catch (error: any) {
        console.error('Error fetching project:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load project details',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, toast]);

  if (loading) {
    return <div className="container py-8">Loading project details...</div>;
  }

  if (!project) {
    return <div className="container py-8">Project not found</div>;
  }

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{project.title} - Visual Planning</h1>
        <p className="text-gray-600">
          Create and manage visual plans for your project
        </p>
      </div>

      <Tabs defaultValue="create">
        <TabsList>
          <TabsTrigger value="create">Create New Plan</TabsTrigger>
          <TabsTrigger value="saved">Saved Plans</TabsTrigger>
        </TabsList>
        <TabsContent value="create" className="pt-6">
          <VisualPlanningTabs projectId={projectId || ''} />
        </TabsContent>
        <TabsContent value="saved" className="pt-6">
          <VisualPlans projectId={projectId || ''} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
