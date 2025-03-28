
import { supabase } from '@/integrations/supabase/client';
import { isUsingMockData, getMockResponse } from './mockAiResponses';

// Define the shape of an API log entry
export interface ApiLogEntry {
  id: string;
  timestamp: Date;
  action: string;
  model?: string;
  api?: string;
  requestPayload: any;
  response?: any;
  error?: any;
  isMock?: boolean;
  duration?: number;
  tokens?: {
    input?: number;
    output?: number;
    total?: number;
  };
}

// Create a store for the API logs
class ApiLogStore {
  private logs: ApiLogEntry[] = [];
  private listeners: Set<() => void> = new Set();
  private isEnabled = false;
  private maxLogs = 100;
  
  constructor() {
    // Try to load state from localStorage if available
    try {
      const savedState = localStorage.getItem('aiApiLoggerState');
      if (savedState) {
        const { isEnabled } = JSON.parse(savedState);
        this.isEnabled = isEnabled;
      }
    } catch (e) {
      console.error('Error loading API logger state:', e);
    }
  }
  
  enableLogging(enable: boolean) {
    this.isEnabled = enable;
    // Save state to localStorage
    try {
      localStorage.setItem('aiApiLoggerState', JSON.stringify({ isEnabled: enable }));
    } catch (e) {
      console.error('Error saving API logger state:', e);
    }
    this.notifyListeners();
  }
  
  isLoggingEnabled() {
    return this.isEnabled;
  }
  
  getLogs() {
    return [...this.logs];
  }
  
  clearLogs() {
    this.logs = [];
    this.notifyListeners();
  }
  
  addLog(log: ApiLogEntry) {
    if (!this.isEnabled) return;
    
    // Add log to the beginning for reverse chronological order
    this.logs.unshift(log);
    
    // Trim logs if they exceed maximum
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
    
    this.notifyListeners();
  }
  
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

// Create a singleton instance of the store
export const apiLogStore = new ApiLogStore();

/**
 * Call the Supabase Edge Function API Gateway
 * @param action The API action to perform
 * @param payload Any data needed for the action
 * @returns The response data from the API Gateway
 */
export async function callApiGateway<T = any>(action: string, payload: any = {}): Promise<T> {
  // Check if we should use mock data
  if (isUsingMockData()) {
    return getMockResponse(action, payload) as Promise<T>;
  }
  
  // Generate a unique ID for this API call
  const logId = `api-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const startTime = Date.now();
  
  // Create an initial log entry
  const logEntry: ApiLogEntry = {
    id: logId,
    timestamp: new Date(),
    action,
    requestPayload: payload,
  };
  
  // If logging is enabled, add the initial log entry
  if (apiLogStore.isLoggingEnabled()) {
    apiLogStore.addLog(logEntry);
  }
  
  try {
    // Call the actual API
    const { data, error } = await supabase.functions.invoke('api-gateway', {
      body: { action, payload },
    });

    if (error) {
      console.error('Error calling API Gateway:', error);
      
      // Update log with error information
      if (apiLogStore.isLoggingEnabled()) {
        apiLogStore.addLog({
          ...logEntry,
          error,
          duration: Date.now() - startTime
        });
      }
      
      throw error;
    }
    
    // Update log with response information
    if (apiLogStore.isLoggingEnabled()) {
      // Extract API and model information if available
      const model = data?.usage?.model;
      const api = data?.usage?.api;
      const inputTokens = data?.usage?.inputTokens;
      const outputTokens = data?.usage?.outputTokens;
      
      apiLogStore.addLog({
        ...logEntry,
        response: data,
        duration: Date.now() - startTime,
        model,
        api,
        tokens: {
          input: inputTokens,
          output: outputTokens,
          total: inputTokens && outputTokens ? inputTokens + outputTokens : undefined
        }
      });
    }

    return data as T;
  } catch (error) {
    console.error('Failed to call API Gateway:', error);
    
    // Make sure error is logged if not already
    if (apiLogStore.isLoggingEnabled() && !logEntry.error) {
      apiLogStore.addLog({
        ...logEntry,
        error,
        duration: Date.now() - startTime
      });
    }
    
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
