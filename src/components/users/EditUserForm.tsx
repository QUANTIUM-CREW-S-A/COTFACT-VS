
import React from "react";
import { User, UserRole } from "@/types/auth";
import UserForm from "./UserForm";
import { Button } from "@/components/ui/button";

interface EditUserFormProps {
  user: Omit<User, 'password' | 'twoFactorSecret'>;
  onSubmit: (data: User) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const EditUserForm: React.FC<EditUserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  // Add all required fields to userData to match the UserForm interface
  const userData = {
    ...user,
    password: '',
    role: user.role || 'user',
    username: user.username || '',
    fullName: user.fullName || '',
    email: user.email || '',
  };

  return (
    <div className="space-y-4">
      <UserForm 
        isEditMode={true}
        userData={userData}
        onInputChange={() => {}} // This will be overridden by UserDialogs
        onRoleChange={() => {}} // This will be overridden by UserDialogs
      />
      
      <div className="flex justify-end">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default EditUserForm;
