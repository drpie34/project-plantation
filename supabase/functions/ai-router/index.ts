
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Get environment variables
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Task types
const TASK_TYPES = {
  IDEA_GENERATION: 'ideaGeneration',
  MARKET_RESEARCH: 'marketResearch',
  DOCUMENT_ANALYSIS: 'documentAnalysis',
  PROJECT_PLANNING: 'projectPlanning',
  CODE_ANALYSIS: 'codeAnalysis',
  BASIC_CHAT: 'basicChat'
};

// Determine the best API route based on task type, content, and user tier
function determineAPIRoute(task: string, content: string, userTier: string) {
  console.log(`Determining route for task: ${task}, tier: ${userTier}`);
  
  // Market research tasks require web search
  if (task === TASK_TYPES.MARKET_RESEARCH) {
    // Try GPT-4o-mini for search implementation for paid tiers
    if (userTier === 'premium' || userTier === 'basic') {
      return { api: 'openai-gpt4o-mini', model: 'gpt-4o-mini', webSearch: true };
    } else {
      // Free users get basic GPT-4o-mini
      return { api: 'openai-gpt4o-mini', model: 'gpt-4o-mini' };
    }
  }
  
  // Document analysis tasks benefit from Claude's large context window
  if (task === TASK_TYPES.DOCUMENT_ANALYSIS) {
    // Only premium users can use Claude
    if (userTier === 'premium' && ANTHROPIC_API_KEY) {
      return { api: 'claude-standard', model: 'claude-3-sonnet-20240229' };
    } else {
      // Others use GPT-4o-mini
      return { api: 'openai-gpt4o-mini', model: 'gpt-4o-mini' };
    }
  }
  
  // Project planning tasks benefit from Claude's extended thinking
  if (task === TASK_TYPES.PROJECT_PLANNING) {
    if (userTier === 'premium' && ANTHROPIC_API_KEY) {
      return { api: 'claude-standard', model: 'claude-3-sonnet-20240229', extendedThinking: true };
    } else if (userTier === 'basic') {
      return { api: 'openai-gpt4o', model: 'gpt-4o' };
    } else {
      return { api: 'openai-gpt4o-mini', model: 'gpt-4o-mini' };
    }
  }
  
  // Code analysis tasks
  if (task === TASK_TYPES.CODE_ANALYSIS) {
    if (userTier === 'premium' && ANTHROPIC_API_KEY) {
      return { api: 'claude-standard', model: 'claude-3-sonnet-20240229' };
    } else {
      return { api: 'openai-gpt4o-mini', model: 'gpt-4o-mini' };
    }
  }
  
  // Idea generation tasks
  if (task === TASK_TYPES.IDEA_GENERATION) {
    if (userTier === 'premium') {
      return { api: 'openai-gpt4o', model: 'gpt-4o' };
    } else {
      return { api: 'openai-gpt4o-mini', model: 'gpt-4o-mini' };
    }
  }
  
  // Basic chat (default to GPT-4o-mini for all tiers to keep costs low)
  return { api: 'openai-gpt4o-mini', model: 'gpt-4o-mini' };
}

// GPT-4o-mini implementation
async function callOpenAIGPT4oMini(content: string, options: any = {}) {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }
    
    console.log('Calling OpenAI GPT-4o-mini with content:', content.substring(0, 50) + '...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: options.systemPrompt || "You are a helpful AI assistant."
          },
          {
            role: "user",
            content
          }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 800,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error status:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    console.log('GPT-4o-mini response summary:', {
      tokens: data.usage,
      firstWords: data.choices[0].message.content.substring(0, 50) + '...'
    });
    
    return {
      success: true,
      content: data.choices[0].message.content,
      usage: {
        inputTokens: data.usage.prompt_tokens,
        outputTokens: data.usage.completion_tokens,
        model: "gpt-4o-mini",
        api: "openai",
        webSearch: options.webSearch || false
      }
    };
  } catch (error) {
    console.error('Error with OpenAI GPT-4o-mini API:', error);
    throw error;
  }
}

// GPT-4o implementation
async function callOpenAIGPT4o(content: string, options: any = {}) {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }
    
    console.log('Calling OpenAI GPT-4o with content:', content.substring(0, 50) + '...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: options.systemPrompt || "You are a helpful AI assistant."
          },
          {
            role: "user",
            content
          }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error status:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    console.log('GPT-4o response summary:', {
      tokens: data.usage,
      firstWords: data.choices[0].message.content.substring(0, 50) + '...'
    });
    
    return {
      success: true,
      content: data.choices[0].message.content,
      usage: {
        inputTokens: data.usage.prompt_tokens,
        outputTokens: data.usage.completion_tokens,
        model: "gpt-4o",
        api: "openai"
      }
    };
  } catch (error) {
    console.error('Error with OpenAI GPT-4o API:', error);
    throw error;
  }
}

// Claude Standard implementation
async function callClaudeStandard(content: string, options: any = {}) {
  try {
    if (!ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key is not configured');
    }
    
    const extendedThinking = options.extendedThinking || false;
    
    console.log('Calling Claude with content:', content.substring(0, 50) + '...');
    
    const payload: any = {
      model: options.model || "claude-3-sonnet-20240229",
      max_tokens: options.maxTokens || 3000,
      messages: [
        {
          role: "user",
          content: content
        }
      ],
      temperature: options.temperature || 0.7,
      system: options.systemPrompt || "You are a helpful AI assistant."
    };
        
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error status:', response.status, errorText);
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    console.log('Claude response summary:', {
      firstWords: data.content[0].text.substring(0, 50) + '...'
    });
    
    // Estimate token usage since Claude API doesn't return it directly
    const inputTokenEstimate = Math.ceil((content.length + (options.systemPrompt || "").length) / 4);
    const outputTokenEstimate = Math.ceil(data.content[0].text.length / 4);
    
    return {
      success: true,
      content: data.content[0].text,
      usage: {
        inputTokens: inputTokenEstimate,
        outputTokens: outputTokenEstimate,
        thinkingTokens: 0,
        model: options.model || "claude-3-sonnet-20240229",
        api: "claude",
        extendedThinking: extendedThinking
      }
    };
  } catch (error) {
    console.error('Error with Claude API:', error);
    throw error;
  }
}

// Calculate credit cost based on model and token usage
function calculateCreditCost(apiType: string, model: string, inputTokens: number, outputTokens: number, features: any = {}) {
  let baseCost = 0;
  
  // Base costs by model
  if (apiType === 'openai') {
    if (model === 'gpt-4o-mini') {
      // GPT-4o-mini is very cost-effective
      // 15¢ per million input tokens, 60¢ per million output tokens
      // Convert to credits: 1 credit per 1000 input tokens, 4 credits per 1000 output tokens
      baseCost = Math.ceil(inputTokens / 1000) + Math.ceil((outputTokens * 4) / 1000);
    } else if (model === 'gpt-4o') {
      // GPT-4o is more expensive
      baseCost = Math.ceil((inputTokens * 3) / 1000) + Math.ceil((outputTokens * 6) / 1000);
    }
  } else if (apiType === 'claude') {
    if (model.includes('claude-3-sonnet')) {
      // Claude 3 Sonnet
      baseCost = Math.ceil((inputTokens * 3) / 1000) + Math.ceil((outputTokens * 15) / 1000);
      
      // Add cost for extended thinking if used
      if (features.extendedThinking && features.thinkingTokens) {
        baseCost += Math.ceil((features.thinkingTokens * 3) / 1000);
      }
    }
  }
  
  // Additional costs for special features
  if (features.webSearch) {
    baseCost += 3;
  }
  
  // Minimum cost per request
  return Math.max(baseCost, 1);
}

// Main router function
async function routeToOptimalAI(task: string, content: string, userTier: string, options: any = {}) {
  // Determine which API to use based on task type and user tier
  const routingDecision = determineAPIRoute(task, content, userTier);
  
  // Log the routing decision
  console.log(`Routing task ${task} to ${routingDecision.api}:${routingDecision.model}`);
  
  // Route to the appropriate API
  switch (routingDecision.api) {
    case 'openai-gpt4o-mini':
      return callOpenAIGPT4oMini(content, { 
        ...options, 
        webSearch: routingDecision.webSearch 
      });
    case 'openai-gpt4o':
      return callOpenAIGPT4o(content, options);
    case 'claude-standard':
      return callClaudeStandard(content, { 
        ...options, 
        extendedThinking: routingDecision.extendedThinking 
      });
    default:
      // Default to GPT-4o-mini as fallback
      return callOpenAIGPT4oMini(content, options);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const reqBody = await req.json();
    console.log('AI Router received request:', JSON.stringify(reqBody));
    const { task, content, userTier, options } = reqBody;
    
    // Validate required parameters
    if (!task || !content || !userTier) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: task, content, userTier' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Check if we have the necessary API keys
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // For Claude requests, check if the API key is available
    if (task === TASK_TYPES.DOCUMENT_ANALYSIS || task === TASK_TYPES.PROJECT_PLANNING) {
      if (userTier === 'premium' && !ANTHROPIC_API_KEY) {
        return new Response(
          JSON.stringify({ error: 'Anthropic API key is not configured for premium features' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    // Route to the appropriate AI model
    const result = await routeToOptimalAI(task, content, userTier, options);
    
    // Calculate credit cost
    const creditCost = calculateCreditCost(
      result.usage.api, 
      result.usage.model, 
      result.usage.inputTokens, 
      result.usage.outputTokens, 
      { 
        webSearch: result.usage.webSearch,
        extendedThinking: result.usage.extendedThinking,
        thinkingTokens: result.usage.thinkingTokens
      }
    );
    
    // Add credit cost to the result
    result.usage.creditCost = creditCost;
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error) {
    console.error('Error in AI Router:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
