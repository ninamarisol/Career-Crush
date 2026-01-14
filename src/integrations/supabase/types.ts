export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_id: string
          created_at: string
          current_progress: number | null
          id: string
          target: number
          tier: string
          unlocked: boolean | null
          unlocked_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          current_progress?: number | null
          id?: string
          target: number
          tier?: string
          unlocked?: boolean | null
          unlocked_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          current_progress?: number | null
          id?: string
          target?: number
          tier?: string
          unlocked?: boolean | null
          unlocked_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          company: string
          company_logo_url: string | null
          created_at: string
          date_applied: string | null
          id: string
          job_description: string | null
          job_posting_url: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          notes: string | null
          position: string
          resume_url: string | null
          salary_max: number | null
          salary_min: number | null
          status: string
          updated_at: string
          user_id: string
          work_style: string | null
        }
        Insert: {
          company: string
          company_logo_url?: string | null
          created_at?: string
          date_applied?: string | null
          id?: string
          job_description?: string | null
          job_posting_url?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          notes?: string | null
          position: string
          resume_url?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string
          updated_at?: string
          user_id: string
          work_style?: string | null
        }
        Update: {
          company?: string
          company_logo_url?: string | null
          created_at?: string
          date_applied?: string | null
          id?: string
          job_description?: string | null
          job_posting_url?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          notes?: string | null
          position?: string
          resume_url?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string
          updated_at?: string
          user_id?: string
          work_style?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          application_id: string | null
          created_at: string
          date: string
          id: string
          notes: string | null
          time: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          time?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          time?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      job_preferences: {
        Row: {
          additional_notes: string | null
          company_sizes: string[] | null
          created_at: string
          custom_industries: string[] | null
          custom_role_types: string[] | null
          id: string
          industries: string[] | null
          locations: string[] | null
          priority_weights: Json | null
          role_types: string[] | null
          salary_max: number | null
          salary_min: number | null
          updated_at: string
          user_id: string
          work_styles: string[] | null
        }
        Insert: {
          additional_notes?: string | null
          company_sizes?: string[] | null
          created_at?: string
          custom_industries?: string[] | null
          custom_role_types?: string[] | null
          id?: string
          industries?: string[] | null
          locations?: string[] | null
          priority_weights?: Json | null
          role_types?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          updated_at?: string
          user_id: string
          work_styles?: string[] | null
        }
        Update: {
          additional_notes?: string | null
          company_sizes?: string[] | null
          created_at?: string
          custom_industries?: string[] | null
          custom_role_types?: string[] | null
          id?: string
          industries?: string[] | null
          locations?: string[] | null
          priority_weights?: Json | null
          role_types?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          updated_at?: string
          user_id?: string
          work_styles?: string[] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          onboarding_complete: boolean | null
          theme_color: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          onboarding_complete?: boolean | null
          theme_color?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          onboarding_complete?: boolean | null
          theme_color?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quests: {
        Row: {
          category: string
          completed_at: string | null
          created_at: string
          current_progress: number | null
          description: string | null
          expires_at: string
          id: string
          is_completed: boolean | null
          starts_at: string
          target: number
          title: string
          type: string
          updated_at: string
          user_id: string
          xp_reward: number
        }
        Insert: {
          category: string
          completed_at?: string | null
          created_at?: string
          current_progress?: number | null
          description?: string | null
          expires_at: string
          id?: string
          is_completed?: boolean | null
          starts_at?: string
          target?: number
          title: string
          type: string
          updated_at?: string
          user_id: string
          xp_reward?: number
        }
        Update: {
          category?: string
          completed_at?: string | null
          created_at?: string
          current_progress?: number | null
          description?: string | null
          expires_at?: string
          id?: string
          is_completed?: boolean | null
          starts_at?: string
          target?: number
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
          xp_reward?: number
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          active_achievement_paths: string[] | null
          active_hours_per_week: number | null
          avg_applications_per_week: number | null
          avg_match_score_target: number | null
          calibration_complete: boolean | null
          calibration_start_date: string | null
          celebration_style: string | null
          created_at: string
          current_level: number | null
          current_streak: number | null
          focus: string | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          match_score_target: number | null
          motivation_style: string | null
          preferred_search_days: string[] | null
          situation: string | null
          streak_freeze_until: string | null
          streak_grace_days_remaining: number | null
          streak_style: string | null
          total_xp: number | null
          updated_at: string
          user_id: string
          weekly_application_target: number | null
          weekly_hours: number | null
          weekly_networking_target: number | null
        }
        Insert: {
          active_achievement_paths?: string[] | null
          active_hours_per_week?: number | null
          avg_applications_per_week?: number | null
          avg_match_score_target?: number | null
          calibration_complete?: boolean | null
          calibration_start_date?: string | null
          celebration_style?: string | null
          created_at?: string
          current_level?: number | null
          current_streak?: number | null
          focus?: string | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          match_score_target?: number | null
          motivation_style?: string | null
          preferred_search_days?: string[] | null
          situation?: string | null
          streak_freeze_until?: string | null
          streak_grace_days_remaining?: number | null
          streak_style?: string | null
          total_xp?: number | null
          updated_at?: string
          user_id: string
          weekly_application_target?: number | null
          weekly_hours?: number | null
          weekly_networking_target?: number | null
        }
        Update: {
          active_achievement_paths?: string[] | null
          active_hours_per_week?: number | null
          avg_applications_per_week?: number | null
          avg_match_score_target?: number | null
          calibration_complete?: boolean | null
          calibration_start_date?: string | null
          celebration_style?: string | null
          created_at?: string
          current_level?: number | null
          current_streak?: number | null
          focus?: string | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          match_score_target?: number | null
          motivation_style?: string | null
          preferred_search_days?: string[] | null
          situation?: string | null
          streak_freeze_until?: string | null
          streak_grace_days_remaining?: number | null
          streak_style?: string | null
          total_xp?: number | null
          updated_at?: string
          user_id?: string
          weekly_application_target?: number | null
          weekly_hours?: number | null
          weekly_networking_target?: number | null
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
