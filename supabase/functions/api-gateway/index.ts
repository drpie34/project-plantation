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
    
    switch (action) {
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
