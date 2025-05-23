
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

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
    const reqBody = await req.json();
    console.log('Project planning function called with:', JSON.stringify(reqBody));
    const { userId, projectId, requirements, planningType, modelOverride } = reqBody;
    
    if (!userId || !projectId || !requirements) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create Supabase client using Deno environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verify user information
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('credits_remaining, subscription_tier')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error fetching user data:', userError);
      return new Response(
        JSON.stringify({ error: 'Error fetching user data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Create system prompt based on planning type
    let systemPrompt;
    
    switch (planningType) {
      case 'timeline':
        systemPrompt = `You are a project planning specialist helping with a SaaS project timeline.
        Based on the requirements, create a detailed project plan with:
        1. Key milestones with estimated dates
        2. Dependencies between tasks
        3. Critical path identification
        4. Risk factors and contingencies
        5. Resource allocation recommendations
        
        Format your response with clear sections, bullet points, and a visual timeline if possible.`;
        break;
      
      case 'resources':
        systemPrompt = `You are a resource planning specialist for SaaS projects.
        Based on the requirements, create a detailed resource plan with:
        1. Required team roles and responsibilities
        2. Skills and expertise needed for each phase
        3. Estimated time commitments
        4. Budget considerations and cost estimates
        5. External resources or partnerships needed
        
        Format your response with clear sections and tables.`;
        break;
        
      case 'technical':
        systemPrompt = `You are a technical architect planning a SaaS application.
        Based on the requirements, create a detailed technical architecture with:
        1. System components and their interactions
        2. Technology stack recommendations
        3. Data model considerations
        4. Scalability and performance factors
        5. Security and compliance requirements
        
        Format your response with clear sections and include diagrams in text format if helpful.`;
        break;
        
      default:
        systemPrompt = `You are a project planning specialist helping with a SaaS project.
        Based on the requirements, create a comprehensive project plan that addresses
        timeline, resources, and technical considerations.
        
        Format your response with clear sections and actionable recommendations.`;
    }
    
    // Call the AI Router edge function
    console.log('Calling AI router for project planning with content:', requirements);
    console.log('Using model override:', modelOverride || 'none specified');
    
    const aiResponse = await fetch(`${supabaseUrl}/functions/v1/ai-router`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        task: 'projectPlanning',
        content: requirements,
        userTier: user.subscription_tier,
        options: { 
          systemPrompt, 
          maxTokens: 4000,
          model: modelOverride || undefined
        }
      })
    });
    
    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Router returned error status:', aiResponse.status, errorText);
      throw new Error(`AI Router error: ${aiResponse.status} - ${errorText}`);
    }
    
    const result = await aiResponse.json();
    
    console.log('AI Router response:', JSON.stringify(result));
    
    const creditCost = result.usage.creditCost;
    
    // Verify user has enough credits
    if (user.credits_remaining < creditCost) {
      return new Response(
        JSON.stringify({ error: 'Not enough credits' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }
    
    // Deduct credits from user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ 
        credits_remaining: Math.max(0, user.credits_remaining - creditCost) 
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating user credits:', updateError);
      return new Response(
        JSON.stringify({ error: 'Error updating user credits' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Log API usage
    try {
      await supabase
        .from('api_usage')
        .insert({
          user_id: userId,
          api_type: result.usage.api,
          model_used: result.usage.model,
          tokens_input: result.usage.inputTokens,
          tokens_output: result.usage.outputTokens,
          tokens_thinking: result.usage.thinkingTokens || 0,
          credits_used: creditCost,
          features_used: JSON.stringify({
            extendedThinking: result.usage.extendedThinking || false
          })
        });
    } catch (logError) {
      console.error('Error logging API usage:', logError);
      // Continue execution even if logging fails
    }
    
    // Convert content to HTML for better formatting
    const formattedContent = convertMarkdownToHtml(result.content);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        plan: {
          content: formattedContent,
          model: result.usage.model,
          thinking: result.thinking || null,
          extendedThinking: result.usage.extendedThinking || false
        },
        credits_remaining: updatedUser.credits_remaining
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error) {
    console.error('Error generating project plan:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error generating project plan' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Simple markdown to HTML converter for basic formatting
function convertMarkdownToHtml(markdown: string): string {
  let html = markdown;
  
  // Replace headings
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  
  // Replace bold text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Replace italic text
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Replace lists
  html = html.replace(/^\s*\d+\.\s+(.*$)/gm, '<li>$1</li>');
  html = html.replace(/^\s*-\s+(.*$)/gm, '<li>$1</li>');
  html = html.replace(/<\/li>\n<li>/g, '</li><li>');
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  
  // Replace paragraphs
  html = html.replace(/^(?!<[a-z])(.*$)/gm, '<p>$1</p>');
  
  // Replace line breaks
  html = html.replace(/\n/g, '');
  
  return html;
}
