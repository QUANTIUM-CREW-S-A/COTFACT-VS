export interface User {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
}

export type UserRole = 'admin' | 'user';

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  verifying2FA: boolean;
  pendingUser?: Omit<User, 'twoFactorSecret'>;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string;
          email: string;
          role: UserRole;
          created_at: string;
          last_login: string | null;
          two_factor_enabled: boolean;
          two_factor_secret: string | null;
        };
        Insert: {
          id: string;
          username: string;
          full_name: string;
          email: string;
          role?: UserRole;
          created_at?: string;
          last_login?: string | null;
          two_factor_enabled?: boolean;
          two_factor_secret?: string | null;
        };
        Update: {
          username?: string;
          full_name?: string;
          email?: string;
          role?: UserRole;
          last_login?: string | null;
          two_factor_enabled?: boolean;
          two_factor_secret?: string | null;
        };
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          type: 'quote' | 'invoice';
          document_number: string;
          title: string;
          customer: Record<string, any>;
          items: Record<string, any>;
          total: number;
          status: string;
          date: string;
          expire_date?: string;
          notes?: string;
          terms_conditions?: string;
          created_at: string;
          updated_at: string;
        };
      };
      customers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email?: string;
          phone?: string;
          address?: Record<string, any>;
          tax_id?: string;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
      };
      company_info: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          logo_url?: string;
          address?: Record<string, any>;
          tax_id?: string;
          phone?: string;
          email?: string;
          website?: string;
          updated_at: string;
        };
      };
      template_preferences: {
        Row: {
          id: string;
          user_id: string;
          primary_color: string;
          secondary_color: string;
          font_family: string;
          show_logo: boolean;
          show_signature: boolean;
          signature_image?: string;
          updated_at: string;
        };
      };
      payment_methods: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          details: Record<string, any>;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}
