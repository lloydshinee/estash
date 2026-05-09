export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          created_at: string | null
          end_time: string
          id: string
          qr_code: string | null
          special_instructions: string | null
          start_time: string
          stash_id: string | null
          status: string | null
          total_hours: number
          total_price: number
          traveler_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_time: string
          id?: string
          qr_code?: string | null
          special_instructions?: string | null
          start_time: string
          stash_id?: string | null
          status?: string | null
          total_hours: number
          total_price: number
          traveler_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_time?: string
          id?: string
          qr_code?: string | null
          special_instructions?: string | null
          start_time?: string
          stash_id?: string | null
          status?: string | null
          total_hours?: number
          total_price?: number
          traveler_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_stash_id_fkey"
            columns: ["stash_id"]
            referencedRelation: "stash_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_traveler_id_fkey"
            columns: ["traveler_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_notes: {
        Row: {
          approved_at: string | null
          booking_id: string | null
          condition_notes: string | null
          created_at: string | null
          id: string
          item_count: number | null
          item_description: string
          photos: string[] | null
          stasher_id: string | null
          traveler_approved: boolean | null
        }
        Insert: {
          approved_at?: string | null
          booking_id?: string | null
          condition_notes?: string | null
          created_at?: string | null
          id?: string
          item_count?: number | null
          item_description: string
          photos?: string[] | null
          stasher_id?: string | null
          traveler_approved?: boolean | null
        }
        Update: {
          approved_at?: string | null
          booking_id?: string | null
          condition_notes?: string | null
          created_at?: string | null
          id?: string
          item_count?: number | null
          item_description?: string
          photos?: string[] | null
          stasher_id?: string | null
          traveler_approved?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_notes_booking_id_fkey"
            columns: ["booking_id"]
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_notes_stasher_id_fkey"
            columns: ["stasher_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          stasher_id: string | null
          traveler_id: string | null
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          stasher_id?: string | null
          traveler_id?: string | null
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          stasher_id?: string | null
          traveler_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_stasher_id_fkey"
            columns: ["stasher_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_traveler_id_fkey"
            columns: ["traveler_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stash_listings: {
        Row: {
          address: string
          amenities: string[] | null
          capacity_bags: number
          created_at: string | null
          description: string | null
          hourly_price: number
          id: string
          latitude: number
          longitude: number
          name: string
          photos: string[] | null
          security_features: string[] | null
          stasher_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          amenities?: string[] | null
          capacity_bags: number
          created_at?: string | null
          description?: string | null
          hourly_price: number
          id?: string
          latitude: number
          longitude: number
          name: string
          photos?: string[] | null
          security_features?: string[] | null
          stasher_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          amenities?: string[] | null
          capacity_bags?: number
          created_at?: string | null
          description?: string | null
          hourly_price?: number
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          photos?: string[] | null
          security_features?: string[] | null
          stasher_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stash_listings_stasher_id_fkey"
            columns: ["stasher_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stasher_applications: {
        Row: {
          address: string | null
          admin_notes: string | null
          business_name: string | null
          description: string | null
          id: string
          id_photo_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          space_photos: string[] | null
          status: string | null
          submitted_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          business_name?: string | null
          description?: string | null
          id?: string
          id_photo_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          space_photos?: string[] | null
          status?: string | null
          submitted_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          business_name?: string | null
          description?: string | null
          id?: string
          id_photo_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          space_photos?: string[] | null
          status?: string | null
          submitted_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stasher_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stasher_applications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
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
