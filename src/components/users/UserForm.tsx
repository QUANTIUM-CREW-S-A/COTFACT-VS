// src/components/users/UserForm.tsx

import React, { useState, useCallback } from "react";
import { User, UserRole, TFAMethod } from "@/types/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { UserIcon, KeyRound, UserCheck, AtSign, ShieldCheck, Shield } from "lucide-react";
import { useAuth } from "@/context/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface UserFormProps {
  isEditMode: boolean;
  userData: {
    username: string;
    password?: string;
    confirmPassword?: string;
    nombre?: string;
    apellido?: string;
    fullName: string;
    email: string;
    role: UserRole;
    tfa_habilitado?: boolean;
    tfa_metodo?: TFAMethod;
    id?: string;
  };
  currentUserId?: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRoleChange: (value: string) => void;
  onTfaChange?: (enabled: boolean) => void;
  onTfaMethodChange?: (method: TFAMethod) => void;
}

const UserForm: React.FC<UserFormProps> = ({ 
  isEditMode, 
  userData, 
  currentUserId, 
  onInputChange, 
  onRoleChange,
  onTfaChange,
  onTfaMethodChange
}) => {
  const { authState } = useAuth();
  const isCurrentUser = isEditMode && userData.id && currentUserId === userData.id;
  const isRoot = userData.role === 'root';
  const isAdmin = userData.role === 'admin';
  const [activeTab, setActiveTab] = useState("info-basica");
  
  // Verificar permisos para modificar roles
  const canModifyRole = !isCurrentUser && (
    authState.currentUser?.role === 'root' || 
    (authState.currentUser?.role === 'admin' && userData.role !== 'root' && userData.role !== 'admin')
  );
  
  // Función para obtener los roles disponibles según el rol del usuario actual
  const getAvailableRoles = useCallback(() => {
    if (authState.currentUser?.role === 'root') {
      return ['root', 'admin', 'audit'];
    } else if (authState.currentUser?.role === 'admin') {
      return ['audit']; // Admin solo puede asignar rol de audit
    }
    return ['audit'];
  }, [authState.currentUser?.role]);
  
  // Dividir el nombre completo en nombre y apellido si es necesario
  const nombreCompleto = userData.fullName || "";
  const [nombre, apellido] = isEditMode && (!userData.nombre || !userData.apellido) 
    ? nombreCompleto.split(' ').filter(Boolean).reduce((acc, curr) => {
        if (acc[0].length === 0) acc[0] = curr;
        else acc[1] += acc[1].length > 0 ? ` ${curr}` : curr;
        return acc;
      }, ["", ""])
    : [userData.nombre || "", userData.apellido || ""];

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(e);
    // Actualizar fullName cuando cambie nombre o apellido
    if (e.target.name === "nombre" || e.target.name === "apellido") {
      const newNombre = e.target.name === "nombre" ? e.target.value : userData.nombre || nombre;
      const newApellido = e.target.name === "apellido" ? e.target.value : userData.apellido || apellido;
      
      const syntheticEvent = {
        target: {
          name: "fullName",
          value: `${newNombre} ${newApellido}`.trim()
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      onInputChange(syntheticEvent);
    }
  };

  // Determinar si el usuario actual puede editar este usuario
  const canEditUser = isEditMode ? (
    authState.currentUser?.role === 'root' || // Root puede editar a cualquiera
    (authState.currentUser?.role === 'admin' && !isRoot) || // Admin puede editar no-root
    isCurrentUser // Cualquiera puede editarse a sí mismo
  ) : true;
  
  // Determinar si se pueden editar campos específicos
  const canEditSensitiveFields = 
    authState.currentUser?.role === 'root' || 
    (authState.currentUser?.role === 'admin' && !isRoot && !isAdmin) ||
    (isCurrentUser && !isRoot);

  return (
    <Tabs defaultValue="info-basica" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="info-basica">Información Básica</TabsTrigger>
        <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
      </TabsList>
      
      <TabsContent value="info-basica" className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="username" className="flex items-center gap-1">
            <UserIcon className="h-4 w-4" /> Usuario
          </Label>
          {isEditMode ? (
            <>
              <Input
                id="edit-username"
                value={userData.username}
                readOnly
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-muted-foreground">
                El nombre de usuario no puede ser modificado.
              </p>
            </>
          ) : (
            <Input
              id="username"
              name="username"
              value={userData.username}
              onChange={onInputChange}
              placeholder="Nombre de usuario"
            />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="nombre" className="flex items-center gap-1">
              <UserCheck className="h-4 w-4" /> Nombre
            </Label>
            <Input
              id="nombre"
              name="nombre"
              value={userData.nombre || nombre}
              onChange={handleNameChange}
              placeholder="Nombre"
              disabled={!canEditUser}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="apellido" className="flex items-center gap-1">
              <UserCheck className="h-4 w-4" /> Apellido
            </Label>
            <Input
              id="apellido"
              name="apellido"
              value={userData.apellido || apellido}
              onChange={handleNameChange}
              placeholder="Apellido"
              disabled={!canEditUser}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email" className="flex items-center gap-1">
            <AtSign className="h-4 w-4" /> Correo Electrónico
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={userData.email}
            onChange={onInputChange}
            placeholder="correo@ejemplo.com"
            disabled={!canEditSensitiveFields}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="role" className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4" /> Rol
          </Label>
          <Select
            value={userData.role}
            onValueChange={onRoleChange}
            disabled={!canModifyRole}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              {getAvailableRoles().includes('root') && (
                <SelectItem value="root">Root</SelectItem>
              )}
              {getAvailableRoles().includes('admin') && (
                <SelectItem value="admin">Administrador</SelectItem>
              )}
              <SelectItem value="audit">Auditor</SelectItem>
            </SelectContent>
          </Select>
          
          {!canModifyRole && isRoot && (
            <p className="text-xs text-amber-600">
              Solo el usuario root puede modificar usuarios root.
            </p>
          )}
          
          {!canModifyRole && isAdmin && authState.currentUser?.role === 'admin' && !isCurrentUser && (
            <p className="text-xs text-amber-600">
              Los administradores no pueden modificar a otros administradores.
            </p>
          )}
          
          {isCurrentUser && (
            <p className="text-xs text-muted-foreground">
              No puedes cambiar tu propio rol.
            </p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="seguridad" className="space-y-4">
        {isEditMode ? (
          <div className="grid gap-2">
            <Label htmlFor="password" className="flex items-center gap-1">
              <KeyRound className="h-4 w-4" /> Nueva Contraseña (opcional)
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={userData.password || ""}
              onChange={onInputChange}
              placeholder="Dejar en blanco para no cambiar"
              disabled={!canEditSensitiveFields}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password" className="flex items-center gap-1">
                <KeyRound className="h-4 w-4" /> Contraseña
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={userData.password || ""}
                onChange={onInputChange}
                placeholder="Contraseña"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={userData.confirmPassword || ""}
                onChange={onInputChange}
                placeholder="Confirma la contraseña"
              />
            </div>
          </div>
        )}

        {isEditMode && (
          <>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="tfa_habilitado" className="flex items-center gap-1">
                  <Shield className="h-4 w-4" /> Autenticación de dos factores (2FA)
                </Label>
                <Switch
                  id="tfa_habilitado"
                  checked={userData.tfa_habilitado || false}
                  onCheckedChange={onTfaChange}
                  disabled={!canEditSensitiveFields}
                />
              </div>
              {userData.tfa_habilitado && (
                <Select
                  value={userData.tfa_metodo || 'app'}
                  onValueChange={(value) => onTfaMethodChange?.(value as TFAMethod)}
                  disabled={!canEditSensitiveFields}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="app">Aplicación Autenticadora</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <p className="text-xs text-muted-foreground">
                La autenticación de dos factores añade una capa extra de seguridad a la cuenta.
              </p>
            </div>
          </>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default UserForm;
