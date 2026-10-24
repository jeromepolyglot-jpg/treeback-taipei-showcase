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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ai_job_runs: {
        Row: {
          job: string
          last_result: string | null
          last_run_at: string | null
          lease_until: string | null
          pause_reason: string | null
          paused: boolean
        }
        Insert: {
          job: string
          last_result?: string | null
          last_run_at?: string | null
          lease_until?: string | null
          pause_reason?: string | null
          paused?: boolean
        }
        Update: {
          job?: string
          last_result?: string | null
          last_run_at?: string | null
          lease_until?: string | null
          pause_reason?: string | null
          paused?: boolean
        }
        Relationships: []
      }
      oasis_leaderboard: {
        Row: {
          display_name: string
          improvement: number
          month: number
          role: string
          trees: number
          updated_at: string
          user_id: string
        }
        Insert: {
          display_name: string
          improvement?: number
          month?: number
          role: string
          trees?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          display_name?: string
          improvement?: number
          month?: number
          role?: string
          trees?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      oasis_progress: {
        Row: {
          state: Json
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          state: Json
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          state?: Json
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      oasis_weekly_summaries: {
        Row: {
          created_at: string
          summary: string
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          summary: string
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          summary?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      plant3d_scores: {
        Row: {
          created_at: string
          display_name: string
          trees: number
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          trees: number
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          trees?: number
          user_id?: string
        }
        Relationships: []
      }
      tree_alerts: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          tree_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          tree_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          tree_id?: string
          user_id?: string
        }
        Relationships: []
      }
      tree_reports: {
        Row: {
          created_at: string
          district: string
          id: string
          kind: string
          lat: number | null
          lng: number | null
          note: string
          photo_path: string | null
          user_id: string
          wishes: number
        }
        Insert: {
          created_at?: string
          district: string
          id?: string
          kind: string
          lat?: number | null
          lng?: number | null
          note?: string
          photo_path?: string | null
          user_id: string
          wishes?: number
        }
        Update: {
          created_at?: string
          district?: string
          id?: string
          kind?: string
          lat?: number | null
          lng?: number | null
          note?: string
          photo_path?: string | null
          user_id?: string
          wishes?: number
        }
        Relationships: []
      }
      tree_subscriptions: {
        Row: {
          created_at: string
          id: string
          tree_id: string
          tree_label: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tree_id: string
          tree_label?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tree_id?: string
          tree_label?: string
          user_id?: string
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          created_at: string
          id: string
          message: string
          page: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          page?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          page?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_reset_sim_data: { Args: never; Returns: Json }
      admin_user_activity: {
        Args: never
        Returns: {
          alerts: number
          email: string
          feedback: number
          oasis_played: boolean
          plant3d_scores: number
          reports: number
          signed_up_at: string
          subscriptions: number
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_wishes: { Args: { _report_id: string }; Returns: undefined }
      publish_oasis_score: {
        Args: {
          _display_name: string
          _improvement: number
          _month: number
          _role: string
          _trees: number
        }
        Returns: undefined
      }
      publish_plant3d_score: {
        Args: { _display_name: string; _trees: number }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
