
export type User = {
  id: string;
  email: string;
  subscription_tier: 'free' | 'basic' | 'premium';
  credits_remaining: number;
  credits_reset_date: string;
  created_at: string;
  full_name?: string;
  bio?: string;
  expertise?: string[];
  interests?: string[];
  industry?: string;
  company?: string;
  position?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  avatar_url?: string;
  preferences?: Record<string, any>;
  notification_settings?: {
    email?: boolean;
    push?: boolean;
  };
};

export type Project = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  stage: 'ideation' | 'planning' | 'development' | 'launched';
  created_at: string;
  updated_at: string;
  is_collaborative?: boolean;
  collaborators?: string[];
  collaboration_settings?: {
    permissions: 'view' | 'comment' | 'edit';
  };
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
  status: 'draft' | 'developing' | 'ready' | 'archived';
  tags: string[];
  inspiration_sources: Record<string, any>;
  collaboration_settings: {
    visibility: 'private' | 'team' | 'public';
  };
  version: number;
  version_history: Record<string, any>[];
};

export type IdeaCategory = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
};

export type IdeaCategoryLink = {
  id: string;
  idea_id: string;
  category_id: string;
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

export type Comment = {
  id: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  created_by: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date: string | null;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
};

export type UserActivity = {
  id: string;
  user_id: string;
  activity_type: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, any>;
  created_at: string;
};
