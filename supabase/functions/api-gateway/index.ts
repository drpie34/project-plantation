
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    // Example of accessing environment variables (secrets)
    const apiKeys = {
      openai: Deno.env.get('OPENAI_API_KEY'),
      stripe: Deno.env.get('STRIPE_SECRET_KEY'),
    };

    // Just return what keys are configured (don't expose actual keys)
    const configuredKeys = Object.entries(apiKeys).reduce((acc, [service, key]) => {
      acc[service] = key ? 'configured' : 'not configured';
      return acc;
    }, {});

    console.log(`API Gateway called with action: ${action}`);
    
    // In a real implementation, you would use the apiKeys to make requests
    // to the corresponding services based on the action and payload
    
    return new Response(
      JSON.stringify({
        message: 'API Gateway is set up successfully',
        configuredKeys,
        receivedAction: action,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in API Gateway:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
