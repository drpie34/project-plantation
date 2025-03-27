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
      comments: {
        Row: {
          content: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_user_id_fkey"
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
      marketing_copies: {
        Row: {
          content: string
          content_type: string
          created_at: string
          id: string
          model_used: string | null
          project_id: string
          title: string
          user_id: string
        }
        Insert: {
          content: string
          content_type: string
          created_at?: string
          id?: string
          model_used?: string | null
          project_id: string
          title: string
          user_id: string
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string
          id?: string
          model_used?: string | null
          project_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_copies_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          collaboration_settings: Json | null
          collaborators: string[] | null
          created_at: string
          description: string | null
          id: string
          is_collaborative: boolean | null
          stage: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          collaboration_settings?: Json | null
          collaborators?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_collaborative?: boolean | null
          stage?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          collaboration_settings?: Json | null
          collaborators?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_collaborative?: boolean | null
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
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          project_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          credits_remaining: number
          credits_reset_date: string
          email: string
          expertise: string[] | null
          full_name: string | null
          github_url: string | null
          id: string
          industry: string | null
          interests: string[] | null
          linkedin_url: string | null
          notification_settings: Json | null
          position: string | null
          preferences: Json | null
          subscription_tier: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          credits_remaining?: number
          credits_reset_date?: string
          email: string
          expertise?: string[] | null
          full_name?: string | null
          github_url?: string | null
          id: string
          industry?: string | null
          interests?: string[] | null
          linkedin_url?: string | null
          notification_settings?: Json | null
          position?: string | null
          preferences?: Json | null
          subscription_tier?: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          credits_remaining?: number
          credits_reset_date?: string
          email?: string
          expertise?: string[] | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          industry?: string | null
          interests?: string[] | null
          linkedin_url?: string | null
          notification_settings?: Json | null
          position?: string | null
          preferences?: Json | null
          subscription_tier?: string
          website_url?: string | null
        }
        Relationships: []
      }
      visual_plans: {
        Row: {
          created_at: string
          data: Json
          id: string
          name: string
          project_id: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          name: string
          project_id: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          name?: string
          project_id?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visual_plans_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visual_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
