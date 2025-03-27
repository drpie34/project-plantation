import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import MindMap from './MindMap';
import GanttChart from './GanttChart';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { Node, Edge } from '@xyflow/react';

interface VisualPlan {
  id: string;
  name: string;
  type: 'mindmap' | 'gantt';
  data: any;
  created_at: string;
  updated_at: string;
}

interface VisualPlansProps {
  projectId: string;
}

export default function VisualPlans({ projectId }: VisualPlansProps) {
  const [plans, setPlans] = useState<VisualPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<VisualPlan | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPlans = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('visual_plans')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPlans(data as VisualPlan[]);
      } catch (error: any) {
        console.error('Error fetching visual plans:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load visual plans',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [projectId, user, toast]);

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;

    try {
      const { error } = await supabase
        .from('visual_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPlans(plans.filter(plan => plan.id !== id));
      toast({
        title: 'Success',
        description: 'Plan deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting plan:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete plan',
        variant: 'destructive'
      });
    }
  };

  const openPreview = (plan: VisualPlan) => {
    setSelectedPlan(plan);
    setIsPreviewOpen(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading plans...</div>;
  }

  if (plans.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500 mb-4">No visual plans have been created yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Your Visual Plans</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map(plan => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                Type: {plan.type.charAt(0).toUpperCase() + plan.type.slice(1)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Created: {format(new Date(plan.created_at), 'MMM d, yyyy')}
              </p>
              <p className="text-sm text-gray-500">
                Last updated: {format(new Date(plan.updated_at), 'MMM d, yyyy')}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => openPreview(plan)}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <div className="space-x-2">
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-500 hover:text-red-600"
                  onClick={() => handleDeletePlan(plan.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedPlan?.name}</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            {selectedPlan && selectedPlan.type === 'mindmap' && (
              <MindMap
                initialNodes={selectedPlan.data.nodes as Node[]}
                initialEdges={selectedPlan.data.edges as Edge[]}
                readOnly
              />
            )}
            {selectedPlan && selectedPlan.type === 'gantt' && (
              <GanttChart
                initialTasks={selectedPlan.data.tasks}
                readOnly
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
