export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_usage: {
        Row: {
          api_type: string
          credits_used: number
          id: string
          model_used: string
          timestamp: string
          tokens_input: number
          tokens_output: number
          user_id: string
        }
        Insert: {
          api_type: string
          credits_used: number
          id?: string
          model_used: string
          timestamp?: string
          tokens_input: number
          tokens_output: number
          user_id: string
        }
        Update: {
          api_type?: string
          credits_used?: number
          id?: string
          model_used?: string
          timestamp?: string
          tokens_input?: number
          tokens_output?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_categories: {
        Row: {
          color: string
          created_at: string
          description: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      idea_category_links: {
        Row: {
          category_id: string
          created_at: string
          id: string
          idea_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          idea_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          idea_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_category_links_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "idea_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_category_links_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          ai_generated_data: Json | null
          collaboration_settings: Json | null
          created_at: string
          description: string | null
          id: string
          inspiration_sources: Json | null
          problem_solved: string | null
          project_id: string
          status: string
          tags: string[] | null
          target_audience: string | null
          title: string
          version: number
          version_history: Json[] | null
        }
        Insert: {
          ai_generated_data?: Json | null
          collaboration_settings?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          inspiration_sources?: Json | null
          problem_solved?: string | null
          project_id: string
          status?: string
          tags?: string[] | null
          target_audience?: string | null
          title: string
          version?: number
          version_history?: Json[] | null
        }
        Update: {
          ai_generated_data?: Json | null
          collaboration_settings?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          inspiration_sources?: Json | null
          problem_solved?: string | null
          project_id?: string
          status?: string
          tags?: string[] | null
          target_audience?: string | null
          title?: string
          version?: number
          version_history?: Json[] | null
        }
        Relationships: [
          {
            foreignKeyName: "ideas_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          stage: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          stage?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          stage?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          credits_remaining: number
          credits_reset_date: string
          email: string
          id: string
          subscription_tier: string
        }
        Insert: {
          created_at?: string
          credits_remaining?: number
          credits_reset_date?: string
          email: string
          id: string
          subscription_tier?: string
        }
        Update: {
          created_at?: string
          credits_remaining?: number
          credits_reset_date?: string
          email?: string
          id?: string
          subscription_tier?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

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

export interface Document {
  id: string;
  title: string;
  content: string;
  type: 
    | 'project_overview'
    | 'market_research'
    | 'project_planning'
    | 'design_development'
    | 'chat_transcript'
    | 'uploaded'
    | 'project'
    | 'project_description'
    | 'project_goals'
    | 'project_features'
    | 'project_considerations';
  project_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_auto_generated: boolean;
  file_path?: string;
}
