import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import MindMap from './MindMap';
import GanttChart from './GanttChart';
import { Edge, Node } from '@xyflow/react';
import { Json } from '@/types/supabase';
import { Code, FileText, Workflow, PenTool } from 'lucide-react';

interface VisualPlanningTabsProps {
  projectId: string;
  onSave?: (planData: any) => void;
}

export default function VisualPlanningTabs({ projectId, onSave }: VisualPlanningTabsProps) {
  const [activeTab, setActiveTab] = useState('wireframes');
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
      // Convert the complex Node and Edge objects to a simpler structure that can be stored as JSON
      const serializedData = {
        nodes: data.nodes.map(node => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: node.data
        })),
        edges: data.edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle
        }))
      };

      const { error } = await supabase.from('visual_plans').insert({
        name: planName,
        type: 'mindmap',
        project_id: projectId,
        user_id: user.id,
        data: serializedData as Json
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Mind map saved successfully.'
      });
      
      // Notify parent component
      if (onSave) {
        onSave({
          type: 'mindmap',
          title: planName,
          content: JSON.stringify(serializedData),
          elements: data.nodes.map(n => n.data.label || 'Node')
        });
      }
      
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
        data: { tasks } as Json
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Gantt chart saved successfully.'
      });
      
      // Notify parent component
      if (onSave) {
        onSave({
          type: 'gantt',
          title: planName,
          content: JSON.stringify({ tasks }),
          elements: tasks.map(t => t.name || 'Task')
        });
      }
      
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
      <Card>
        <CardHeader>
          <CardTitle>Design & Development Planning</CardTitle>
          <CardDescription>
            Create technical specifications, wireframes, and development plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="wireframes" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="wireframes">
                <PenTool className="w-4 h-4 mr-2" />
                Wireframes
              </TabsTrigger>
              <TabsTrigger value="tech-stack">
                <Code className="w-4 h-4 mr-2" />
                Tech Stack
              </TabsTrigger>
              <TabsTrigger value="user-journeys">
                <Workflow className="w-4 h-4 mr-2" />
                User Journeys
              </TabsTrigger>
              <TabsTrigger value="documentation">
                <FileText className="w-4 h-4 mr-2" />
                Documentation
              </TabsTrigger>
            </TabsList>
            
            {/* Tab Content */}
            <TabsContent value="wireframes" className="pt-4">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 min-h-[400px] flex flex-col items-center justify-center text-center">
                <PenTool className="w-12 h-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-medium mb-2">Wireframes & Mockups</h3>
                <p className="text-gray-600 max-w-md mb-6">
                  Create visual layouts of your application screens to plan the user interface and experience.
                </p>
                <Button onClick={() => setIsCreating(true)}>Create New Wireframe</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="tech-stack" className="pt-4">
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-6 min-h-[400px] flex flex-col items-center justify-center text-center">
                <Code className="w-12 h-12 text-purple-500 mb-4" />
                <h3 className="text-xl font-medium mb-2">Technology Stack & Requirements</h3>
                <p className="text-gray-600 max-w-md mb-6">
                  Define technical requirements, technology choices, and architecture specifications.
                </p>
                <Button onClick={() => setIsCreating(true)}>Create Tech Specification</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="user-journeys" className="pt-4">
              <div className="bg-green-50 border border-green-100 rounded-lg p-6 min-h-[400px] flex flex-col items-center justify-center text-center">
                <Workflow className="w-12 h-12 text-green-500 mb-4" />
                <h3 className="text-xl font-medium mb-2">User Journey Maps</h3>
                <p className="text-gray-600 max-w-md mb-6">
                  Map out the complete user experience flow from initial interaction to goal completion.
                </p>
                <Button onClick={() => setIsCreating(true)}>Create User Journey</Button>
              </div>
            </TabsContent>
            
            
            <TabsContent value="documentation" className="pt-4">
              <div className="bg-teal-50 border border-teal-100 rounded-lg p-6 min-h-[400px] flex flex-col items-center justify-center text-center">
                <FileText className="w-12 h-12 text-teal-500 mb-4" />
                <h3 className="text-xl font-medium mb-2">Development Documentation</h3>
                <p className="text-gray-600 max-w-md mb-6">
                  Create comprehensive documentation for development, testing, security, and maintenance.
                </p>
                <Button onClick={() => setIsCreating(true)}>Create Documentation</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Plan</CardTitle>
            <CardDescription>
              {activeTab === 'wireframes' ? 'Design the visual layout of your application' :
               activeTab === 'tech-stack' ? 'Define your technical requirements and specifications' :
               activeTab === 'user-journeys' ? 'Map out the user flow through your application' :
               'Create comprehensive documentation'}
            </CardDescription>
          </CardHeader>
          <CardContent>
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

            <Tabs defaultValue="visual" className="mt-6">
              <TabsList>
                <TabsTrigger value="visual">Visual Designer</TabsTrigger>
                <TabsTrigger value="mindmap">Mind Map</TabsTrigger>
                <TabsTrigger value="gantt">Timeline</TabsTrigger>
              </TabsList>
              
              <TabsContent value="visual" className="mt-6">
                <div className="border border-gray-200 rounded-lg p-6 min-h-[400px] flex flex-col items-center justify-center text-center">
                  <p className="text-gray-600 mb-2">Visual design tools coming soon</p>
                  <p className="text-sm text-gray-500">In the meantime, try using the mind map or timeline tools</p>
                </div>
              </TabsContent>
              
              <TabsContent value="mindmap" className="mt-6">
                <MindMap
                  initialNodes={[
                    {
                      id: 'node-root',
                      type: 'custom',
                      data: { label: activeTab === 'wireframes' ? 'Home Page' : 
                            activeTab === 'tech-stack' ? 'Technology Stack' :
                            activeTab === 'user-journeys' ? 'User Journey' :
                            'Documentation' },
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
                  toast({
                    title: 'Info',
                    description: 'Use the Save button inside the visual tools to save your changes.'
                  });
                }}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Plan'}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}