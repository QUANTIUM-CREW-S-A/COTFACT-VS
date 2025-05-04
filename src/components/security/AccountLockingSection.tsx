import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { 
  AlertCircle, 
  Lock, 
  Unlock, 
  ShieldAlert, 
  RefreshCcw 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useActivityLog } from "@/context/auth/hooks/useActivityLog";

interface LockedAccount {
  id: string;
  email: string;
  username: string;
  intentos_fallidos: number;
  bloqueado_hasta: string;
}

const AccountLockingSection: React.FC = () => {
  const { authState } = useAuth();
  // Usar el hook actualizado pasándole el estado de autenticación
  const { logActivity } = useActivityLog({ authState });
  const [lockedAccounts, setLockedAccounts] = useState<LockedAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState(5);
  const [lockDuration, setLockDuration] = useState(15);
  const [settingsChanged, setSettingsChanged] = useState(false);

  const isAdmin = authState.currentUser?.role === 'admin' || authState.currentUser?.role === 'root';

  // Cargar cuentas bloqueadas al iniciar
  useEffect(() => {
    if (isAdmin) {
      loadLockedAccounts();
    }
  }, [isAdmin]);

  const loadLockedAccounts = async () => {
    try {
      setIsLoading(true);
      
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, username, intentos_fallidos, bloqueado_hasta')
        .gt('bloqueado_hasta', now);
        
      if (error) {
        console.error("Error al cargar cuentas bloqueadas:", error);
        toast.error("Error al cargar cuentas bloqueadas");
        return;
      }
      
      setLockedAccounts(data || []);
    } catch (error) {
      console.error("Error al cargar cuentas bloqueadas:", error);
      toast.error("Error al obtener información de cuentas bloqueadas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlockAccount = async (accountId: string, email: string, username: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          intentos_fallidos: 0, 
          bloqueado_hasta: null 
        })
        .eq('id', accountId);
        
      if (error) {
        console.error("Error al desbloquear cuenta:", error);
        toast.error("Error al desbloquear la cuenta");
        return;
      }
      
      // Registrar la actividad de desbloqueo
      await logActivity(
        'account_unlocked',
        `Cuenta desbloqueada manualmente: ${username} (${email})`,
        'warning',
        { accountId, email, username }
      );
      
      toast.success("Cuenta desbloqueada con éxito");
      
      // Refrescar la lista de cuentas bloqueadas
      loadLockedAccounts();
    } catch (error) {
      console.error("Error al desbloquear cuenta:", error);
      toast.error("Error al desbloquear la cuenta");
    }
  };

  const saveSettings = () => {
    // Aquí normalmente guardaríamos la configuración en la base de datos
    // Por ahora solo simulamos y registramos la actividad
    logActivity(
      'settings_changed',
      'Configuración de seguridad modificada',
      'info',
      { setting: 'account_locking', maxAttempts, lockDuration }
    );
    
    toast.success("Configuración guardada con éxito");
    setSettingsChanged(false);
  };

  // Función para formatear el tiempo restante de bloqueo
  const formatLockTimeRemaining = (lockTime: string) => {
    try {
      const lockDate = new Date(lockTime);
      return formatDistanceToNow(lockDate, { 
        addSuffix: true, 
        locale: es 
      });
    } catch (e) {
      return "Tiempo desconocido";
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-orange-500" />
            Protección contra ataques de fuerza bruta
          </CardTitle>
          <CardDescription>
            Tu cuenta está protegida contra intentos repetidos de inicio de sesión no autorizados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-md p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-orange-800 dark:text-orange-300">
                Tu cuenta se bloqueará temporalmente después de varios intentos fallidos de inicio de sesión. 
                Esto te protege contra ataques de fuerza bruta.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-orange-500" />
            Protección contra ataques de fuerza bruta
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadLockedAccounts}
            disabled={isLoading}
          >
            <RefreshCcw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </CardTitle>
        <CardDescription>
          Configuración y gestión de bloqueo temporal de cuentas por intentos fallidos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Configuración de bloqueo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-attempts">Intentos fallidos antes de bloqueo</Label>
              <div className="flex gap-2 items-center">
                <Input 
                  id="max-attempts"
                  type="number"
                  min={1}
                  max={10}
                  value={maxAttempts}
                  onChange={(e) => {
                    setMaxAttempts(Number(e.target.value));
                    setSettingsChanged(true);
                  }}
                />
                <span className="text-sm text-muted-foreground">intentos</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lock-duration">Duración del bloqueo</Label>
              <div className="flex gap-2 items-center">
                <Input 
                  id="lock-duration"
                  type="number"
                  min={1}
                  max={1440} // 24 horas en minutos
                  value={lockDuration}
                  onChange={(e) => {
                    setLockDuration(Number(e.target.value));
                    setSettingsChanged(true);
                  }}
                />
                <span className="text-sm text-muted-foreground">minutos</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Cuentas bloqueadas actualmente
          </h3>
          {lockedAccounts.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Tiempo restante</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lockedAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>{account.username}</TableCell>
                      <TableCell>{account.email}</TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="flex items-center gap-1 whitespace-nowrap">
                          <Lock className="h-3 w-3" />
                          Bloqueada
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatLockTimeRemaining(account.bloqueado_hasta)}
                      </TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleUnlockAccount(account.id, account.email, account.username)}
                              >
                                <Unlock className="h-4 w-4 mr-1" />
                                Desbloquear
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Desbloquear cuenta inmediatamente</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="bg-muted/50 rounded-md p-4 text-center">
              <p className="text-sm text-muted-foreground">
                {isLoading 
                  ? "Cargando cuentas bloqueadas..." 
                  : "No hay cuentas bloqueadas actualmente"}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={saveSettings} disabled={!settingsChanged}>
          Guardar configuración
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AccountLockingSection;