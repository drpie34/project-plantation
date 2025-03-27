
import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

// Instead of extending NodeProps directly, we'll create a custom interface
// that uses NodeProps properties along with our custom properties
interface CustomNodeData {
  label: string;
}

// Using the NodeProps generic type to specify our data shape
const CustomNode = memo(({ data, isConnectable, selected }: NodeProps<CustomNodeData>) => {
  return (
    <div
      className={`px-4 py-2 shadow-md rounded-md bg-white border ${
        selected ? 'border-blue-500' : 'border-gray-200'
      }`}
    >
      <div className="font-medium text-sm">{data.label}</div>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-blue-500"
      />
    </div>
  );
});

export default CustomNode;
