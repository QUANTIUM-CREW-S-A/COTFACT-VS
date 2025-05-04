
import React from "react";
import { UserRole } from "@/types/auth";
import UserForm from "./UserForm";

interface AddUserFormData {
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  email: string;
  role: UserRole;
}

interface AddUserFormProps {
  formData: AddUserFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRoleChange: (value: string) => void;
}

const AddUserForm: React.FC<AddUserFormProps> = ({ 
  formData, 
  onInputChange, 
  onRoleChange 
}) => {
  return (
    <UserForm
      isEditMode={false}
      userData={formData}
      onInputChange={onInputChange}
      onRoleChange={onRoleChange}
    />
  );
};

export default AddUserForm;
