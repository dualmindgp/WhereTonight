export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]

export interface Database {
  public: {
    Tables: {
      comments: {
        Row: {
          id: string
          user_id: string
          venue_id: string
          text: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          venue_id: string
          text: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          venue_id?: string
          text?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          }
        ]
      }
      venues: {
        Row: {
          id: string
          name: string
          type: 'club' | 'bar' | 'other'
          lat: number
          lng: number
          address: string | null
          avg_price_text: string | null
          tickets_url: string | null
          maps_url: string | null
          is_active: boolean
          created_at: string
          place_id?: string | null
          rating?: number | null
          price_level?: number | null
          photo_ref?: string | null
          photo_refs?: string[] | null
          website?: string | null
          opening_hours?: string | null
        }
        Insert: {
          id?: string
          name: string
          type?: 'club' | 'bar' | 'other'
          lat: number
          lng: number
          address?: string | null
          avg_price_text?: string | null
          tickets_url?: string | null
          maps_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'club' | 'bar' | 'other'
          lat?: number
          lng?: number
          address?: string | null
          avg_price_text?: string | null
          tickets_url?: string | null
          maps_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          id: string
          user_id: string
          venue_id: string
          local_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          venue_id: string
          local_date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          venue_id?: string
          local_date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          }
        ]
      }
      social_posts: {
        Row: {
          id: string
          user_id: string
          content: string
          city: string
          city_lat: number
          city_lng: number
          audience: 'public' | 'friends_only'
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          city: string
          city_lat: number
          city_lng: number
          audience?: 'public' | 'friends_only'
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          city?: string
          city_lat?: number
          city_lng?: number
          audience?: 'public' | 'friends_only'
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      social_posts_with_user: {
        Row: {
          id: string
          user_id: string
          content: string
          city: string
          city_lat: number
          city_lng: number
          audience: 'public' | 'friends_only'
          image_url: string | null
          created_at: string
          updated_at: string
          username: string | null
          avatar_url: string | null
        }
      }
    }
    Functions: {
      tickets_count_today_euwarsaw: {
        Args: {}
        Returns: {
          venue_id: string
          count_today: number
        }[]
      }
      user_ticket_used_today: {
        Args: {}
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Tipos de conveniencia
export type Venue = Database['public']['Tables']['venues']['Row']
export type VenueWithCount = Venue & { count_today: number }
export type Comment = Database['public']['Tables']['comments']['Row']
export type Ticket = Database['public']['Tables']['tickets']['Row']
export type SocialPost = Database['public']['Tables']['social_posts']['Row']
export type SocialPostWithUser = Database['public']['Views']['social_posts_with_user']['Row']
