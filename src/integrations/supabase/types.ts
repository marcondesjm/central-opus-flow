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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      account_collaborators: {
        Row: {
          accepted_at: string | null
          account_id: string
          created_at: string
          id: string
          invited_by: string
          invited_email: string
          role: Database["public"]["Enums"]["collaboration_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          account_id: string
          created_at?: string
          id?: string
          invited_by: string
          invited_email: string
          role?: Database["public"]["Enums"]["collaboration_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          account_id?: string
          created_at?: string
          id?: string
          invited_by?: string
          invited_email?: string
          role?: Database["public"]["Enums"]["collaboration_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_collaborators_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "lovable_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_collaborators_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "lovable_accounts_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      api_tokens: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          last_used_at: string | null
          name: string
          scopes: string[] | null
          token_hash: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          name: string
          scopes?: string[] | null
          token_hash: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          name?: string
          scopes?: string[] | null
          token_hash?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      assistant_faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          position: number
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          position?: number
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          position?: number
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown
          metadata: Json | null
          resource_id: string | null
          resource_type: string
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type: string
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      billing: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          invoice_url: string | null
          paid_at: string | null
          payment_method: string | null
          status: string
          subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          invoice_url?: string | null
          paid_at?: string | null
          payment_method?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          invoice_url?: string | null
          paid_at?: string | null
          payment_method?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_categories: {
        Row: {
          color: string
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_post_sections: {
        Row: {
          content: string
          created_at: string
          id: string
          image: string | null
          position: number
          post_id: string
          title: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          image?: string | null
          position?: number
          post_id: string
          title?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image?: string | null
          position?: number
          post_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_sections_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          attachment_name: string | null
          attachment_url: string | null
          author_id: string
          category_id: string | null
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean
          locale: string
          published_at: string | null
          secondary_image: string | null
          secondary_text: string | null
          show_attachment: boolean
          slug: string
          subtitle: string | null
          tags: string[] | null
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          attachment_name?: string | null
          attachment_url?: string | null
          author_id: string
          category_id?: string | null
          content: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          locale?: string
          published_at?: string | null
          secondary_image?: string | null
          secondary_text?: string | null
          show_attachment?: boolean
          slug: string
          subtitle?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          attachment_name?: string | null
          attachment_url?: string | null
          author_id?: string
          category_id?: string | null
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          locale?: string
          published_at?: string | null
          secondary_image?: string | null
          secondary_text?: string | null
          show_attachment?: boolean
          slug?: string
          subtitle?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      changelog_entries: {
        Row: {
          contributor_email: string | null
          contributor_name: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean
          title: string
          type: string
          version: string
        }
        Insert: {
          contributor_email?: string | null
          contributor_name?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          title: string
          type?: string
          version: string
        }
        Update: {
          contributor_email?: string | null
          contributor_name?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          title?: string
          type?: string
          version?: string
        }
        Relationships: []
      }
      collaboration_notifications: {
        Row: {
          actor_id: string | null
          actor_name: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          message: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      coupon_redemptions: {
        Row: {
          coupon_id: string
          id: string
          ip_address: string | null
          redeemed_at: string
          user_id: string
        }
        Insert: {
          coupon_id: string
          id?: string
          ip_address?: string | null
          redeemed_at?: string
          user_id: string
        }
        Update: {
          coupon_id?: string
          id?: string
          ip_address?: string | null
          redeemed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          current_uses: number
          description: string | null
          duration_days: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          description?: string | null
          duration_days?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          description?: string | null
          duration_days?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
        }
        Relationships: []
      }
      deadline_notification_settings: {
        Row: {
          created_at: string
          days_before: number
          id: string
          is_active: boolean
          message_template: string
          notify_collaborators: boolean
          notify_owner: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_before?: number
          id?: string
          is_active?: boolean
          message_template?: string
          notify_collaborators?: boolean
          notify_owner?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_before?: number
          id?: string
          is_active?: boolean
          message_template?: string
          notify_collaborators?: boolean
          notify_owner?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deadline_notifications_sent: {
        Row: {
          deadline_date: string
          id: string
          project_id: string
          sent_at: string
          user_id: string
        }
        Insert: {
          deadline_date: string
          id?: string
          project_id: string
          sent_at?: string
          user_id: string
        }
        Update: {
          deadline_date?: string
          id?: string
          project_id?: string
          sent_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deadline_notifications_sent_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          created_at: string
          decision: string | null
          description: string | null
          effort: number
          end_date: string | null
          hypothesis: string | null
          id: string
          impact: number
          insights_count: number
          position: number
          progress: number
          roadmap: string
          space_id: string | null
          start_date: string | null
          theme: string
          theme_color: string
          title: string
          updated_at: string
          user_id: string
          validation: string | null
        }
        Insert: {
          created_at?: string
          decision?: string | null
          description?: string | null
          effort?: number
          end_date?: string | null
          hypothesis?: string | null
          id?: string
          impact?: number
          insights_count?: number
          position?: number
          progress?: number
          roadmap?: string
          space_id?: string | null
          start_date?: string | null
          theme?: string
          theme_color?: string
          title: string
          updated_at?: string
          user_id: string
          validation?: string | null
        }
        Update: {
          created_at?: string
          decision?: string | null
          description?: string | null
          effort?: number
          end_date?: string | null
          hypothesis?: string | null
          id?: string
          impact?: number
          insights_count?: number
          position?: number
          progress?: number
          roadmap?: string
          space_id?: string | null
          start_date?: string | null
          theme?: string
          theme_color?: string
          title?: string
          updated_at?: string
          user_id?: string
          validation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ideas_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "kanban_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_columns: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          position: number
          space_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          position?: number
          space_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          position?: number
          space_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_columns_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "kanban_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_deals: {
        Row: {
          assignee_id: string | null
          assignee_name: string | null
          client_email: string | null
          client_name: string
          client_whatsapp: string | null
          color: string | null
          company_name: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          phase: string
          position: number
          priority: string
          progress: number
          revenue: number | null
          space_id: string | null
          start_date: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assignee_id?: string | null
          assignee_name?: string | null
          client_email?: string | null
          client_name: string
          client_whatsapp?: string | null
          color?: string | null
          company_name: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          phase?: string
          position?: number
          priority?: string
          progress?: number
          revenue?: number | null
          space_id?: string | null
          start_date?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assignee_id?: string | null
          assignee_name?: string | null
          client_email?: string | null
          client_name?: string
          client_whatsapp?: string | null
          color?: string | null
          company_name?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          phase?: string
          position?: number
          priority?: string
          progress?: number
          revenue?: number | null
          space_id?: string | null
          start_date?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_deals_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "kanban_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          deal_id: string | null
          description: string | null
          expense_date: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          deal_id?: string | null
          description?: string | null
          expense_date?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          deal_id?: string | null
          description?: string | null
          expense_date?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_expenses_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "kanban_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_payments: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          deal_id: string
          description: string | null
          id: string
          payment_date: string
          payment_method: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category?: string | null
          created_at?: string
          deal_id: string
          description?: string | null
          id?: string
          payment_date?: string
          payment_method?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          deal_id?: string
          description?: string | null
          id?: string
          payment_date?: string
          payment_method?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_payments_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "kanban_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_scheduled_messages: {
        Row: {
          created_at: string
          deal_id: string
          id: string
          message: string
          scheduled_date: string
          scheduled_time: string | null
          sent: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          id?: string
          message: string
          scheduled_date: string
          scheduled_time?: string | null
          sent?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          id?: string
          message?: string
          scheduled_date?: string
          scheduled_time?: string | null
          sent?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_scheduled_messages_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "kanban_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_spaces: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          position: number
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          position?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          position?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      kanban_task_checklist: {
        Row: {
          created_at: string
          deal_id: string
          id: string
          is_completed: boolean
          position: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          id?: string
          is_completed?: boolean
          position?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          id?: string
          is_completed?: boolean
          position?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_task_checklist_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "kanban_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      lovable_accounts: {
        Row: {
          admin_email: string | null
          anon_key: string | null
          color: string
          created_at: string
          credits: number
          credits_updated_at: string | null
          email: string
          id: string
          name: string
          notes: string | null
          service_role_key: string | null
          supabase_project_id: string | null
          supabase_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_email?: string | null
          anon_key?: string | null
          color?: string
          created_at?: string
          credits?: number
          credits_updated_at?: string | null
          email: string
          id?: string
          name: string
          notes?: string | null
          service_role_key?: string | null
          supabase_project_id?: string | null
          supabase_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_email?: string | null
          anon_key?: string | null
          color?: string
          created_at?: string
          credits?: number
          credits_updated_at?: string | null
          email?: string
          id?: string
          name?: string
          notes?: string | null
          service_role_key?: string | null
          supabase_project_id?: string | null
          supabase_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_receipts: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          receipt_url: string
          status: string
          subscription_id: string | null
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          receipt_url: string
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          receipt_url?: string
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_receipts_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      pix_keys: {
        Row: {
          created_at: string
          holder_city: string
          holder_name: string
          id: string
          is_default: boolean
          key_type: string
          key_value: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          holder_city?: string
          holder_name: string
          id?: string
          is_default?: boolean
          key_type?: string
          key_value: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          holder_city?: string
          holder_name?: string
          id?: string
          is_default?: boolean
          key_type?: string
          key_value?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          area_atuacao: string | null
          avatar_url: string | null
          cargo: string | null
          created_at: string
          email: string
          full_name: string | null
          has_connected_account: boolean
          has_created_project: boolean
          id: string
          onboarding_completed: boolean
          onboarding_step: number
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          area_atuacao?: string | null
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          has_connected_account?: boolean
          has_created_project?: boolean
          id?: string
          onboarding_completed?: boolean
          onboarding_step?: number
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          area_atuacao?: string | null
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          has_connected_account?: boolean
          has_created_project?: boolean
          id?: string
          onboarding_completed?: boolean
          onboarding_step?: number
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      project_checklists: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string
          id: string
          is_completed: boolean
          position: number
          project_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          position?: number
          project_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          position?: number
          project_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_checklists_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_code_snippets: {
        Row: {
          code: string
          created_at: string
          id: string
          language: string
          project_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          code?: string
          created_at?: string
          id?: string
          language?: string
          project_id: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          language?: string
          project_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_code_snippets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_collaborators: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          invited_by: string
          invited_email: string
          project_id: string
          role: Database["public"]["Enums"]["collaboration_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_by: string
          invited_email: string
          project_id: string
          role?: Database["public"]["Enums"]["collaboration_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_by?: string
          invited_email?: string
          project_id?: string
          role?: Database["public"]["Enums"]["collaboration_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_collaborators_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_files: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          notes: string | null
          project_id: string
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number
          file_type?: string
          id?: string
          notes?: string | null
          project_id: string
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          notes?: string | null
          project_id?: string
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_history: {
        Row: {
          action: string
          created_at: string
          field_name: string | null
          id: string
          new_value: string | null
          old_value: string | null
          project_id: string
          user_avatar: string | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          action: string
          created_at?: string
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          project_id: string
          user_avatar?: string | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          project_id?: string
          user_avatar?: string | null
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_stats: {
        Row: {
          avg_session_duration: number | null
          created_at: string
          id: string
          last_viewed_at: string | null
          project_id: string
          unique_visitors: number
          updated_at: string
          user_id: string
          views_count: number
        }
        Insert: {
          avg_session_duration?: number | null
          created_at?: string
          id?: string
          last_viewed_at?: string | null
          project_id: string
          unique_visitors?: number
          updated_at?: string
          user_id: string
          views_count?: number
        }
        Update: {
          avg_session_duration?: number | null
          created_at?: string
          id?: string
          last_viewed_at?: string | null
          project_id?: string
          unique_visitors?: number
          updated_at?: string
          user_id?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_stats_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tags: {
        Row: {
          created_at: string
          id: string
          project_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tags_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          account_id: string
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          is_favorite: boolean
          last_accessed_at: string | null
          name: string
          notes: string | null
          progress: number
          repository_url: string | null
          screenshot: string | null
          status: string
          type: string
          updated_at: string
          url: string | null
          user_id: string
          view_count: number
        }
        Insert: {
          account_id: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean
          last_accessed_at?: string | null
          name: string
          notes?: string | null
          progress?: number
          repository_url?: string | null
          screenshot?: string | null
          status?: string
          type?: string
          updated_at?: string
          url?: string | null
          user_id: string
          view_count?: number
        }
        Update: {
          account_id?: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean
          last_accessed_at?: string | null
          name?: string
          notes?: string | null
          progress?: number
          repository_url?: string | null
          screenshot?: string | null
          status?: string
          type?: string
          updated_at?: string
          url?: string | null
          user_id?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "projects_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "lovable_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "lovable_accounts_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          accepted_at: string | null
          brand_color: string
          brand_secondary_color: string
          certificate_file_name: string | null
          certificate_file_url: string | null
          client_company: string | null
          client_email: string | null
          client_logo_url: string | null
          client_name: string
          client_phone: string | null
          client_signature_type: string | null
          client_signature_url: string | null
          client_signed_at: string | null
          client_signed_ip: string | null
          client_signer_document: string | null
          client_signer_name: string | null
          company_address: string | null
          company_email: string | null
          company_logo_url: string | null
          company_name: string | null
          company_phone: string | null
          company_signature_type: string | null
          company_signature_url: string | null
          company_signed_at: string | null
          company_signed_ip: string | null
          company_signer_document: string | null
          company_signer_name: string | null
          created_at: string
          deadline_days: number | null
          description: string | null
          discount: number
          id: string
          notes: string | null
          payment_conditions: string | null
          proposal_title: string
          rejected_at: string | null
          services: Json
          share_token: string | null
          status: string
          total_value: number
          updated_at: string
          user_id: string
          validity_days: number | null
          viewed_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          brand_color?: string
          brand_secondary_color?: string
          certificate_file_name?: string | null
          certificate_file_url?: string | null
          client_company?: string | null
          client_email?: string | null
          client_logo_url?: string | null
          client_name: string
          client_phone?: string | null
          client_signature_type?: string | null
          client_signature_url?: string | null
          client_signed_at?: string | null
          client_signed_ip?: string | null
          client_signer_document?: string | null
          client_signer_name?: string | null
          company_address?: string | null
          company_email?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_signature_type?: string | null
          company_signature_url?: string | null
          company_signed_at?: string | null
          company_signed_ip?: string | null
          company_signer_document?: string | null
          company_signer_name?: string | null
          created_at?: string
          deadline_days?: number | null
          description?: string | null
          discount?: number
          id?: string
          notes?: string | null
          payment_conditions?: string | null
          proposal_title?: string
          rejected_at?: string | null
          services?: Json
          share_token?: string | null
          status?: string
          total_value?: number
          updated_at?: string
          user_id: string
          validity_days?: number | null
          viewed_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          brand_color?: string
          brand_secondary_color?: string
          certificate_file_name?: string | null
          certificate_file_url?: string | null
          client_company?: string | null
          client_email?: string | null
          client_logo_url?: string | null
          client_name?: string
          client_phone?: string | null
          client_signature_type?: string | null
          client_signature_url?: string | null
          client_signed_at?: string | null
          client_signed_ip?: string | null
          client_signer_document?: string | null
          client_signer_name?: string | null
          company_address?: string | null
          company_email?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_signature_type?: string | null
          company_signature_url?: string | null
          company_signed_at?: string | null
          company_signed_ip?: string | null
          company_signer_document?: string | null
          company_signer_name?: string | null
          created_at?: string
          deadline_days?: number | null
          description?: string | null
          discount?: number
          id?: string
          notes?: string | null
          payment_conditions?: string | null
          proposal_title?: string
          rejected_at?: string | null
          services?: Json
          share_token?: string | null
          status?: string
          total_value?: number
          updated_at?: string
          user_id?: string
          validity_days?: number | null
          viewed_at?: string | null
        }
        Relationships: []
      }
      signup_ips: {
        Row: {
          created_at: string
          id: string
          ip_address: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          features: Json
          id: string
          is_trial: boolean | null
          max_accounts: number
          max_projects: number
          payment_receipt_url: string | null
          payment_status: string | null
          payment_verified_at: string | null
          payment_verified_by: string | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          started_at: string
          subscription_type: string
          trial_ends_at: string | null
          trial_started_at: string | null
          updated_at: string
          user_id: string
          user_status: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          features?: Json
          id?: string
          is_trial?: boolean | null
          max_accounts?: number
          max_projects?: number
          payment_receipt_url?: string | null
          payment_status?: string | null
          payment_verified_at?: string | null
          payment_verified_by?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          started_at?: string
          subscription_type?: string
          trial_ends_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
          user_id: string
          user_status?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          features?: Json
          id?: string
          is_trial?: boolean | null
          max_accounts?: number
          max_projects?: number
          payment_receipt_url?: string | null
          payment_status?: string | null
          payment_verified_at?: string | null
          payment_verified_by?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          started_at?: string
          subscription_type?: string
          trial_ends_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
          user_id?: string
          user_status?: string
        }
        Relationships: []
      }
      system_config: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_files: {
        Row: {
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          mime_type: string | null
          module: string
          module_item_id: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number
          file_type?: string
          id?: string
          mime_type?: string | null
          module?: string
          module_item_id?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          mime_type?: string | null
          module?: string
          module_item_id?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wordpress_connections: {
        Row: {
          app_password: string
          created_at: string
          id: string
          last_sync_at: string | null
          site_name: string | null
          site_url: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          app_password: string
          created_at?: string
          id?: string
          last_sync_at?: string | null
          site_name?: string | null
          site_url: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          app_password?: string
          created_at?: string
          id?: string
          last_sync_at?: string | null
          site_name?: string | null
          site_url?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_users_view: {
        Row: {
          accounts_count: number | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          is_trial: boolean | null
          max_accounts: number | null
          max_projects: number | null
          onboarding_completed: boolean | null
          plan: Database["public"]["Enums"]["subscription_plan"] | null
          projects_count: number | null
          role: Database["public"]["Enums"]["app_role"] | null
          subscription_expires_at: string | null
          subscription_started_at: string | null
          subscription_type: string | null
          trial_ends_at: string | null
          user_id: string | null
          user_status: string | null
        }
        Relationships: []
      }
      lovable_accounts_safe: {
        Row: {
          admin_email: string | null
          anon_key_masked: string | null
          color: string | null
          created_at: string | null
          credits: number | null
          credits_updated_at: string | null
          email: string | null
          has_anon_key: boolean | null
          has_service_role_key: boolean | null
          id: string | null
          name: string | null
          notes: string | null
          service_role_key_masked: string | null
          supabase_project_id: string | null
          supabase_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_email?: string | null
          anon_key_masked?: never
          color?: string | null
          created_at?: string | null
          credits?: number | null
          credits_updated_at?: string | null
          email?: string | null
          has_anon_key?: never
          has_service_role_key?: never
          id?: string | null
          name?: string | null
          notes?: string | null
          service_role_key_masked?: never
          supabase_project_id?: string | null
          supabase_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_email?: string | null
          anon_key_masked?: never
          color?: string | null
          created_at?: string | null
          credits?: number | null
          credits_updated_at?: string | null
          email?: string | null
          has_anon_key?: never
          has_service_role_key?: never
          id?: string | null
          name?: string | null
          notes?: string | null
          service_role_key_masked?: never
          supabase_project_id?: string | null
          supabase_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_auth_email: { Args: never; Returns: string }
      get_user_project_count: { Args: never; Returns: number }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_stats_summary: { Args: never; Returns: Json }
      has_account_access: {
        Args: { _account_id: string; _user_id: string }
        Returns: boolean
      }
      has_project_access: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_account_owner: {
        Args: { _account_id: string; _user_id: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_project_owner: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      register_changelog: {
        Args: {
          _bump?: string
          _contributor_name?: string
          _description?: string
          _title: string
          _type?: string
        }
        Returns: string
      }
      update_system_version: {
        Args: {
          new_changelog?: string
          new_release_name?: string
          new_version: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "viewer" | "collaborator"
      collaboration_role: "viewer" | "editor" | "admin"
      subscription_plan: "free" | "pro" | "business"
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
      app_role: ["admin", "viewer", "collaborator"],
      collaboration_role: ["viewer", "editor", "admin"],
      subscription_plan: ["free", "pro", "business"],
    },
  },
} as const
