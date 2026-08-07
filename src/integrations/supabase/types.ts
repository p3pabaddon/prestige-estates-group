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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      customer_activities: {
        Row: {
          activity_type: string
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
          note: string | null
          stage: Database["public"]["Enums"]["customer_stage"] | null
        }
        Insert: {
          activity_type?: string
          created_at?: string
          created_by?: string | null
          customer_id: string
          id?: string
          note?: string | null
          stage?: Database["public"]["Enums"]["customer_stage"] | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string
          id?: string
          note?: string | null
          stage?: Database["public"]["Enums"]["customer_stage"] | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_activities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          assigned_to: string | null
          budget_max: number | null
          budget_min: number | null
          created_at: string
          created_by: string | null
          email: string | null
          full_name: string
          id: string
          interested_district: string | null
          interested_type: string | null
          notes: string | null
          phone: string | null
          property_id: string | null
          source: string | null
          stage: Database["public"]["Enums"]["customer_stage"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name: string
          id?: string
          interested_district?: string | null
          interested_type?: string | null
          notes?: string | null
          phone?: string | null
          property_id?: string | null
          source?: string | null
          stage?: Database["public"]["Enums"]["customer_stage"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name?: string
          id?: string
          interested_district?: string | null
          interested_type?: string | null
          notes?: string | null
          phone?: string | null
          property_id?: string | null
          source?: string | null
          stage?: Database["public"]["Enums"]["customer_stage"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          bathrooms: number | null
          building_age: string | null
          city: string | null
          created_at: string
          created_by: string | null
          credit_eligible: boolean
          currency: string
          description: string | null
          district: string | null
          external_url: string | null
          featured: boolean
          floor: string | null
          furnished: boolean
          gross_m2: number | null
          heating: string | null
          id: string
          images: string[]
          lat: number | null
          listing_type: string
          lng: number | null
          location: string | null
          net_m2: number | null
          price: number | null
          property_type: string
          published: boolean
          rooms: string | null
          status: string
          tag: string | null
          title: string
          total_floors: number | null
          updated_at: string
        }
        Insert: {
          bathrooms?: number | null
          building_age?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          credit_eligible?: boolean
          currency?: string
          description?: string | null
          district?: string | null
          external_url?: string | null
          featured?: boolean
          floor?: string | null
          furnished?: boolean
          gross_m2?: number | null
          heating?: string | null
          id?: string
          images?: string[]
          lat?: number | null
          listing_type?: string
          lng?: number | null
          location?: string | null
          net_m2?: number | null
          price?: number | null
          property_type?: string
          published?: boolean
          rooms?: string | null
          status?: string
          tag?: string | null
          title: string
          total_floors?: number | null
          updated_at?: string
        }
        Update: {
          bathrooms?: number | null
          building_age?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          credit_eligible?: boolean
          currency?: string
          description?: string | null
          district?: string | null
          external_url?: string | null
          featured?: boolean
          floor?: string | null
          furnished?: boolean
          gross_m2?: number | null
          heating?: string | null
          id?: string
          images?: string[]
          lat?: number | null
          listing_type?: string
          lng?: number | null
          location?: string | null
          net_m2?: number | null
          price?: number | null
          property_type?: string
          published?: boolean
          rooms?: string | null
          status?: string
          tag?: string | null
          title?: string
          total_floors?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          done: boolean
          id: string
          note: string | null
          notified: boolean
          remind_at: string
          title: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          done?: boolean
          id?: string
          note?: string | null
          notified?: boolean
          remind_at: string
          title: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          done?: boolean
          id?: string
          note?: string | null
          notified?: boolean
          remind_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "agent"
      customer_stage:
        | "yeni"
        | "iletisim"
        | "ilgileniyor"
        | "randevu"
        | "ofis_ziyareti"
        | "pazarlik"
        | "satis"
        | "kaybedildi"
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
      app_role: ["admin", "agent"],
      customer_stage: [
        "yeni",
        "iletisim",
        "ilgileniyor",
        "randevu",
        "ofis_ziyareti",
        "pazarlik",
        "satis",
        "kaybedildi",
      ],
    },
  },
} as const
