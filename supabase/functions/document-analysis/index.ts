
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
    const { userId, projectId, documentContent, analysisType } = await req.json();
    
    if (!userId || !projectId || !documentContent) {
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
      return new Response(
        JSON.stringify({ error: 'Error fetching user data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Create system prompt based on analysis type
    let systemPrompt;
    
    switch (analysisType) {
      case 'competitive':
        systemPrompt = `You are analyzing a competitive landscape document for a SaaS business. 
        Extract key insights about:
        1. Major competitors and their positioning
        2. Feature comparisons and gaps in the market
        3. Pricing strategies used in this space
        4. Potential differentiation opportunities
        
        Format your analysis with clear sections and actionable insights.`;
        break;
      
      case 'requirements':
        systemPrompt = `You are analyzing a requirements document for a SaaS product. 
        Extract and organize:
        1. Core functional requirements
        2. Technical specifications
        3. User personas and their needs
        4. Implementation challenges
        5. Priority recommendations
        
        Format your analysis with clear sections and actionable next steps.`;
        break;
        
      default:
        systemPrompt = `You are analyzing a document related to a SaaS business. 
        Extract the most relevant insights and provide a structured summary
        with recommendations. Format your analysis with clear sections.`;
    }
    
    // Call the AI Router edge function
    const aiResponse = await fetch(`${supabaseUrl}/functions/v1/ai-router`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        task: 'documentAnalysis',
        content: `Analyze this document in detail: ${documentContent}`,
        userTier: user.subscription_tier,
        options: { systemPrompt, maxTokens: 3000 }
      })
    });
    
    const result = await aiResponse.json();
    
    if (!aiResponse.ok) {
      throw new Error(result.error || 'Error calling AI Router');
    }
    
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
      return new Response(
        JSON.stringify({ error: 'Error updating user credits' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Log API usage
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
    
    // Store the analysis results
    const { data: analysisData, error: analysisError } = await supabase
      .from('market_research')
      .insert({
        project_id: projectId,
        source: 'document',
        search_query: `Document analysis (${analysisType})`,
        ai_analysis: result.content,
        model_used: result.usage.model,
        raw_data: {
          analysisType,
          documentLength: documentContent.length,
          modelInfo: {
            api: result.usage.api,
            model: result.usage.model
          }
        }
      })
      .select()
      .single();
    
    if (analysisError) {
      console.error('Error storing analysis data:', analysisError);
      return new Response(
        JSON.stringify({ error: 'Error storing analysis data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: {
          id: analysisData.id,
          content: result.content,
          model: result.usage.model,
          extendedThinking: result.usage.extendedThinking
        },
        credits_remaining: updatedUser.credits_remaining
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error) {
    console.error('Error analyzing document:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error analyzing document' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
