export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      analytics_data: {
        Row: {
          created_at: string
          date_recorded: string
          id: string
          metric_name: string
          metric_value: number
        }
        Insert: {
          created_at?: string
          date_recorded?: string
          id?: string
          metric_name: string
          metric_value: number
        }
        Update: {
          created_at?: string
          date_recorded?: string
          id?: string
          metric_name?: string
          metric_value?: number
        }
        Relationships: []
      }
      conversation_tags: {
        Row: {
          conversation_id: string
          created_at: string
          expires_at: string | null
          id: string
          service_payment_id: string | null
          tag_type: string
          tag_value: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          service_payment_id?: string | null
          tag_type: string
          tag_value: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          service_payment_id?: string | null
          tag_type?: string
          tag_value?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          client_id: string
          created_at: string
          creator_id: string
          id: string
          last_message: string | null
          last_message_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          creator_id: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          creator_id?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_gallery: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          id: string
          is_featured: boolean | null
          media_type: string
          media_url: string
          title: string | null
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          media_type: string
          media_url: string
          title?: string | null
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          media_type?: string
          media_url?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_gallery_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_posts: {
        Row: {
          content: string
          created_at: string
          creator_id: string
          id: string
          is_premium: boolean | null
          likes_count: number | null
          media_urls: string[] | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          creator_id: string
          id?: string
          is_premium?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          creator_id?: string
          id?: string
          is_premium?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_posts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_reviews: {
        Row: {
          comment: string | null
          created_at: string
          creator_id: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          creator_id: string
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          creator_id?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_reviews_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_services: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          price: number
          service_type: string
          title: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          price: number
          service_type: string
          title: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          price?: number
          service_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_services_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creators: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_image_url: string | null
          created_at: string
          display_name: string
          id: string
          is_featured: boolean | null
          is_new: boolean | null
          languages: string[] | null
          like_count: number | null
          location: string | null
          message_count: number | null
          rating: number | null
          review_count: number | null
          starting_price: number
          status: Database["public"]["Enums"]["creator_status"]
          tags: string[] | null
          updated_at: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string
          display_name: string
          id?: string
          is_featured?: boolean | null
          is_new?: boolean | null
          languages?: string[] | null
          like_count?: number | null
          location?: string | null
          message_count?: number | null
          rating?: number | null
          review_count?: number | null
          starting_price?: number
          status?: Database["public"]["Enums"]["creator_status"]
          tags?: string[] | null
          updated_at?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_featured?: boolean | null
          is_new?: boolean | null
          languages?: string[] | null
          like_count?: number | null
          location?: string | null
          message_count?: number | null
          rating?: number | null
          review_count?: number | null
          starting_price?: number
          status?: Database["public"]["Enums"]["creator_status"]
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          is_ppv_unlocked: boolean | null
          media_url: string | null
          message_type: string
          ppv_price: number | null
          sender_id: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          is_ppv_unlocked?: boolean | null
          media_url?: string | null
          message_type?: string
          ppv_price?: number | null
          sender_id: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          is_ppv_unlocked?: boolean | null
          media_url?: string | null
          message_type?: string
          ppv_price?: number | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      mimo_rewards: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          minimum_amount: number
          reward_description: string
          reward_type: string
          reward_value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          minimum_amount: number
          reward_description: string
          reward_type: string
          reward_value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          minimum_amount?: number
          reward_description?: string
          reward_type?: string
          reward_value?: string | null
        }
        Relationships: []
      }
      mimos: {
        Row: {
          amount: number
          client_id: string
          completed_at: string | null
          created_at: string
          creator_id: string
          id: string
          message: string | null
          payment_id: string | null
          payment_status: string
          payment_url: string | null
        }
        Insert: {
          amount: number
          client_id: string
          completed_at?: string | null
          created_at?: string
          creator_id: string
          id?: string
          message?: string | null
          payment_id?: string | null
          payment_status?: string
          payment_url?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          completed_at?: string | null
          created_at?: string
          creator_id?: string
          id?: string
          message?: string | null
          payment_id?: string | null
          payment_status?: string
          payment_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mimos_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          created_at: string
          creator_id: string | null
          currency: string | null
          id: string
          order_type: string
          payment_gateway: string | null
          payment_reference: string | null
          payment_status: string | null
          service_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          creator_id?: string | null
          currency?: string | null
          id?: string
          order_type: string
          payment_gateway?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          service_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          creator_id?: string | null
          currency?: string | null
          id?: string
          order_type?: string
          payment_gateway?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          service_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "creator_services"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_payments: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          creator_id: string
          expires_at: string | null
          id: string
          payment_id: string | null
          payment_status: string
          payment_url: string | null
          service_id: string
          service_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          creator_id: string
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          payment_status?: string
          payment_url?: string | null
          service_id: string
          service_type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          creator_id?: string
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          payment_status?: string
          payment_url?: string | null
          service_id?: string
          service_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string
          id: string
          priority: string | null
          status: string | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description: string
          id?: string
          priority?: string | null
          status?: string | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string
          id?: string
          priority?: string | null
          status?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_featured: {
        Row: {
          auto_selected: boolean
          created_at: string
          creator_id: string
          id: string
          is_active: boolean
          position: number
          selection_criteria: Json | null
          updated_at: string
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          auto_selected?: boolean
          created_at?: string
          creator_id: string
          id?: string
          is_active?: boolean
          position: number
          selection_criteria?: Json | null
          updated_at?: string
          week_end_date: string
          week_start_date: string
        }
        Update: {
          auto_selected?: boolean
          created_at?: string
          creator_id?: string
          id?: string
          is_active?: boolean
          position?: number
          selection_criteria?: Json | null
          updated_at?: string
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_weekly_featured_creator"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_featured_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_rotate_weekly_featured: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      creator_status: "online" | "ocupada" | "offline"
      user_role: "cliente" | "criadora" | "admin"
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
      creator_status: ["online", "ocupada", "offline"],
      user_role: ["cliente", "criadora", "admin"],
    },
  },
} as const
