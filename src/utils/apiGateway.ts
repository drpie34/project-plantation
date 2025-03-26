
import { supabase } from '@/integrations/supabase/client';

/**
 * Call the Supabase Edge Function API Gateway
 * @param action The API action to perform
 * @param payload Any data needed for the action
 * @returns The response data from the API Gateway
 */
export async function callApiGateway<T = any>(action: string, payload: any = {}): Promise<T> {
  try {
    const { data, error } = await supabase.functions.invoke('api-gateway', {
      body: { action, payload },
    });

    if (error) {
      console.error('Error calling API Gateway:', error);
      throw error;
    }

    return data as T;
  } catch (error) {
    console.error('Failed to call API Gateway:', error);
    throw error;
  }
}
