
import React from 'react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface Features {
  extendedThinking?: boolean;
  webSearch?: boolean;
}

interface AIModelIndicatorProps {
  model: string;
  features?: Features;
}

export function AIModelIndicator({ model, features = {} }: AIModelIndicatorProps) {
  const getModelInfo = () => {
    switch (model) {
      case 'gpt-4o-mini':
        return features?.webSearch ? {
          name: 'GPT-4o Mini + Search',
          description: 'OpenAI\'s efficient GPT-4o-mini model with web search capabilities',
          color: 'bg-purple-600'
        } : {
          name: 'GPT-4o Mini',
          description: 'OpenAI\'s efficient GPT-4o-mini model',
          color: 'bg-green-600'
        };
      case 'gpt-4o':
        return {
          name: 'GPT-4o',
          description: 'OpenAI\'s advanced GPT-4o model',
          color: 'bg-blue-600'
        };
      case 'claude-3-sonnet-20240229':
        return {
          name: features?.extendedThinking ? 'Claude 3 Sonnet + ET' : 'Claude 3 Sonnet',
          description: features?.extendedThinking 
            ? 'Anthropic\'s Claude 3 Sonnet with extended thinking capabilities' 
            : 'Anthropic\'s Claude 3 Sonnet with large context window',
          color: features?.extendedThinking ? 'bg-pink-600' : 'bg-orange-600'
        };
      default:
        return {
          name: 'AI Model',
          description: model || 'Unknown AI model',
          color: 'bg-gray-600'
        };
    }
  };
  
  const modelInfo = getModelInfo();
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className={`px-2 py-1 rounded-md text-white text-xs font-medium ${modelInfo.color}`}>
            {modelInfo.name}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{modelInfo.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
