import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, UserRole, TFAMethod } from "@/types/auth";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import UserTable from "./UserTable";
import UserDialogs from "./UserDialogs";
import UserHeader from "./UserHeader";
import AccessDenied from "./AccessDenied";
import { validatePassword } from "@/utils/passwordValidation";

const UsersManagement: React.FC = () => {
  const { 
    authState, 
    createUser, 
    updateUser, 
    deleteUser, 
    getUserList,
    updateUserTFA 
  } = useAuth();
  
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    apellido: "",
    fullName: "",
    email: "",
    role: "audit" as UserRole, // Rol por defecto para nuevos usuarios
    tfa_habilitado: false,
    tfa_metodo: "app" as TFAMethod,
    mustChangePassword: true, // Por defecto, requerir cambio de contraseña
  });
  const [editUserData, setEditUserData] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  
  // Determinar los roles disponibles según el rol del usuario actual
  const getAvailableRoles = useCallback(() => {
    if (authState.currentUser?.role === 'root') {
      return ['root', 'admin', 'audit'];
    } else if (authState.currentUser?.role === 'admin') {
      return ['admin', 'audit'];
    }
    return ['audit'];
  }, [authState.currentUser?.role]);
  
  // Filtrar usuarios según permisos
  const getFilteredUsers = useCallback((allUsers: User[]) => {
    // Mostrar todos los usuarios independientemente del rol del usuario actual
    // para asegurar que la gestión de usuarios muestre todos los registros en la BD
    return allUsers;
    
    /* Comentado para permitir ver todos los usuarios
    if (authState.currentUser?.role === 'root') {
      // Usuario root ve a todos
      return allUsers;
    } else if (authState.currentUser?.role === 'admin') {
      // Admin no ve a usuarios root y solo se ve a sí mismo entre los admin
      return allUsers.filter(user => 
        user.role !== 'root' && 
        (user.role !== 'admin' || user.id === authState.currentUser?.id)
      );
    }
    // Por defecto no debería llegar aquí, pero por seguridad retornamos array vacío
    return [];
    */
  }, []);
  
  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const userList = await getUserList();
      if (!Array.isArray(userList)) {
        throw new Error('Invalid user list format');
      }
      
      // Aplicar filtros según el rol del usuario actual
      const filteredUsers = getFilteredUsers(userList);
      setUsers(filteredUsers);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error("Error al cargar usuarios:", errorMessage);
      toast.error(`Error al cargar la lista de usuarios: ${errorMessage}`);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [getUserList, getFilteredUsers]);

  useEffect(() => {
    if (authState.currentUser?.role === 'admin' || authState.currentUser?.role === 'root') {
      void loadUsers();
    }
  }, [authState.currentUser?.role, loadUsers]);
  
  const resetNewUserForm = () => {
    // Establecer el rol por defecto según los permisos
    const defaultRole = authState.currentUser?.role === 'root' ? 'admin' : 'audit';
    
    setNewUserData({
      username: "",
      password: "",
      confirmPassword: "",
      nombre: "",
      apellido: "",
      fullName: "",
      email: "",
      role: defaultRole as UserRole,
      tfa_habilitado: false,
      tfa_metodo: "app",
      mustChangePassword: true, // Por defecto, requerir cambio de contraseña
    });
  };
  
  const handleAddInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditUserData((prev) => ({
      ...prev!,
      [name]: value,
    }));
  };
  
  const handleAddRoleChange = (value: string) => {
    const role = value as UserRole;
    setNewUserData((prev) => ({
      ...prev,
      role,
    }));
  };
  
  const handleEditRoleChange = (value: string) => {
    const role = value as UserRole;
    setEditUserData((prev) => ({
      ...prev!,
      role,
    }));
  };

  const handleEditTfaChange = (enabled: boolean) => {
    setEditUserData((prev) => ({
      ...prev!,
      tfa_habilitado: enabled,
      // Si se deshabilita 2FA, también reiniciamos el método
      tfa_metodo: enabled ? prev!.tfa_metodo : null,
    }));
  };

  const handleEditTfaMethodChange = (method: TFAMethod) => {
    setEditUserData((prev) => ({
      ...prev!,
      tfa_metodo: method,
    }));
  };

  const handleAddMustChangePasswordChange = (required: boolean) => {
    setNewUserData((prev) => ({
      ...prev,
      mustChangePassword: required,
    }));
  };
  
  const handleAddUser = async () => {
    try {
      if (!validateNewUserData(newUserData)) {
        return;
      }
  
      const userData = {
        username: newUserData.username.trim().toLowerCase(), // Normalizar username
        password: newUserData.password,
        nombre: newUserData.nombre.trim(),
        apellido: newUserData.apellido.trim(),
        fullName: `${newUserData.nombre.trim()} ${newUserData.apellido.trim()}`,
        email: newUserData.email.trim().toLowerCase(), // Normalizar email
        role: newUserData.role,
        tfa_habilitado: false, // Por defecto deshabilitado para nuevos usuarios
        activo: true,
        intentos_fallidos: 0,
        mustChangePassword: newUserData.mustChangePassword,
        password_changed: !newUserData.mustChangePassword, // Si no se requiere cambio, marcar como ya cambiada
      };
  
      // Verificar si el usuario ya existe en la lista actual
      const userExists = users.some(
        user => user.username === userData.username || user.email === userData.email
      );
  
      if (userExists) {
        toast.error("Ya existe un usuario con ese nombre de usuario o email");
        return;
      }
  
      const success = await createUser(userData);
      
      if (success) {
        toast.success('Usuario creado exitosamente');
        setIsAddUserDialogOpen(false);
        resetNewUserForm();
        await loadUsers();
      } else {
        throw new Error("No se pudo crear el usuario");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error("Error al crear usuario:", errorMessage);
      toast.error(`Error al crear usuario: ${errorMessage}`);
    }
  };
  
  const validateNewUserData = (data: typeof newUserData): boolean => {
    const errors: string[] = [];
  
    if (!data.username?.trim()) errors.push("El nombre de usuario es obligatorio");
    if (!data.password) errors.push("La contraseña es obligatoria");
    if (!data.nombre?.trim()) errors.push("El nombre es obligatorio");
    if (!data.apellido?.trim()) errors.push("El apellido es obligatorio");
    if (!data.email?.trim()) errors.push("El email es obligatorio");
  
    if (data.username?.trim().length < 3) {
      errors.push("El nombre de usuario debe tener al menos 3 caracteres");
    }
  
    if (data.password !== data.confirmPassword) {
      errors.push("Las contraseñas no coinciden");
    }
  
    // Nueva validación robusta de contraseñas
    if (data.password) {
      const passwordValidation = validatePassword(data.password);
      if (!passwordValidation.valid) {
        // Agregamos solo el primer error de la validación para no sobrecargar al usuario
        errors.push(passwordValidation.errors[0]);
      }
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email.trim())) {
      errors.push("El formato del email no es válido");
    }
  
    if (errors.length > 0) {
      toast.error(errors[0]); // Mostrar el primer error
      return false;
    }
  
    return true;
  };
  
  const handleEditUser = async () => {
    if (!editUserData) return;
    
    if (!validateEditUserData(editUserData)) {
      return;
    }

    // Prevenir cambios en el rol root
    if (editUserData.role === 'root' && authState.currentUser?.role !== 'root') {
      toast.error("Solo el usuario root puede modificar usuarios root");
      return;
    }

    // Prevenir que usuarios no root asignen el rol root
    if (authState.currentUser?.role !== 'root' && editUserData.role === 'root') {
      toast.error("Solo el usuario root puede asignar el rol root");
      return;
    }

    const dataToUpdate: Partial<User> = {
      nombre: editUserData.nombre?.trim(),
      apellido: editUserData.apellido?.trim(),
      fullName: editUserData.fullName.trim(),
      email: editUserData.email.trim(),
      role: editUserData.role,
      activo: editUserData.activo !== undefined ? editUserData.activo : true,
    };
    
    try {
      // Primero actualizamos los datos básicos del usuario
      const success = await updateUser(editUserData.id, dataToUpdate);
      
      if (success) {
        // Si hay cambios en la configuración 2FA, actualizamos eso también
        if (editUserData.tfa_habilitado !== undefined) {
          await updateUserTFA(
            editUserData.id, 
            editUserData.tfa_habilitado, 
            editUserData.tfa_metodo || 'app'
          );
        }
        
        setIsEditUserDialogOpen(false);
        setEditUserData(null);
        await loadUsers();
        toast.success('Usuario actualizado exitosamente');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error("Error al actualizar usuario:", errorMessage);
      toast.error(`Error al actualizar usuario: ${errorMessage}`);
    }
  };

  const validateEditUserData = (data: User): boolean => {
    if (!data.nombre || !data.apellido || !data.email) {
      toast.error("El nombre, apellido y email son obligatorios");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      toast.error("El formato del email no es válido");
      return false;
    }

    return true;
  };

  const handleDeleteUser = async (userId: string) => {
    // Verificar si el usuario a eliminar es root
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.role === 'root') {
      toast.error("No se puede eliminar un usuario root");
      return;
    }

    if (userId === authState.currentUser?.id) {
      toast.error("No puedes eliminar tu propia cuenta");
      return;
    }

    // Verificar permisos basados en roles
    if (authState.currentUser?.role === 'admin') {
      const targetUser = users.find(u => u.id === userId);
      if (targetUser?.role === 'admin') {
        toast.error("Los administradores no pueden eliminar otros administradores");
        return;
      }
    }

    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await deleteUser(userId);
        await loadUsers();
        toast.success('Usuario eliminado exitosamente');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error("Error al eliminar usuario:", errorMessage);
        toast.error(`Error al eliminar usuario: ${errorMessage}`);
      }
    }
  };
  
  const openEditDialog = (user: User) => {
    setEditUserData({
      ...user,
      password: "",
    });
    setIsEditUserDialogOpen(true);
  };
  
  if (authState.currentUser?.role !== 'admin' && authState.currentUser?.role !== 'root') {
    return <AccessDenied />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <UserHeader title="Gestión de Usuarios" />
        
        <Button
          onClick={() => setIsAddUserDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          Añadir Usuario
        </Button>
        
        <UserDialogs 
          isMobile={isMobile}
          isAddDialogOpen={isAddUserDialogOpen}
          isEditDialogOpen={isEditUserDialogOpen}
          setIsAddDialogOpen={setIsAddUserDialogOpen}
          setIsEditDialogOpen={setIsEditUserDialogOpen}
          newUserData={newUserData}
          editUserData={editUserData}
          currentUserId={authState.currentUser?.id}
          onAddInputChange={handleAddInputChange}
          onAddRoleChange={handleAddRoleChange}
          onEditInputChange={handleEditInputChange}
          onEditRoleChange={handleEditRoleChange}
          onEditTfaChange={handleEditTfaChange}
          onEditTfaMethodChange={handleEditTfaMethodChange}
          onAddMustChangePasswordChange={handleAddMustChangePasswordChange}
          onAddUser={handleAddUser}
          onEditUser={handleEditUser}
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
          <CardDescription>
            {users.length} usuarios registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserTable 
            users={users}
            currentUserId={authState.currentUser?.id}
            onEditUser={openEditDialog}
            onDeleteUser={handleDeleteUser}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersManagement;
