import { useState } from "react";
import { User } from "@/types/auth";

// Default root user
const defaultRootUser: User = {
  id: "admin-1",
  username: "admin",
  password: "admin123", // In a real app, this would be hashed
  fullName: "Administrator",
  email: "admin@example.com",
  role: "root",
  createdAt: new Date().toISOString(),
  lastLogin: null,
  twoFactorEnabled: false
};

export const useAuthStorage = () => {
  // Initialize users with the default root user if no users exist in localStorage
  const initializeUsers = () => {
    const storedUsers = localStorage.getItem("cotfact_users");
    if (storedUsers) {
      // Migrate old users to new format if needed
      const parsedUsers = JSON.parse(storedUsers);
      const migratedUsers = parsedUsers.map((user: any) => ({
        ...user,
        // Ensure the original admin keeps root role
        role: user.id === "admin-1" ? "root" : user.role,
        twoFactorEnabled: user.twoFactorEnabled || false
      }));
      return migratedUsers;
    }
    // If no users exist, create default root user
    const users = [defaultRootUser];
    localStorage.setItem("cotfact_users", JSON.stringify(users));
    return users;
  };

  // Initialize auth state from localStorage if available
  const initializeAuthState = () => {
    const storedAuthState = localStorage.getItem("cotfact_auth");
    if (storedAuthState) {
      const parsedState = JSON.parse(storedAuthState);
      // Asegurar que el rol root se mantenga para el usuario original
      if (parsedState.currentUser?.id === "admin-1") {
        parsedState.currentUser.role = "root";
      }
      return {
        ...parsedState,
        verifying2FA: false,
        pendingUser: null
      };
    }
    return {
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      verifying2FA: false,
      pendingUser: null
    };
  };

  const [users, setUsers] = useState(initializeUsers());

  return {
    users,
    setUsers,
    initializeAuthState
  };
};
