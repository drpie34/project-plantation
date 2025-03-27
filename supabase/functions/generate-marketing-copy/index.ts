
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
      userTier = 'free' // Default to free tier if not provided
    } = await req.json();
    
    // Basic validation
    if (!userId || !productId || !productName || !description) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: userId, projectId, productName, description' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create the prompt
    let promptContent = `Create marketing copy for a SaaS product with the following details:\n\n`;
    promptContent += `Product Name: ${productName}\n`;
    promptContent += `Description: ${description}\n`;
    
    if (targetAudience) {
      promptContent += `Target Audience: ${targetAudience}\n`;
    }
    
    if (keyFeatures) {
      promptContent += `Key Features & Benefits:\n${keyFeatures}\n`;
    }
    
    // Tonality guidance
    let tonalityDescription = "";
    switch (tonality) {
      case 'professional':
        tonalityDescription = "Use a professional, business-oriented tone that emphasizes reliability and expertise.";
        break;
      case 'friendly':
        tonalityDescription = "Use a friendly, conversational tone that is approachable and welcoming.";
        break;
      case 'technical':
        tonalityDescription = "Use a technical tone that highlights detailed specifications and advanced features.";
        break;
      case 'creative':
        tonalityDescription = "Use a creative, bold tone that stands out with innovative language and fresh metaphors.";
        break;
      case 'minimal':
        tonalityDescription = "Use a minimalist tone that is concise, direct, and focuses on essential information only.";
        break;
      default:
        tonalityDescription = "Use a professional, business-oriented tone.";
    }
    
    promptContent += `\nTone of Voice: ${tonalityDescription}\n\n`;
    
    // Content type specifications
    switch (contentType) {
      case 'landing':
        promptContent += "Generate compelling landing page copy including: headline, subheadline, value proposition, call-to-action, and key benefit sections.";
        break;
      case 'email':
        promptContent += "Generate an email campaign sequence with subject lines and body content for: introduction email, feature highlight, testimonial/case study, and call-to-action email.";
        break;
      case 'social':
        promptContent += "Generate a set of 5 social media posts that promote different aspects of the product. Each post should be concise, engaging, and include relevant hashtags.";
        break;
      case 'ads':
        promptContent += "Generate a set of 5 ad copy variations with attention-grabbing headlines and compelling descriptions suitable for digital advertising platforms.";
        break;
      default:
        promptContent += "Generate compelling marketing copy that highlights the value proposition and key benefits.";
    }
    
    // Choose the model based on user tier
    const model = userTier === 'premium' ? 'gpt-4o' : 'gpt-4o-mini';
    const maxTokens = userTier === 'premium' ? 2000 : 1000;
    
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
            content: "You are an expert marketing copywriter specializing in SaaS and technology products. Create compelling, conversion-oriented copy that speaks directly to the target audience and highlights the product's value proposition."
          },
          {
            role: "user",
            content: promptContent
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
            model: model,
            api: "openai"
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
