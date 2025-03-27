
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from '../api-gateway/utils/supabase.ts';

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
    const { userId, entityType, entityId, activityType, details } = await req.json();

    // Validate required fields
    if (!userId || !entityType || !entityId || !activityType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Insert activity record
    const { data, error } = await supabase
      .from('user_activity')
      .insert({
        user_id: userId,
        entity_type: entityType,
        entity_id: entityId,
        activity_type: activityType,
        details: details || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error tracking activity:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, activity: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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
