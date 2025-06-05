import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client (for API routes)
export const createServerSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Admin client (with service role key)
export const createAdminSupabaseClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey)
}

// Database types
export interface Database {
  public: {
    Tables: {
      time_slots: {
        Row: {
          id: string
          date: string
          start_time: string
          end_time: string
          slot_type: 'community' | 'private'
          max_capacity: number
          current_bookings: number
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          start_time: string
          end_time: string
          slot_type: 'community' | 'private'
          max_capacity: number
          current_bookings?: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          start_time?: string
          end_time?: string
          slot_type?: 'community' | 'private'
          max_capacity?: number
          current_bookings?: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          time_slot_id: string
          user_id: string | null
          user_email: string
          user_name: string
          user_phone: string | null
          booking_type: 'community' | 'private'
          party_size: number
          status: 'pending' | 'confirmed' | 'cancelled'
          payment_status: 'pending' | 'paid' | 'refunded'
          payment_intent_id: string | null
          total_amount: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          time_slot_id: string
          user_id?: string | null
          user_email: string
          user_name: string
          user_phone?: string | null
          booking_type: 'community' | 'private'
          party_size: number
          status?: 'pending' | 'confirmed' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'refunded'
          payment_intent_id?: string | null
          total_amount: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          time_slot_id?: string
          user_id?: string | null
          user_email?: string
          user_name?: string
          user_phone?: string | null
          booking_type?: 'community' | 'private'
          party_size?: number
          status?: 'pending' | 'confirmed' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'refunded'
          payment_intent_id?: string | null
          total_amount?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          is_admin: boolean
          membership_type: 'none' | 'monthly' | 'annual' | 'lifetime'
          membership_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          is_admin?: boolean
          membership_type?: 'none' | 'monthly' | 'annual' | 'lifetime'
          membership_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          is_admin?: boolean
          membership_type?: 'none' | 'monthly' | 'annual' | 'lifetime'
          membership_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 