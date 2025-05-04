// Authentication related types

export type UserRole = 'root' | 'admin' | 'audit';
export type TFAMethod = 'app' | 'sms' | 'email' | null;

export interface User {
  id: string;
  username: string;
  password?: string;
  nombre: string;
  apellido: string;
  fullName: string; // Mantener para compatibilidad
  email: string;
  role: UserRole;
  
  // Campos para autenticación de dos factores (2FA)
  twoFactorEnabled: boolean; // Mantener para compatibilidad
  twoFactorSecret?: string; // Mantener para compatibilidad
  tfa_habilitado: boolean;
  tfa_metodo: TFAMethod;
  tfa_secret?: string;
  tfa_backup_codes?: string;
  tfa_ultimo_uso?: string;
  
  // Campos de auditoría
  createdAt: string;
  lastLogin?: string;
  fecha_creacion: string;
  ultimo_acceso?: string;
  activo: boolean;
  intentos_fallidos: number;
  bloqueado_hasta?: string;
  creado_por?: string;
  ultima_modificacion: string;
  modificado_por?: string;
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  verifying2FA: boolean;
  pendingUser?: Omit<User, 'twoFactorSecret' | 'tfa_secret' | 'tfa_backup_codes'>;
}
