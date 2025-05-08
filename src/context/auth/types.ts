// src/context/auth/types.ts

import { User, UserRole } from "@/types/auth";

export interface AuthContextType {
  authState: AuthState;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'twoFactorEnabled' | 'twoFactorSecret'>) => Promise<boolean>;
  updateUser: (id: string, userData: Partial<User>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  getUserList: () => Promise<User[]>;
  verify2FACode: (code: string) => boolean;
  generate2FASecret: (userId: string) => { secret: string; url: string };
  enable2FA: (userId: string, code: string) => boolean;
  disable2FA: (userId: string) => boolean;
  seedTestUsers?: () => Promise<void>;  // Add this optional method
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  verifying2FA: boolean;
  pendingUser?: Omit<User, 'twoFactorSecret'>;
  passwordChangeRequired?: boolean; // Añadida esta propiedad
}
