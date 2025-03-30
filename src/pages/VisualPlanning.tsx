
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VisualPlanningTabs from '@/components/VisualPlanning/VisualPlanningTabs';
import VisualPlans from '@/components/VisualPlanning/VisualPlans';
import { documentGenerationService } from '@/services/documentGenerationService';

export default function VisualPlanning() {
  // Fix the parameter extraction
  const params = useParams();
  const projectId = params.projectId;
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Function to save visual plan to document hub
  const saveToDocumentHub = async (planData: any) => {
    if (!projectId || !user?.id) return;
    
    try {
      console.log('Saving visual plan to document hub');
      
      // Convert plan data to a structured format for document
      const designData = {
        diagramType: planData.type || 'visual_plan',
        diagramContent: planData.content || JSON.stringify(planData),
        visualElements: planData.elements || [],
        implementationPlan: `Implementation plan based on ${planData.title || 'visual diagram'}`
      };
      
      // Create document in the background
      await documentGenerationService.createDesignDevelopmentDocument(
        user.id,
        projectId,
        designData
      );
      
      console.log('Visual plan document automatically added to Document Hub');
      
      // Don't show a toast to avoid interrupting the user
    } catch (error) {
      console.error('Error saving visual plan to document hub:', error);
    }
  };

  useEffect(() => {
    const fetchProject = async () => {
      // Check if projectId is valid and not the route parameter placeholder
      if (!projectId || projectId === ':projectId') {
        setLoading(false);
        console.error('Invalid project ID:', projectId);
        toast({
          title: 'Error',
          description: 'Invalid or missing project ID',
          variant: 'destructive'
        });
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching project with ID:", projectId); // Debug log
        
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        if (!data) {
          console.error('No project data returned');
          throw new Error('Project not found');
        }
        
        console.log("Project data retrieved:", data); // Debug log
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
    return (
      <div className="container py-8">
        Project not found. Please check the project ID: {projectId}
      </div>
    );
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
          <VisualPlanningTabs 
            projectId={projectId} 
            onSave={saveToDocumentHub} 
          />
        </TabsContent>
        <TabsContent value="saved" className="pt-6">
          <VisualPlans 
            projectId={projectId} 
            onView={saveToDocumentHub} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
