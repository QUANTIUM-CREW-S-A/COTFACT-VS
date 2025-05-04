export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      company_info: {
        Row: {
          address: Json | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          tax_id: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: Json | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: Json | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: Json | null
          created_at: string
          created_by: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          tax_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: Json | null
          created_at?: string
          created_by: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: Json | null
          created_at?: string
          created_by?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          customer: Json
          date: string
          document_number: string
          expire_date: string | null
          id: string
          items: Json
          notes: string | null
          status: string
          terms_conditions: string | null
          title: string
          total: number
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer: Json
          date: string
          document_number: string
          expire_date?: string | null
          id?: string
          items: Json
          notes?: string | null
          status?: string
          terms_conditions?: string | null
          title: string
          total: number
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer?: Json
          date?: string
          document_number?: string
          expire_date?: string | null
          id?: string
          items?: Json
          notes?: string | null
          status?: string
          terms_conditions?: string | null
          title?: string
          total?: number
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          created_at: string
          details: Json
          id: string
          is_default: boolean | null
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details: Json
          id?: string
          is_default?: boolean | null
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json
          id?: string
          is_default?: boolean | null
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          last_login: string | null
          role: string
          two_factor_enabled: boolean
          two_factor_secret: string | null
          username: string
          // Campos nuevos
          nombre: string | null
          apellido: string | null
          tfa_habilitado: boolean
          tfa_metodo: string | null
          tfa_backup_codes: string | null
          tfa_ultimo_uso: string | null
          fecha_creacion: string
          ultimo_acceso: string | null
          activo: boolean
          token_recuperacion: string | null
          expiracion_token: string | null
          intentos_fallidos: number
          bloqueado_hasta: string | null
          creado_por: string | null
          ultima_modificacion: string
          modificado_por: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          last_login?: string | null
          role?: string
          two_factor_enabled?: boolean
          two_factor_secret?: string | null
          username: string
          // Campos nuevos
          nombre?: string | null
          apellido?: string | null
          tfa_habilitado?: boolean
          tfa_metodo?: string | null
          tfa_backup_codes?: string | null
          tfa_ultimo_uso?: string | null
          fecha_creacion?: string
          ultimo_acceso?: string | null
          activo?: boolean
          token_recuperacion?: string | null
          expiracion_token?: string | null
          intentos_fallidos?: number
          bloqueado_hasta?: string | null
          creado_por?: string | null
          ultima_modificacion?: string
          modificado_por?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          last_login?: string | null
          role?: string
          two_factor_enabled?: boolean
          two_factor_secret?: string | null
          username?: string
          // Campos nuevos
          nombre?: string | null
          apellido?: string | null
          tfa_habilitado?: boolean
          tfa_metodo?: string | null
          tfa_backup_codes?: string | null
          tfa_ultimo_uso?: string | null
          fecha_creacion?: string
          ultimo_acceso?: string | null
          activo?: boolean
          token_recuperacion?: string | null
          expiracion_token?: string | null
          intentos_fallidos?: number
          bloqueado_hasta?: string | null
          creado_por?: string | null
          ultima_modificacion?: string
          modificado_por?: string | null
        }
        Relationships: []
      }
      template_preferences: {
        Row: {
          font_family: string
          id: string
          primary_color: string
          secondary_color: string
          show_logo: boolean
          show_signature: boolean
          signature_image: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          font_family?: string
          id?: string
          primary_color?: string
          secondary_color?: string
          show_logo?: boolean
          show_signature?: boolean
          signature_image?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          font_family?: string
          id?: string
          primary_color?: string
          secondary_color?: string
          show_logo?: boolean
          show_signature?: boolean
          signature_image?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
