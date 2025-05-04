import React from "react";
import { User } from "@/types/auth";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserCog, Trash2, Shield, Clock } from "lucide-react";
import { useAuth } from "@/context/auth";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface UserTableProps {
  users: User[];
  currentUserId?: string;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ 
  users, 
  currentUserId, 
  onEditUser, 
  onDeleteUser 
}) => {
  const { authState } = useAuth();

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'root':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'audit':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'root':
        return 'Root';
      case 'admin':
        return 'Admin';
      case 'audit':
        return 'Auditor';
      default:
        return 'Usuario';
    }
  };

  const canEditUser = (user: User) => {
    if (authState.currentUser?.role === 'root') return true;
    if (user.role === 'root') return false;
    if (authState.currentUser?.role === 'admin') {
      return user.role !== 'admin' && user.role !== 'root';
    }
    return false;
  };

  const canDeleteUser = (user: User) => {
    if (user.role === 'root') return false;
    if (user.id === currentUserId) return false;
    if (authState.currentUser?.role === 'root') return true;
    if (authState.currentUser?.role === 'admin') {
      return user.role !== 'admin' && user.role !== 'root';
    }
    return false;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: es });
    } catch (e) {
      return "Fecha inválida";
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead className="hidden sm:table-cell">Nombre</TableHead>
            <TableHead className="hidden md:table-cell">Correo</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead className="hidden xl:table-cell">2FA</TableHead>
            <TableHead className="hidden lg:table-cell">Último Acceso</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className={!user.activo ? "opacity-60" : ""}>
              <TableCell className="font-medium">
                <div>
                  {user.username}
                  <div className="sm:hidden text-xs text-muted-foreground truncate max-w-[120px]">
                    {user.nombre} {user.apellido || user.fullName.split(' ').slice(1).join(' ')}
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {user.nombre} {user.apellido || user.fullName.split(' ').slice(1).join(' ')}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <span className="truncate max-w-[150px] inline-block">{user.email}</span>
              </TableCell>
              <TableCell>
                <Badge className={`${getRoleBadgeClass(user.role)}`}>
                  {getRoleDisplayName(user.role)}
                </Badge>
                {!user.activo && (
                  <Badge variant="outline" className="ml-1 border-gray-300 text-gray-500 text-xs">
                    Inactivo
                  </Badge>
                )}
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        {user.tfa_habilitado ? (
                          <Shield className="h-4 w-4 text-green-600" />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {user.tfa_habilitado ? 
                        `2FA Habilitado (${user.tfa_metodo === 'app' ? 'App' : user.tfa_metodo === 'sms' ? 'SMS' : 'Email'})` : 
                        '2FA Deshabilitado'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {user.ultimo_acceso ? formatDate(user.ultimo_acceso) : "Nunca"}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      Creado: {formatDate(user.createdAt || user.fecha_creacion)}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditUser(user)}
                    disabled={!canEditUser(user)}
                    className={!canEditUser(user) ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    <UserCog className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDeleteUser(user.id)}
                    disabled={!canDeleteUser(user)}
                    className={!canDeleteUser(user) ? 'opacity-50 cursor-not-allowed text-red-500' : 'text-red-500 hover:text-red-700'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
