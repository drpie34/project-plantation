
export type User = {
  id: string;
  email: string;
  subscription_tier: 'free' | 'basic' | 'premium';
  credits_remaining: number;
  credits_reset_date: string;
  created_at: string;
};

export type Project = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  stage: 'ideation' | 'planning' | 'development' | 'launched';
  created_at: string;
  updated_at: string;
};

export type Idea = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  target_audience: string | null;
  problem_solved: string | null;
  ai_generated_data: any;
  created_at: string;
};

export type ApiUsage = {
  id: string;
  user_id: string;
  api_type: string;
  model_used: string;
  tokens_input: number;
  tokens_output: number;
  tokens_thinking?: number;
  credits_used: number;
  timestamp: string;
  features_used?: {
    webSearch?: boolean;
    extendedThinking?: boolean;
  };
};
