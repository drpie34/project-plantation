
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
    const { 
      userId, 
      projectId, 
      productName, 
      description, 
      targetAudience,
      keyFeatures,
      tonality,
      contentType,
      userTier 
    } = await req.json();
    
    // Validate required parameters
    if (!userId || !projectId || !productName || !description || !contentType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
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
    
    // Prepare prompt based on content type
    let systemPrompt = "You are an expert marketing copywriter specializing in SaaS products. Write compelling, persuasive copy that highlights the product's value proposition and appeals to the target audience.";
    
    let contentPrompt = `Please write ${getContentTypeDescription(contentType)} for a SaaS product with the following details:\n\n`;
    contentPrompt += `Product Name: ${productName}\n`;
    contentPrompt += `Description: ${description}\n`;
    
    if (targetAudience) {
      contentPrompt += `Target Audience: ${targetAudience}\n`;
    }
    
    if (keyFeatures) {
      contentPrompt += `Key Features and Benefits:\n`;
      keyFeatures.split('\n').forEach(feature => {
        if (feature.trim()) {
          contentPrompt += `- ${feature.trim()}\n`;
        }
      });
    }
    
    contentPrompt += `\nTone: ${getTonalityDescription(tonality)}\n\n`;
    
    // Add specific instructions based on content type
    contentPrompt += getContentTypeInstructions(contentType);
    
    // Choose the model based on user's subscription tier
    const model = userTier === 'premium' ? 'gpt-4o' : 
                 userTier === 'basic' ? 'gpt-4o' : 'gpt-4o-mini';
    
    // Maximum tokens based on tier
    const maxTokens = userTier === 'premium' ? 2500 : 
                     userTier === 'basic' ? 1800 : 1200;
    
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
            content: systemPrompt
          },
          {
            role: "user",
            content: contentPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
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
        content: {
          text: data.choices[0].message.content,
          model: model,
          usage: {
            inputTokens: data.usage.prompt_tokens,
            outputTokens: data.usage.completion_tokens,
            model: model
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error) {
    console.error('Error in generate-marketing-copy function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Helper functions for prompt generation
function getContentTypeDescription(contentType: string): string {
  switch(contentType) {
    case 'landing':
      return 'landing page copy';
    case 'email':
      return 'email campaign copy';
    case 'social':
      return 'social media posts';
    case 'ads':
      return 'advertising copy';
    default:
      return 'marketing copy';
  }
}

function getTonalityDescription(tonality: string): string {
  switch(tonality) {
    case 'professional':
      return 'Professional and authoritative';
    case 'friendly':
      return 'Friendly and approachable';
    case 'technical':
      return 'Technical and detailed';
    case 'creative':
      return 'Creative and bold';
    case 'minimal':
      return 'Minimalist and straightforward';
    default:
      return 'Professional';
  }
}

function getContentTypeInstructions(contentType: string): string {
  switch(contentType) {
    case 'landing':
      return 'Create landing page copy with a compelling headline, subheadline, key benefits section, feature descriptions, and a strong call to action. Format the content with clear section headings.';
    case 'email':
      return 'Create an email campaign with a subject line, greeting, body content highlighting key benefits, and a clear call to action. The email should be concise but persuasive.';
    case 'social':
      return 'Create a set of 5 social media posts (200 characters or less each) that highlight different aspects of the product. Each post should have a clear message and call to action.';
    case 'ads':
      return 'Create a set of 3-5 short ad copies (50-100 characters each) for digital advertising. Include headline variations and compelling value propositions.';
    default:
      return 'Create comprehensive marketing copy that highlights the product\'s value proposition, key features, and benefits.';
  }
}
