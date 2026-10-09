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
      complaint_updates: {
        Row: {
          complaint_id: string
          created_at: string
          id: string
          note: string
          status: string
        }
        Insert: {
          complaint_id: string
          created_at?: string
          id?: string
          note?: string
          status: string
        }
        Update: {
          complaint_id?: string
          created_at?: string
          id?: string
          note?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_updates_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          action_plan: string[]
          ai_mode: string
          anonymous: boolean
          category: string
          code: string
          confidence: number
          contact: string
          created_at: string
          department: string
          estimated_resolution_time: string
          id: string
          keywords: string[]
          location: string
          original_text: string
          photo_path: string | null
          priority: Database["public"]["Enums"]["complaint_priority"]
          professional_complaint: string
          recommended_next_step: string
          resolution_notes: string
          resolved_at: string | null
          sentiment: string
          status: Database["public"]["Enums"]["complaint_status"]
          summary: string
          title: string
          updated_at: string
          urgency_reason: string
          user_id: string
        }
        Insert: {
          action_plan?: string[]
          ai_mode?: string
          anonymous?: boolean
          category?: string
          code?: string
          confidence?: number
          contact?: string
          created_at?: string
          department?: string
          estimated_resolution_time?: string
          id?: string
          keywords?: string[]
          location?: string
          original_text: string
          photo_path?: string | null
          priority?: Database["public"]["Enums"]["complaint_priority"]
          professional_complaint?: string
          recommended_next_step?: string
          resolution_notes?: string
          resolved_at?: string | null
          sentiment?: string
          status?: Database["public"]["Enums"]["complaint_status"]
          summary?: string
          title: string
          updated_at?: string
          urgency_reason?: string
          user_id: string
        }
        Update: {
          action_plan?: string[]
          ai_mode?: string
          anonymous?: boolean
          category?: string
          code?: string
          confidence?: number
          contact?: string
          created_at?: string
          department?: string
          estimated_resolution_time?: string
          id?: string
          keywords?: string[]
          location?: string
          original_text?: string
          photo_path?: string | null
          priority?: Database["public"]["Enums"]["complaint_priority"]
          professional_complaint?: string
          recommended_next_step?: string
          resolution_notes?: string
          resolved_at?: string | null
          sentiment?: string
          status?: Database["public"]["Enums"]["complaint_status"]
          summary?: string
          title?: string
          updated_at?: string
          urgency_reason?: string
          user_id?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          description: string
          id: string
          keywords: string[]
          name: string
        }
        Insert: {
          description?: string
          id?: string
          keywords?: string[]
          name: string
        }
        Update: {
          description?: string
          id?: string
          keywords?: string[]
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          complaint_id: string | null
          created_at: string
          id: string
          read: boolean
          text: string
          user_id: string
        }
        Insert: {
          complaint_id?: string | null
          created_at?: string
          id?: string
          read?: boolean
          text: string
          user_id: string
        }
        Update: {
          complaint_id?: string | null
          created_at?: string
          id?: string
          read?: boolean
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string
          created_at: string
          email: string
          id: string
          name: string
          skills: string[]
          title: string
          updated_at: string
        }
        Insert: {
          bio?: string
          created_at?: string
          email?: string
          id: string
          name?: string
          skills?: string[]
          title?: string
          updated_at?: string
        }
        Update: {
          bio?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          skills?: string[]
          title?: string
          updated_at?: string
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
      admin_update_complaint: {
        Args: {
          _department: string
          _id: string
          _note: string
          _status: Database["public"]["Enums"]["complaint_status"]
        }
        Returns: undefined
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
      app_role: "admin" | "user"
      complaint_priority: "Low" | "Medium" | "High" | "Critical"
      complaint_status:
        | "Submitted"
        | "Under Review"
        | "Assigned"
        | "In Progress"
        | "Resolved"
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
      app_role: ["admin", "user"],
      complaint_priority: ["Low", "Medium", "High", "Critical"],
      complaint_status: [
        "Submitted",
        "Under Review",
        "Assigned",
        "In Progress",
        "Resolved",
      ],
    },
  },
} as const
