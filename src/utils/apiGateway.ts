
import { supabase } from '@/integrations/supabase/client';

/**
 * Call the Supabase Edge Function API Gateway
 * @param action The API action to perform
 * @param payload Any data needed for the action
 */
export async function callApiGateway(action: string, payload: any = {}) {
  try {
    const { data, error } = await supabase.functions.invoke('api-gateway', {
      body: { action, payload },
    });

    if (error) {
      console.error('Error calling API Gateway:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to call API Gateway:', error);
    throw error;
  }
}
