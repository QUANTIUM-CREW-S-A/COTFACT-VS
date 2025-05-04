import React, { useState, useEffect } from "react";
import { useActivityLog, ActivityLogEntry } from "@/context/auth/hooks/useActivityLog";
import { useAuth } from "@/context/auth";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription 
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  Clock, 
  Info, 
  RefreshCcw, 
  Search, 
  Trash2,
  AlertTriangle,
  ShieldAlert
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const ActivityLogViewer: React.FC = () => {
  const { authState } = useAuth();
  // Usar el hook actualizado pasándole el estado de autenticación
  const { getActivityLogs, clearOldActivityLogs, isLoading } = useActivityLog({ authState });
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [limit, setLimit] = useState<number>(50);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ActivityLogEntry | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [daysToKeep, setDaysToKeep] = useState(90);

  // Cargar registros de actividad al iniciar
  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const activityLogs = await getActivityLogs(
      limit, 
      undefined, 
      filterType as any
    );
    setLogs(activityLogs);
  };

  const handleClearOldLogs = async () => {
    const success = await clearOldActivityLogs(daysToKeep);
    if (success) {
      setConfirmClearOpen(false);
      loadLogs();
    }
  };

  const handleViewDetails = (log: ActivityLogEntry) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive" className="flex items-center gap-1"><ShieldAlert size={12} />Crítico</Badge>;
      case 'warning':
        return <Badge variant="warning" className="bg-orange-100 text-orange-800 border-orange-300 flex items-center gap-1"><AlertTriangle size={12} />Advertencia</Badge>;
      default:
        return <Badge variant="outline" className="flex items-center gap-1"><Info size={12} />Información</Badge>;
    }
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'login':
      case 'logout':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed_login':
      case 'account_locked':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatActivityType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'login': 'Inicio de sesión',
      'logout': 'Cierre de sesión',
      'password_change': 'Cambio de contraseña',
      'password_reset': 'Restablecimiento de contraseña',
      'failed_login': 'Inicio de sesión fallido',
      'account_locked': 'Cuenta bloqueada',
      'account_unlocked': 'Cuenta desbloqueada',
      'user_created': 'Usuario creado',
      'user_updated': 'Usuario actualizado',
      'user_deleted': 'Usuario eliminado',
      'settings_changed': 'Configuración modificada',
      'export_data': 'Datos exportados',
      'other': 'Otra actividad'
    };

    return typeMap[type] || type;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-500" />
            Registro de Actividades
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadLogs}
              disabled={isLoading}
            >
              <RefreshCcw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setConfirmClearOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Limpiar antiguos
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Registro de actividades y eventos de seguridad en el sistema
        </CardDescription>
        <div className="flex flex-wrap gap-4 mt-2 items-end">
          <div className="space-y-1">
            <Label htmlFor="filter-type">Tipo de Actividad</Label>
            <Select
              value={filterType || ""}
              onValueChange={(value) => setFilterType(value || null)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los tipos</SelectItem>
                <SelectItem value="login">Inicio de sesión</SelectItem>
                <SelectItem value="logout">Cierre de sesión</SelectItem>
                <SelectItem value="failed_login">Login fallido</SelectItem>
                <SelectItem value="account_locked">Cuenta bloqueada</SelectItem>
                <SelectItem value="user_created">Usuario creado</SelectItem>
                <SelectItem value="user_updated">Usuario actualizado</SelectItem>
                <SelectItem value="user_deleted">Usuario eliminado</SelectItem>
                <SelectItem value="password_change">Cambio contraseña</SelectItem>
                <SelectItem value="password_reset">Reseteo contraseña</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="limit">Límite</Label>
            <Select
              value={limit.toString()}
              onValueChange={(value) => setLimit(parseInt(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Límite" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={loadLogs} disabled={isLoading}>
            {isLoading ? "Cargando..." : "Filtrar"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Severidad</TableHead>
                <TableHead className="w-[100px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id || `${log.user_id}-${log.created_at}`}>
                    <TableCell>
                      {log.created_at && format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </TableCell>
                    <TableCell>{log.username || 'Anónimo'}</TableCell>
                    <TableCell className="flex items-center gap-1">
                      {getActivityTypeIcon(log.activity_type)}
                      <span>{formatActivityType(log.activity_type)}</span>
                    </TableCell>
                    <TableCell className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                      {log.description}
                    </TableCell>
                    <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewDetails(log)}
                      >
                        Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    {isLoading ? (
                      <div className="flex justify-center items-center">
                        <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                        Cargando registros...
                      </div>
                    ) : (
                      "No hay registros de actividad para mostrar"
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Modal de detalles */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles del Registro</DialogTitle>
            <DialogDescription>
              Información completa del registro de actividad
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Fecha y hora</h4>
                  <p className="text-sm">
                    {selectedLog.created_at && format(new Date(selectedLog.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Usuario</h4>
                  <p className="text-sm">{selectedLog.username || 'Anónimo'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">ID de Usuario</h4>
                  <p className="text-sm text-muted-foreground">{selectedLog.user_id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Tipo de Actividad</h4>
                  <div className="flex items-center gap-2">
                    {getActivityTypeIcon(selectedLog.activity_type)}
                    <p className="text-sm">{formatActivityType(selectedLog.activity_type)}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Descripción</h4>
                  <p className="text-sm">{selectedLog.description}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Severidad</h4>
                  <div>{getSeverityBadge(selectedLog.severity)}</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Agente de Usuario</h4>
                  <p className="text-xs text-muted-foreground break-all">{selectedLog.user_agent}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Dirección IP</h4>
                  <p className="text-sm">{selectedLog.ip_address || 'No disponible'}</p>
                </div>
                {selectedLog.details && (
                  <div>
                    <h4 className="text-sm font-medium">Detalles adicionales</h4>
                    <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto">
                      {typeof selectedLog.details === 'string' 
                        ? JSON.stringify(JSON.parse(selectedLog.details), null, 2) 
                        : JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para limpiar registros antiguos */}
      <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Limpiar Registros Antiguos</DialogTitle>
            <DialogDescription>
              Esta acción eliminará permanentemente los registros de actividad antiguos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="days-to-keep">Mantener registros de los últimos</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="days-to-keep"
                  type="number"
                  min={1}
                  className="max-w-[100px]"
                  value={daysToKeep}
                  onChange={(e) => setDaysToKeep(parseInt(e.target.value) || 90)}
                />
                <span>días</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Los registros anteriores a {daysToKeep} días serán eliminados permanentemente.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmClearOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleClearOldLogs}>
              Confirmar eliminación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ActivityLogViewer;