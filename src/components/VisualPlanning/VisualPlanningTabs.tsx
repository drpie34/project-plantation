
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import MindMap from './MindMap';
import GanttChart from './GanttChart';
import { Edge, Node } from '@xyflow/react';

interface VisualPlanningTabsProps {
  projectId: string;
}

export default function VisualPlanningTabs({ projectId }: VisualPlanningTabsProps) {
  const [activeTab, setActiveTab] = useState('mindmap');
  const [planName, setPlanName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Handle saving a mind map
  const handleSaveMindMap = async (data: { nodes: Node[]; edges: Edge[] }) => {
    if (!user || !planName) {
      toast({
        title: 'Error',
        description: 'Please enter a name for your mind map.',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('visual_plans').insert({
        name: planName,
        type: 'mindmap',
        project_id: projectId,
        user_id: user.id,
        data: data
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Mind map saved successfully.'
      });
      
      // Reset form
      setPlanName('');
      setIsCreating(false);
    } catch (error: any) {
      console.error('Error saving mind map:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save mind map.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle saving a Gantt chart
  const handleSaveGanttChart = async (tasks: any[]) => {
    if (!user || !planName) {
      toast({
        title: 'Error',
        description: 'Please enter a name for your Gantt chart.',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('visual_plans').insert({
        name: planName,
        type: 'gantt',
        project_id: projectId,
        user_id: user.id,
        data: { tasks }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Gantt chart saved successfully.'
      });
      
      // Reset form
      setPlanName('');
      setIsCreating(false);
    } catch (error: any) {
      console.error('Error saving Gantt chart:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save Gantt chart.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Visual Planning Tools</h2>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          Create New Plan
        </Button>
      </div>

      {isCreating && (
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <div className="mb-4">
            <Label htmlFor="plan-name">Plan Name</Label>
            <Input
              id="plan-name"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="Enter a name for your plan"
              className="max-w-md"
            />
          </div>

          <Tabs defaultValue="mindmap" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="mindmap">Mind Map</TabsTrigger>
              <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
            </TabsList>
            <TabsContent value="mindmap" className="mt-6">
              <MindMap
                initialNodes={[
                  {
                    id: 'node-root',
                    type: 'custom',
                    data: { label: 'Central Idea' },
                    position: { x: 250, y: 250 }
                  }
                ]}
                initialEdges={[]}
                onSave={handleSaveMindMap}
              />
            </TabsContent>
            <TabsContent value="gantt" className="mt-6">
              <GanttChart
                initialTasks={[]}
                onSave={handleSaveGanttChart}
              />
            </TabsContent>
          </Tabs>

          <div className="mt-4 flex items-center gap-2">
            <Button 
              onClick={() => {
                if (activeTab === 'mindmap') {
                  toast({
                    title: 'Info',
                    description: 'Use the Save button inside the mind map to save your changes.'
                  });
                } else if (activeTab === 'gantt') {
                  toast({
                    title: 'Info',
                    description: 'Adding or removing tasks will automatically save your Gantt chart.'
                  });
                }
              }}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreating(false);
                setPlanName('');
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* List of saved plans will be implemented here */}
    </div>
  );
}
