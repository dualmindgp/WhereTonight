export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]

export interface Database {
  public: {
    Tables: {
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
      }
      tickets: {
        Row: {
          id: string
          user_id: string
          venue_id: string
          local_date: string
          created_at: string
        }
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
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          venue_id: string
          created_at: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          bio: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
      }
      friendships: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: 'pending' | 'accepted' | 'blocked'
          created_at: string
          updated_at: string
        }
      }
      activity: {
        Row: {
          id: string
          user_id: string
          venue_id: string | null
          type: string
          created_at: string
        }
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
  }
}

export type Venue = Database['public']['Tables']['venues']['Row']
export type VenueWithCount = Venue & { count_today: number }
export type Ticket = Database['public']['Tables']['tickets']['Row']
export type SocialPost = Database['public']['Tables']['social_posts']['Row']
export type SocialPostWithUser = Database['public']['Views']['social_posts_with_user']['Row']
export type Favorite = Database['public']['Tables']['favorites']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Friendship = Database['public']['Tables']['friendships']['Row']
export type Activity = Database['public']['Tables']['activity']['Row']
