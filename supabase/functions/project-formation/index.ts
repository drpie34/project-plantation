
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idea, research, userTier } = await req.json();
    
    // Validate required parameters
    if (!idea && !research) {
      return new Response(
        JSON.stringify({ error: 'At least one of idea or research must be provided' }),
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
    
    // Prepare prompt content based on available data
    let promptContent = "Suggest a project plan based on the following information:\n\n";
    
    if (idea) {
      promptContent += `## Idea\nTitle: ${idea.title}\nDescription: ${idea.description || 'No description provided'}\n\n`;
      if (idea.problem_solved) {
        promptContent += `Problem Solved: ${idea.problem_solved}\n\n`;
      }
      if (idea.target_audience) {
        promptContent += `Target Audience: ${idea.target_audience}\n\n`;
      }
      if (idea.tags && idea.tags.length > 0) {
        promptContent += `Tags: ${idea.tags.join(', ')}\n\n`;
      }
    }
    
    if (research) {
      promptContent += `## Market Research\n${research.ai_analysis || research.content || 'No analysis provided'}\n\n`;
    }
    
    promptContent += "Please suggest a project name, description, goals, and key features that would make this a successful SaaS application. Format your response with clear sections for each of these elements.";
    
    // Choose the model based on user's subscription tier
    const model = userTier === 'premium' ? 'gpt-4o' : 'gpt-4o-mini';
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are an expert SaaS consultant who helps entrepreneurs structure their ideas into viable projects. Provide structured, actionable project plans with clear goals and features."
          },
          {
            role: "user",
            content: promptContent
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error calling OpenAI API');
    }
    
    // Return the result
    return new Response(
      JSON.stringify({
        success: true,
        content: data.choices[0].message.content,
        usage: {
          inputTokens: data.usage.prompt_tokens,
          outputTokens: data.usage.completion_tokens,
          model: model,
          api: "openai"
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error) {
    console.error('Error in project formation function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
