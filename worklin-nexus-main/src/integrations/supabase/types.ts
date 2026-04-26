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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_activity: {
        Row: {
          created_at: string | null
          id: string
          message: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
        }
        Relationships: []
      }
      bids: {
        Row: {
          cover_note: string | null
          freelancer_id: string
          id: string
          job_id: string
          proposed_rate: number
          status: Database["public"]["Enums"]["bid_status"] | null
          submitted_at: string | null
        }
        Insert: {
          cover_note?: string | null
          freelancer_id: string
          id?: string
          job_id: string
          proposed_rate: number
          status?: Database["public"]["Enums"]["bid_status"] | null
          submitted_at?: string | null
        }
        Update: {
          cover_note?: string | null
          freelancer_id?: string
          id?: string
          job_id?: string
          proposed_rate?: number
          status?: Database["public"]["Enums"]["bid_status"] | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bids_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcasts: {
        Row: {
          admin_id: string | null
          id: string
          message: string
          recipient_group: string
          sent_at: string | null
        }
        Insert: {
          admin_id?: string | null
          id?: string
          message: string
          recipient_group: string
          sent_at?: string | null
        }
        Update: {
          admin_id?: string | null
          id?: string
          message?: string
          recipient_group?: string
          sent_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_filename: string | null
          image_url: string | null
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_filename?: string | null
          image_url?: string | null
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_filename?: string | null
          image_url?: string | null
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      favourites: {
        Row: {
          created_at: string | null
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favourites_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          assigned_to: string | null
          category_id: string | null
          client_id: string | null
          description: string
          id: string
          posted_at: string | null
          rate_max: number
          rate_min: number
          skills: string[] | null
          status: Database["public"]["Enums"]["job_status"] | null
          title: string
        }
        Insert: {
          assigned_to?: string | null
          category_id?: string | null
          client_id?: string | null
          description: string
          id?: string
          posted_at?: string | null
          rate_max: number
          rate_min: number
          skills?: string[] | null
          status?: Database["public"]["Enums"]["job_status"] | null
          title: string
        }
        Update: {
          assigned_to?: string | null
          category_id?: string | null
          client_id?: string | null
          description?: string
          id?: string
          posted_at?: string | null
          rate_max?: number
          rate_min?: number
          skills?: string[] | null
          status?: Database["public"]["Enums"]["job_status"] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          external_link: string | null
          id: string
          image_url: string | null
          title: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          external_link?: string | null
          id?: string
          image_url?: string | null
          title: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          external_link?: string | null
          id?: string
          image_url?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_initials: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          email_notifications: boolean | null
          full_name: string | null
          hourly_rate: number | null
          id: string
          onboarding_complete: boolean | null
          paypal_email: string | null
          phone: string | null
          primary_category: string | null
          skills: string[] | null
          status: Database["public"]["Enums"]["account_status"] | null
          test_score: number | null
          theme: string | null
          verification:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Insert: {
          avatar_initials?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          email_notifications?: boolean | null
          full_name?: string | null
          hourly_rate?: number | null
          id: string
          onboarding_complete?: boolean | null
          paypal_email?: string | null
          phone?: string | null
          primary_category?: string | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["account_status"] | null
          test_score?: number | null
          theme?: string | null
          verification?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Update: {
          avatar_initials?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          email_notifications?: boolean | null
          full_name?: string | null
          hourly_rate?: number | null
          id?: string
          onboarding_complete?: boolean | null
          paypal_email?: string | null
          phone?: string | null
          primary_category?: string | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["account_status"] | null
          test_score?: number | null
          theme?: string | null
          verification?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: []
      }
      transcription_attempts: {
        Row: {
          attempt_number: number
          created_at: string | null
          id: string
          passed: boolean
          score: number
          test_number: number
          user_id: string
        }
        Insert: {
          attempt_number: number
          created_at?: string | null
          id?: string
          passed: boolean
          score: number
          test_number: number
          user_id: string
        }
        Update: {
          attempt_number?: number
          created_at?: string | null
          id?: string
          passed?: boolean
          score?: number
          test_number?: number
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
      get_primary_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      account_status: "active" | "restricted"
      app_role: "admin" | "freelancer" | "client"
      bid_status:
        | "under_review"
        | "engaged"
        | "not_selected"
        | "approved"
        | "declined"
      job_status: "open" | "under_review" | "filled" | "archived"
      verification_status: "pending" | "verified" | "rejected"
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
    Enums: {
      account_status: ["active", "restricted"],
      app_role: ["admin", "freelancer", "client"],
      bid_status: [
        "under_review",
        "engaged",
        "not_selected",
        "approved",
        "declined",
      ],
      job_status: ["open", "under_review", "filled", "archived"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
