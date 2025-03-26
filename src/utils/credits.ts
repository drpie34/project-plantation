
import { supabase } from '@/integrations/supabase/client';

// Calculate credit cost based on model and token usage
export function calculateCreditCost(
  apiType: string, 
  model: string, 
  inputTokens: number, 
  outputTokens: number, 
  features: {
    webSearch?: boolean;
    extendedThinking?: boolean;
    thinkingTokens?: number;
  } = {}
) {
  let baseCost = 0;
  
  // Base costs by model
  if (apiType === 'openai') {
    if (model === 'gpt-4o-mini') {
      // GPT-4o-mini is very cost-effective
      // 15¢ per million input tokens, 60¢ per million output tokens
      // Convert to credits: 1 credit per 1000 input tokens, 4 credits per 1000 output tokens
      baseCost = Math.ceil(inputTokens / 1000) + Math.ceil((outputTokens * 4) / 1000);
    } else if (model === 'gpt-4o') {
      // GPT-4o is more expensive
      baseCost = Math.ceil((inputTokens * 3) / 1000) + Math.ceil((outputTokens * 6) / 1000);
    }
  } else if (apiType === 'claude') {
    if (model.includes('claude-3-sonnet')) {
      // Claude 3 Sonnet
      baseCost = Math.ceil((inputTokens * 3) / 1000) + Math.ceil((outputTokens * 15) / 1000);
      
      // Add cost for extended thinking if used
      if (features.extendedThinking && features.thinkingTokens) {
        baseCost += Math.ceil((features.thinkingTokens * 3) / 1000);
      }
    }
  }
  
  // Additional costs for special features
  if (features.webSearch) {
    baseCost += 3;
  }
  
  // Minimum cost per request
  return Math.max(baseCost, 1);
}

// Deduct credits from user account
export async function deductCredits(userId: string, creditCost: number) {
  const { data, error } = await supabase
    .from('users')
    .select('credits_remaining')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user credits:', error);
    throw new Error('Error fetching user credits');
  }
  
  const newCreditBalance = Math.max(0, data.credits_remaining - creditCost);
  
  const { error: updateError } = await supabase
    .from('users')
    .update({ credits_remaining: newCreditBalance })
    .eq('id', userId);
  
  if (updateError) {
    console.error('Error updating user credits:', updateError);
    throw new Error('Error updating user credits');
  }
  
  return newCreditBalance;
}

// Log credit usage with additional features
export async function logCreditUsage(
  userId: string, 
  apiType: string, 
  model: string, 
  inputTokens: number, 
  outputTokens: number, 
  creditCost: number, 
  features: {
    webSearch?: boolean;
    extendedThinking?: boolean;
    thinkingTokens?: number;
  } = {}
) {
  const { error } = await supabase
    .from('api_usage')
    .insert({
      user_id: userId,
      api_type: apiType,
      model_used: model,
      tokens_input: inputTokens,
      tokens_output: outputTokens,
      tokens_thinking: features.thinkingTokens || 0,
      credits_used: creditCost,
      features_used: {
        webSearch: features.webSearch || false,
        extendedThinking: features.extendedThinking || false,
      }
    });
  
  if (error) {
    console.error('Error logging credit usage:', error);
    // Non-blocking error - we don't want to fail the main operation
  }
}

// Check if user has enough credits
export async function checkCredits(userId: string, estimatedCost: number) {
  const { data, error } = await supabase
    .from('users')
    .select('credits_remaining, subscription_tier')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error checking user credits:', error);
    throw new Error('Error checking user credits');
  }
  
  return {
    hasEnoughCredits: data.credits_remaining >= estimatedCost,
    creditsRemaining: data.credits_remaining,
    subscriptionTier: data.subscription_tier
  };
}
