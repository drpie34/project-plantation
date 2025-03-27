
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

// Get Supabase URL and Service Role Key from environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Create a new Supabase client with the Service Role Key for admin access
export const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey || supabaseAnonKey
);
