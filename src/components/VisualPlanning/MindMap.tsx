import { useState } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  Connection,
  Edge,
  Node,
  EdgeChange,
  NodeChange,
  NodeTypes
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

import CustomNode from './CustomNode';

// Define node types with proper typing
const nodeTypes: NodeTypes = {
  custom: CustomNode
};

interface MindMapProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (data: { nodes: Node[]; edges: Edge[] }) => void;
  readOnly?: boolean;
}

export default function MindMap({ 
  initialNodes = [], 
  initialEdges = [], 
  onSave,
  readOnly = false
}: MindMapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newNodeText, setNewNodeText] = useState('');
  
  // Handle connections
  const onConnect = (params: Connection) => {
    setEdges((eds) => addEdge({ ...params, animated: false }, eds));
  };
  
  // Handle node selection
  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };
  
  // Handle adding a child node
  const addChildNode = () => {
    if (!selectedNode || !newNodeText) return;
    
    // Create a new node
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'custom',
      data: { label: newNodeText },
      position: {
        x: selectedNode.position.x + 200,
        y: selectedNode.position.y + Math.random() * 100 - 50
      }
    };
    
    // Create an edge from the selected node to the new node
    const newEdge: Edge = {
      id: `edge-${selectedNode.id}-${newNode.id}`,
      source: selectedNode.id,
      target: newNode.id
    };
    
    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, newEdge]);
    setNewNodeText('');
    setIsDialogOpen(false);
  };
  
  // Handle saving the mind map
  const handleSave = () => {
    if (onSave) {
      onSave({ nodes, edges });
    }
  };
  
  return (
    <div className="w-full h-[600px] border rounded-md">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
      >
        <Background />
        <Controls />
        <MiniMap />
        
        {!readOnly && (
          <Panel position="top-right" className="bg-white p-2 rounded-md shadow-md">
            <div className="flex flex-col gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    disabled={!selectedNode}
                    title={selectedNode ? "Add child node" : "Select a node first"}
                  >
                    Add Child
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Child Node</DialogTitle>
                    <DialogDescription>
                      Enter the text for the new node
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    value={newNodeText}
                    onChange={(e) => setNewNodeText(e.target.value)}
                    placeholder="Node text"
                  />
                  <DialogFooter>
                    <Button onClick={addChildNode} disabled={!newNodeText}>
                      Add
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
