
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

/**
 * Track user activity
 * @param userId The user ID
 * @param activityType Type of activity (created, updated, deleted, etc.)
 * @param entityType Type of entity (project, idea, task, etc.)
 * @param entityId ID of the entity
 * @param details Optional details about the activity
 */
export async function trackActivity(
  userId: string,
  activityType: string,
  entityType: string,
  entityId: string,
  details: Record<string, any> = {}
): Promise<void> {
  try {
    await supabase.functions.invoke('track-activity', {
      body: {
        user_id: userId,
        activity_type: activityType,
        entity_type: entityType,
        entity_id: entityId,
        details
      },
    });
  } catch (error) {
    console.error('Failed to track activity:', error);
    // Don't throw - activity tracking should not block main functionality
  }
}
