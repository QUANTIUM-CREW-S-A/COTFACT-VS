import React from "react";
import { User, UserRole, TFAMethod } from "@/types/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { UserPlus, Plus } from "lucide-react";
import UserForm from "./UserForm";

interface UserDialogsProps {
  isMobile: boolean;
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  setIsEditDialogOpen: (open: boolean) => void;
  newUserData: {
    username: string;
    password: string;
    confirmPassword: string;
    nombre?: string;
    apellido?: string;
    fullName: string;
    email: string;
    role: UserRole;
    tfa_habilitado?: boolean;
    tfa_metodo?: TFAMethod;
    mustChangePassword?: boolean;
  };
  editUserData: User | null;
  currentUserId?: string;
  onAddInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddRoleChange: (value: string) => void;
  onEditInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditRoleChange: (value: string) => void;
  onEditTfaChange?: (enabled: boolean) => void;
  onEditTfaMethodChange?: (method: TFAMethod) => void;
  onAddMustChangePasswordChange?: (required: boolean) => void;
  onAddUser: () => void;
  onEditUser: () => void;
}

export const UserDialogs: React.FC<UserDialogsProps> = ({
  isMobile,
  isAddDialogOpen,
  isEditDialogOpen,
  setIsAddDialogOpen,
  setIsEditDialogOpen,
  newUserData,
  editUserData,
  currentUserId,
  onAddInputChange,
  onAddRoleChange,
  onEditInputChange,
  onEditRoleChange,
  onEditTfaChange,
  onEditTfaMethodChange,
  onAddMustChangePasswordChange,
  onAddUser,
  onEditUser
}) => {
  return (
    <>
      {/* Add User Dialog/Drawer */}
      {isMobile ? (
        <Drawer open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DrawerContent className="px-4 pb-4">
            <DrawerHeader>
              <DrawerTitle>Crear Nuevo Usuario</DrawerTitle>
              <DrawerDescription>
                Completa el formulario para crear un nuevo usuario.
              </DrawerDescription>
            </DrawerHeader>
            <div className="py-4">
              <UserForm 
                isEditMode={false}
                userData={newUserData} 
                currentUserId={currentUserId}
                onInputChange={onAddInputChange} 
                onRoleChange={onAddRoleChange}
                onMustChangePasswordChange={onAddMustChangePasswordChange}
              />
            </div>
            <DrawerFooter className="pt-4">
              <DrawerClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DrawerClose>
              <Button onClick={onAddUser}>
                <UserPlus className="mr-2 h-4 w-4" />
                Crear Usuario
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Completa el formulario para crear un nuevo usuario.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <UserForm 
                isEditMode={false}
                userData={newUserData} 
                currentUserId={currentUserId}
                onInputChange={onAddInputChange} 
                onRoleChange={onAddRoleChange}
                onMustChangePasswordChange={onAddMustChangePasswordChange}
              />
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={onAddUser}>
                <UserPlus className="mr-2 h-4 w-4" />
                Crear Usuario
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit User Dialog/Drawer */}
      {editUserData && (
        isMobile ? (
          <Drawer open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DrawerContent className="px-4 pb-4">
              <DrawerHeader>
                <DrawerTitle>Editar Usuario</DrawerTitle>
                <DrawerDescription>
                  Actualiza la información del usuario.
                </DrawerDescription>
              </DrawerHeader>
              <div className="py-4">
                <UserForm 
                  isEditMode={true}
                  userData={editUserData}
                  currentUserId={currentUserId}
                  onInputChange={onEditInputChange}
                  onRoleChange={onEditRoleChange}
                  onTfaChange={onEditTfaChange}
                  onTfaMethodChange={onEditTfaMethodChange}
                />
              </div>
              <DrawerFooter className="pt-4">
                <DrawerClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DrawerClose>
                <Button onClick={onEditUser}>
                  Guardar Cambios
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Editar Usuario</DialogTitle>
                <DialogDescription>
                  Actualiza la información del usuario.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <UserForm 
                  isEditMode={true}
                  userData={editUserData}
                  currentUserId={currentUserId}
                  onInputChange={onEditInputChange}
                  onRoleChange={onEditRoleChange}
                  onTfaChange={onEditTfaChange}
                  onTfaMethodChange={onEditTfaMethodChange}
                />
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={onEditUser}>
                  Guardar Cambios
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      )}
    </>
  );
};

export default UserDialogs;
