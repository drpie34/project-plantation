
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
    const { userId, projectId, contentType, title, content } = await req.json();
    
    // Basic validation
    if (!userId || !projectId || !contentType || !title || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Save the marketing copy to the database
    const { data, error } = await supabase
      .from('marketing_copies')
      .insert({
        user_id: userId,
        project_id: projectId,
        content_type: contentType,
        title: title,
        content: content.text,
        model_used: content.model,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error saving marketing copy: ${error.message}`);
    }
    
    // Update credit usage
    const { error: usageError } = await supabase
      .from('api_usage')
      .insert({
        user_id: userId,
        api_type: "openai",
        model_used: content.usage.model,
        tokens_input: content.usage.inputTokens,
        tokens_output: content.usage.outputTokens,
        credits_used: Math.ceil(
          (content.usage.inputTokens / 1000) + 
          (content.usage.outputTokens / 1000) * 
          (content.usage.model === 'gpt-4o' ? 6 : 4)
        )
      });
    
    if (usageError) {
      console.error('Error logging API usage:', usageError);
      // Non-blocking error - we don't want to fail the main operation
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        savedCopy: data 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error) {
    console.error('Error in save-marketing-copy function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
