export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          company_name: string | null
          industry: string | null
          services: string[] | null
          default_currency: string | null
          default_tone: string | null
          logo_url: string | null
          brand_color: string | null
          plan: 'free' | 'pro' | 'agency'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          proposals_used_this_month: number | null
          proposals_reset_date: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & {
          id: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
      proposals: {
        Row: {
          id: string
          user_id: string
          title: string
          client_name: string
          client_email: string | null
          project_type: string | null
          project_description: string | null
          budget: string | null
          deadline: string | null
          tone: string | null
          mode: 'smart' | 'template'
          template_id: string | null
          content: Json
          status: string
          score: number | null
          score_feedback: Json
          view_count: number | null
          last_viewed_at: string | null
          share_token: string | null
          is_signed: boolean | null
          signed_at: string | null
          signer_name: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['proposals']['Row']> & {
          user_id: string
          title: string
          client_name: string
        }
        Update: Partial<Database['public']['Tables']['proposals']['Row']>
      }
      proposal_events: {
        Row: {
          id: string
          proposal_id: string | null
          event_type: string
          metadata: Json
          created_at: string | null
        }
        Insert: {
          proposal_id?: string | null
          event_type: string
          metadata?: Json
        }
        Update: Partial<Database['public']['Tables']['proposal_events']['Row']>
      }
      templates: {
        Row: {
          id: string
          user_id: string | null
          name: string
          industry: string | null
          description: string | null
          structure: Json
          is_public: boolean | null
          created_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['templates']['Row']> & {
          name: string
        }
        Update: Partial<Database['public']['Tables']['templates']['Row']>
      }
      team_members: {
        Row: {
          id: string
          agency_id: string
          member_email: string
          member_id: string | null
          role: 'admin' | 'member'
          status: 'pending' | 'accepted'
          invited_at: string | null
          accepted_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['team_members']['Row']> & {
          agency_id: string
          member_email: string
        }
        Update: Partial<Database['public']['Tables']['team_members']['Row']>
      }
    }
  }
}
