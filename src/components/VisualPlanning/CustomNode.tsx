
import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

interface CustomNodeProps {
  data: { label: string };
  isConnectable?: boolean;
  selected?: boolean;
}

export default memo(({ data, isConnectable, selected }: CustomNodeProps) => {
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
