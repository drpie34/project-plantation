
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
    console.log('Market research function called with:', JSON.stringify(reqBody));
    const { userId, projectId, query, source = 'custom' } = reqBody;
    
    if (!userId || !projectId || !query) {
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
    
    // Create system prompt for market research
    const systemPrompt = `You are a market research specialist analyzing SaaS opportunities. 
    Provide data-driven insights with a focus on:
    1. Market size and growth potential
    2. Target customer segments and their pain points
    3. Competitive landscape and gaps
    4. Pricing models and revenue opportunities
    5. Technical feasibility and implementation challenges
    
    Format your response in clear sections with headings.`;
    
    // Call the AI Router edge function
    console.log('Calling AI router with content:', query);
    const aiResponse = await fetch(`${supabaseUrl}/functions/v1/ai-router`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        task: 'marketResearch',
        content: query,
        userTier: user.subscription_tier,
        options: { systemPrompt }
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
            webSearch: result.usage.webSearch || false,
            extendedThinking: result.usage.extendedThinking || false
          })
        });
    } catch (logError) {
      console.error('Error logging API usage:', logError);
      // Continue execution even if logging fails
    }
    
    // Store the research data
    try {
      const { data: researchData, error: researchError } = await supabase
        .from('market_research')
        .insert({
          project_id: projectId,
          source,
          search_query: query,
          ai_analysis: result.content,
          model_used: result.usage.model,
          raw_data: {
            usage: result.usage,
            model: result.usage.model,
            webSearch: result.usage.webSearch
          }
        })
        .select()
        .single();
      
      if (researchError) {
        console.error('Error storing research data:', researchError);
        // Return success but with a warning
        return new Response(
          JSON.stringify({ 
            success: true, 
            warning: 'Research was generated but could not be stored',
            research: {
              id: 'temp-id',
              ai_analysis: result.content,
              model_used: result.usage.model,
              raw_data: {
                webSearch: result.usage.webSearch || false,
                model: result.usage.model,
                usage: result.usage
              }
            },
            credits_remaining: updatedUser.credits_remaining
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          research: researchData,
          credits_remaining: updatedUser.credits_remaining
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } catch (storeError) {
      console.error('Error when trying to store research data:', storeError);
      // Return success but with a warning
      return new Response(
        JSON.stringify({ 
          success: true, 
          warning: 'Research was generated but could not be stored',
          research: {
            id: 'temp-id',
            ai_analysis: result.content,
            model_used: result.usage.model,
            raw_data: {
              webSearch: result.usage.webSearch || false,
              model: result.usage.model,
              usage: result.usage
            }
          },
          credits_remaining: updatedUser.credits_remaining
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
  } catch (error) {
    console.error('Error conducting market research:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error conducting market research' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
