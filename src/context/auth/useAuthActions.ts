
import { User } from "@/types/auth";
import { AuthState } from "./types";
import { Dispatch, SetStateAction } from "react";
import { useAuthLogin } from "./hooks/useAuthLogin";
import { useUserManagement } from "./hooks/useUserManagement";

interface AuthActionsProps {
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
  authState: AuthState;
  setAuthState: Dispatch<SetStateAction<AuthState>>;
}

export const useAuthActions = ({ authState, setAuthState }: AuthActionsProps) => {
  const { login, logout } = useAuthLogin({ authState, setAuthState });
  const { createUser, updateUser, deleteUser, getUserList, seedTestUsers } = useUserManagement({ authState, setAuthState });

  return {
    login,
    logout,
    createUser,
    updateUser,
    deleteUser,
    getUserList,
    seedTestUsers
  };
};
