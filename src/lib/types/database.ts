export interface Database {
  public: {
    Tables: {
      subscription_plans: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          interval: 'monthly' | 'yearly'
          features: Record<string, any>
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          interval: 'monthly' | 'yearly'
          features?: Record<string, any>
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          interval?: 'monthly' | 'yearly'
          features?: Record<string, any>
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      salons: {
        Row: {
          id: string
          name: string
          slug: string
          owner_id: string
          subscription_plan_id: string | null
          subscription_status: 'trial' | 'active' | 'past_due' | 'canceled'
          trial_ends_at: string | null
          email: string
          phone: string | null
          address: string | null
          city: string | null
          postal_code: string | null
          country: string | null
          timezone: string
          currency: string
          logo_url: string | null
          website: string | null
          custom_domain: string | null
          theme_colors: {
            primary: string
            secondary: string
          }
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          owner_id: string
          subscription_plan_id?: string | null
          subscription_status?: 'trial' | 'active' | 'past_due' | 'canceled'
          trial_ends_at?: string | null
          email: string
          phone?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string | null
          timezone?: string
          currency?: string
          logo_url?: string | null
          website?: string | null
          custom_domain?: string | null
          theme_colors?: {
            primary: string
            secondary: string
          }
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          owner_id?: string
          subscription_plan_id?: string | null
          subscription_status?: 'trial' | 'active' | 'past_due' | 'canceled'
          trial_ends_at?: string | null
          email?: string
          phone?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string | null
          timezone?: string
          currency?: string
          logo_url?: string | null
          website?: string | null
          custom_domain?: string | null
          theme_colors?: {
            primary: string
            secondary: string
          }
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      salon_settings: {
        Row: {
          id: string
          salon_id: string
          working_hours: Record<string, any>
          booking_rules: Record<string, any>
          notification_settings: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          salon_id: string
          working_hours?: Record<string, any>
          booking_rules?: Record<string, any>
          notification_settings?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          salon_id?: string
          working_hours?: Record<string, any>
          booking_rules?: Record<string, any>
          notification_settings?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}