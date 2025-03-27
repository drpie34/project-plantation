
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

import { supabase } from './utils/supabase.ts';

// Get environment variables
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');

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
    const { action, payload } = await req.json();
    
    console.log(`API Gateway called with action: ${action}`);
    
    switch (action) {
      case 'check-status':
        // Return the status of configured API keys
        return new Response(
          JSON.stringify({
            message: 'API Gateway is operational',
            configuredKeys: {
              'OpenAI': OPENAI_API_KEY ? 'configured' : 'not configured',
              'Anthropic': ANTHROPIC_API_KEY ? 'configured' : 'not configured',
              'Stripe': STRIPE_SECRET_KEY ? 'configured' : 'not configured'
            },
            receivedAction: action
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
        
      case 'check-ai-router':
        console.log('Calling AI router with payload:', JSON.stringify(payload));
        // Call the AI router function and return the result
        const aiRouterResponse = await supabase.functions.invoke('ai-router', {
          body: {
            task: payload.task || 'basicChat',
            content: payload.content || 'Hello, AI Router!',
            userTier: payload.userTier || 'free',
            options: payload.options || {}
          }
        });
        
        if (aiRouterResponse.error) {
          console.error('Error calling AI Router:', aiRouterResponse.error);
          throw new Error(aiRouterResponse.error.message || 'Error connecting to AI Router');
        }
        
        return new Response(
          JSON.stringify(aiRouterResponse.data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      
      case 'getCredits':
        // Get the user ID from the payload
        const userId = payload.userId;

        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'Missing user ID' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        // Fetch the user's credits from the database
        const { data: creditsData, error: creditsError } = await supabase
          .from('users')
          .select('credits_remaining')
          .eq('id', userId)
          .single();

        if (creditsError) {
          console.error('Error fetching credits:', creditsError);
          throw new Error(creditsError.message);
        }

        // Return the credits
        return new Response(
          JSON.stringify({ credits: creditsData.credits_remaining }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      
      // Add a new case for project formation
      case 'generateProjectSuggestion':
        // Call the project-formation function
        const projectSuggestionResponse = await supabase.functions.invoke('project-formation', {
          body: {
            idea: payload.idea,
            research: payload.research,
            userTier: payload.userTier
          }
        });
        
        if (projectSuggestionResponse.error) {
          throw new Error(projectSuggestionResponse.error.message || 'Error generating project suggestion');
        }
        
        return new Response(
          JSON.stringify(projectSuggestionResponse.data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      
      // Marketing copy generation
      case 'generateMarketingCopy':
        // Get user tier
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('subscription_tier')
          .eq('id', payload.userId)
          .single();
          
        if (userError) {
          throw new Error(`Error fetching user data: ${userError.message}`);
        }
        
        // Call the generate-marketing-copy function
        const marketingCopyResponse = await supabase.functions.invoke('generate-marketing-copy', {
          body: {
            ...payload,
            userTier: userData.subscription_tier
          }
        });
        
        if (marketingCopyResponse.error) {
          throw new Error(marketingCopyResponse.error.message || 'Error generating marketing copy');
        }
        
        return new Response(
          JSON.stringify(marketingCopyResponse.data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      
      case 'saveMarketingCopy':
        // Call the save-marketing-copy function
        const saveCopyResponse = await supabase.functions.invoke('save-marketing-copy', {
          body: payload
        });
        
        if (saveCopyResponse.error) {
          throw new Error(saveCopyResponse.error.message || 'Error saving marketing copy');
        }
        
        return new Response(
          JSON.stringify(saveCopyResponse.data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      
      // Activity tracking
      case 'trackActivity':
        // Call the track-activity function
        const activityResponse = await supabase.functions.invoke('track-activity', {
          body: payload
        });
        
        if (activityResponse.error) {
          throw new Error(activityResponse.error.message || 'Error tracking activity');
        }
        
        return new Response(
          JSON.stringify(activityResponse.data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('API Gateway error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
