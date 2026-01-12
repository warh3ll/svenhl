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
      nhl_games: {
        Row: {
          away_score: number | null
          away_team: string
          away_team_abbr: string
          game_date: string
          highlight_url: string | null
          highlight_video_id: string | null
          home_score: number | null
          home_team: string
          home_team_abbr: string
          id: string
          period: string | null
          status: string
          swedish_goalies: Json | null
          swedish_points: Json | null
          time_remaining: string | null
          updated_at: string | null
        }
        Insert: {
          away_score?: number | null
          away_team: string
          away_team_abbr: string
          game_date: string
          highlight_url?: string | null
          highlight_video_id?: string | null
          home_score?: number | null
          home_team: string
          home_team_abbr: string
          id: string
          period?: string | null
          status?: string
          swedish_goalies?: Json | null
          swedish_points?: Json | null
          time_remaining?: string | null
          updated_at?: string | null
        }
        Update: {
          away_score?: number | null
          away_team?: string
          away_team_abbr?: string
          game_date?: string
          highlight_url?: string | null
          highlight_video_id?: string | null
          home_score?: number | null
          home_team?: string
          home_team_abbr?: string
          id?: string
          period?: string | null
          status?: string
          swedish_goalies?: Json | null
          swedish_points?: Json | null
          time_remaining?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      nhl_sync_status: {
        Row: {
          error_message: string | null
          id: string
          last_synced_at: string | null
          sync_status: string | null
        }
        Insert: {
          error_message?: string | null
          id?: string
          last_synced_at?: string | null
          sync_status?: string | null
        }
        Update: {
          error_message?: string | null
          id?: string
          last_synced_at?: string | null
          sync_status?: string | null
        }
        Relationships: []
      }
      swedish_goalies: {
        Row: {
          games: number | null
          games_started: number | null
          goals_against_average: number | null
          id: string
          jersey_number: number
          losses: number | null
          name: string
          overtime_losses: number | null
          save_percentage: number | null
          saves: number | null
          season: string
          shots_against: number | null
          shutouts: number | null
          team: string
          team_abbr: string
          time_on_ice: string | null
          updated_at: string | null
          wins: number | null
        }
        Insert: {
          games?: number | null
          games_started?: number | null
          goals_against_average?: number | null
          id: string
          jersey_number: number
          losses?: number | null
          name: string
          overtime_losses?: number | null
          save_percentage?: number | null
          saves?: number | null
          season?: string
          shots_against?: number | null
          shutouts?: number | null
          team: string
          team_abbr: string
          time_on_ice?: string | null
          updated_at?: string | null
          wins?: number | null
        }
        Update: {
          games?: number | null
          games_started?: number | null
          goals_against_average?: number | null
          id?: string
          jersey_number?: number
          losses?: number | null
          name?: string
          overtime_losses?: number | null
          save_percentage?: number | null
          saves?: number | null
          season?: string
          shots_against?: number | null
          shutouts?: number | null
          team?: string
          team_abbr?: string
          time_on_ice?: string | null
          updated_at?: string | null
          wins?: number | null
        }
        Relationships: []
      }
      swedish_players: {
        Row: {
          assists: number | null
          game_winning_goals: number | null
          games: number | null
          goals: number | null
          id: string
          jersey_number: number
          name: string
          penalty_minutes: number | null
          plus_minus: number | null
          points: number | null
          position: string
          power_play_goals: number | null
          power_play_points: number | null
          season: string
          shooting_pct: number | null
          shots: number | null
          team: string
          team_abbr: string
          time_on_ice: string | null
          updated_at: string | null
        }
        Insert: {
          assists?: number | null
          game_winning_goals?: number | null
          games?: number | null
          goals?: number | null
          id: string
          jersey_number: number
          name: string
          penalty_minutes?: number | null
          plus_minus?: number | null
          points?: number | null
          position: string
          power_play_goals?: number | null
          power_play_points?: number | null
          season?: string
          shooting_pct?: number | null
          shots?: number | null
          team: string
          team_abbr: string
          time_on_ice?: string | null
          updated_at?: string | null
        }
        Update: {
          assists?: number | null
          game_winning_goals?: number | null
          games?: number | null
          goals?: number | null
          id?: string
          jersey_number?: number
          name?: string
          penalty_minutes?: number | null
          plus_minus?: number | null
          points?: number | null
          position?: string
          power_play_goals?: number | null
          power_play_points?: number | null
          season?: string
          shooting_pct?: number | null
          shots?: number | null
          team?: string
          team_abbr?: string
          time_on_ice?: string | null
          updated_at?: string | null
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
