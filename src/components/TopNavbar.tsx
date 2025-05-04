import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Bell, Cloud, CloudOff, Loader, ChevronDown, User, Settings, Database, Server, RefreshCw, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import { checkConnectionStatus, ConnectionStatus } from '@/services/api/connectivity';

interface TopNavbarProps {
  mobileNavOpen?: boolean;
  setMobileNavOpen?: (open: boolean) => void;
}

interface Notification {
  id: number;
  title: string;
  read: boolean;
  timestamp: Date;
  type?: 'info' | 'warning' | 'error' | 'success';
}

const TopNavbar: React.FC<TopNavbarProps> = ({ 
  mobileNavOpen = false, 
  setMobileNavOpen = () => {},
}) => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    database: { connected: false, mode: 'offline' },
    server: { connected: false, url: '', mode: 'offline' },
    mode: 'offline',
    status: 'checking'
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Contador de fallos consecutivos para evitar cambios de estado frecuentes
  const failCountRef = useRef(0);
  const lastModeRef = useRef<'online' | 'offline' | 'mixed'>('offline');
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Iniciales del usuario para el Avatar
  const getUserInitials = (): string => {
    if (!authState.currentUser) return 'U';
    
    const fullName = authState.currentUser.fullName || '';
    const nameParts = fullName.split(' ').filter(part => part.length > 0);
    
    if (nameParts.length === 0) {
      // Si no hay nombre completo, usar la primera letra del email o username
      const username = authState.currentUser.username || '';
      return username.substring(0, 1).toUpperCase();
    }
    
    if (nameParts.length === 1) {
      // Si solo hay una parte del nombre, usar las dos primeras letras
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    
    // Si hay al menos dos partes, usar la primera letra de cada una
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  // Verificar la conexión periódicamente
  const checkConnections = useCallback(async () => {
    setConnectionStatus(prev => ({...prev, status: 'checking'}));
    
    try {
      const status = await checkConnectionStatus();
      
      // Lógica para evitar fluctuaciones en la UI
      if (status.mode === 'online') {
        // Resetear contador de fallos si la conexión es completamente exitosa
        failCountRef.current = 0;
        lastModeRef.current = 'online';
      } else if (status.mode === 'offline' && lastModeRef.current !== 'offline') {
        // Incrementar contador de fallos
        failCountRef.current += 1;
        
        // Solo cambiar a offline después de 2 fallos consecutivos
        if (failCountRef.current < 2) {
          // Mantener el estado anterior si es el primer fallo
          return;
        }
        
        // Añadir notificación después de confirmar la desconexión
        addNotification({
          title: 'Se ha perdido la conexión con los servidores',
          type: 'error'
        });
        
        lastModeRef.current = 'offline';
      } else if (status.mode === 'mixed' && lastModeRef.current !== 'mixed') {
        // Si cambia a un modo mixto, añadir notificación específica
        let message = '';
        
        if (status.database.connected && !status.server.connected) {
          message = 'Conectado a la base de datos, pero no al servidor API';
        } else if (!status.database.connected && status.server.connected) {
          message = 'Conectado al servidor API, pero no a la base de datos';
        }
        
        addNotification({
          title: message,
          type: 'warning'
        });
        
        lastModeRef.current = 'mixed';
      } else if (lastModeRef.current === 'offline' && status.mode !== 'offline') {
        // Si se reconecta desde un estado desconectado
        addNotification({
          title: 'Conexión restablecida con los servidores',
          type: 'success'
        });
        
        lastModeRef.current = status.mode;
      }
      
      setConnectionStatus(status);
    } catch (error) {
      console.error('Error verificando las conexiones:', error);
      setConnectionStatus({
        database: { connected: false, mode: 'offline', error },
        server: { connected: false, mode: 'offline', url: '', error },
        mode: 'offline',
        status: 'disconnected'
      });
    }
  }, []);

  // Verificar la conexión al cargar el componente y periódicamente
  useEffect(() => {
    // Verificar la conexión inmediatamente
    checkConnections();
    
    // Verificar cada 30 segundos
    const interval = setInterval(checkConnections, 30000);
    
    return () => clearInterval(interval);
  }, [checkConnections]);
  
  // Añadir notificación
  const addNotification = ({ title, type = 'info' }: { title: string; type?: 'info' | 'warning' | 'error' | 'success' }) => {
    const newNotification: Notification = {
      id: Date.now(),
      title,
      read: false,
      timestamp: new Date(),
      type
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 10)); // Mantener solo las 10 más recientes
  };
  
  // Marcar una notificación como leída
  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };
  
  // Marcar todas las notificaciones como leídas
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };
  
  // Formatear el tiempo relativo
  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'Ahora mismo';
    if (diffMinutes < 60) return `Hace ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  };

  // Estilos y configuración para los diferentes estados de conexión
  const connectionStyles = {
    connected: {
      bg: 'bg-emerald-500',
      borderColor: 'border-emerald-600',
      icon: <Cloud size={15} />,
      text: 'Conectado',
      tooltip: 'Conectado a todos los servicios. La aplicación está sincronizando datos correctamente.',
      pulseColor: 'bg-emerald-400',
      textColor: 'text-white'
    },
    disconnected: {
      bg: 'bg-red-500',
      borderColor: 'border-red-600',
      icon: <CloudOff size={15} />,
      text: 'Sin conexión',
      tooltip: 'Sin conexión a los servicios. Estás trabajando en modo local.',
      pulseColor: 'bg-red-400',
      textColor: 'text-white'
    },
    checking: {
      bg: 'bg-amber-500',
      borderColor: 'border-amber-600',
      icon: <Loader size={15} className="animate-spin" />,
      text: 'Verificando...',
      tooltip: 'Verificando conexión con los servicios...',
      pulseColor: 'bg-amber-400',
      textColor: 'text-white'
    },
    partial: {
      bg: 'bg-blue-500',
      borderColor: 'border-blue-600',
      icon: <Cloud size={15} />,
      text: 'Parcial',
      tooltip: 'Conexión parcial a los servicios. Algunas funciones pueden estar limitadas.',
      pulseColor: 'bg-blue-400',
      textColor: 'text-white'
    }
  };

  // Obtener el texto de estado según el modo de conexión
  const getConnectionStatusText = () => {
    if (connectionStatus.status === 'checking') {
      return 'Verificando...';
    }
    
    // Textos descriptivos según el estado de cada componente
    if (connectionStatus.database.connected && connectionStatus.server.connected) {
      return 'Online';
    } else if (!connectionStatus.database.connected && !connectionStatus.server.connected) {
      return 'Sin conexión';
    } else if (connectionStatus.database.connected && !connectionStatus.server.connected) {
      return 'DB Online';
    } else {
      return 'API Online';
    }
  };

  return (
    <div className="border-b border-border bg-background shadow-sm">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Mobile menu button (visible solo en móvil) */}
        <button
          className="lg:hidden p-2 rounded-md hover:bg-accent"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          <span className="sr-only">Abrir menú</span>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Barra de búsqueda expandible */}
        <div className="relative flex items-center">
          <AnimatePresence initial={false} mode="wait">
            {searchOpen ? (
              <motion.div
                className="absolute -left-2 flex items-center bg-background dark:bg-background border border-border rounded-md shadow-md"
                initial={{ width: "3rem", opacity: 0 }}
                animate={{ width: "280px", opacity: 1 }}
                exit={{ width: "3rem", opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Search className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="flex-1 bg-transparent h-10 px-3 py-2 text-sm outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(false)}
                  className="h-8 w-8 mr-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ) : (
              <motion.button
                className="p-2 rounded-md hover:bg-accent"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-5 w-5 text-muted-foreground" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Acciones del lado derecho */}
        <div className="flex items-center space-x-3">
          {/* Indicador de estado de conexión */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative inline-flex">
                  <motion.div
                    className={`relative flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer border ${connectionStyles[connectionStatus.status].borderColor} shadow-sm ${connectionStyles[connectionStatus.status].textColor}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ backgroundColor: connectionStyles[connectionStatus.status].bg }}
                    onClick={checkConnections}
                  >
                    {connectionStatus.status === 'connected' && (
                      <motion.div 
                        className={`absolute inset-0 rounded-lg ${connectionStyles[connectionStatus.status].pulseColor} opacity-75`}
                        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 0.5, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    <span className="relative z-10 flex items-center">
                      {connectionStyles[connectionStatus.status].icon}
                    </span>
                    
                    <span className="relative z-10 hidden sm:inline-flex items-center gap-1.5">
                      <span className="font-medium">{getConnectionStatusText()}</span>
                      {connectionStatus.status !== 'checking' && (
                        <span className="flex items-center gap-1 opacity-80">
                          {/* Indicadores de puntos para DB y API */}
                          <span className="flex items-center">
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${connectionStatus.database.connected ? 'bg-green-300' : 'bg-red-300'}`}></span>
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ml-0.5 ${connectionStatus.server.connected ? 'bg-green-300' : 'bg-red-300'}`}></span>
                          </span>
                        </span>
                      )}
                    </span>
                  </motion.div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="w-72 p-4 text-sm">
                <div className="flex flex-col gap-3">
                  <h4 className="font-semibold text-base">{connectionStyles[connectionStatus.status].tooltip}</h4>
                  
                  <div className="grid gap-2">
                    <div className={`flex items-center gap-2 p-2 rounded ${connectionStatus.database.connected ? 'bg-green-500/10 dark:bg-green-950/30' : 'bg-red-500/10 dark:bg-red-950/30'}`}>
                      <div className={`w-3 h-3 rounded-full ${connectionStatus.database.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium flex items-center gap-1.5">
                            <Database className="w-3.5 h-3.5" /> 
                            <span>Base de datos</span>
                          </span>
                          <span className={`text-xs ${connectionStatus.database.connected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {connectionStatus.database.connected ? 'Conectada' : 'Desconectada'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {connectionStatus.database.connected 
                            ? 'Sincronización de datos habilitada'
                            : 'Usando almacenamiento local'}
                        </div>
                      </div>
                    </div>
                    
                    <div className={`flex items-center gap-2 p-2 rounded ${connectionStatus.server.connected ? 'bg-green-500/10 dark:bg-green-950/30' : 'bg-red-500/10 dark:bg-red-950/30'}`}>
                      <div className={`w-3 h-3 rounded-full ${connectionStatus.server.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium flex items-center gap-1.5">
                            <Server className="w-3.5 h-3.5" /> 
                            <span>Servidor API</span>
                          </span>
                          <span className={`text-xs ${connectionStatus.server.connected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {connectionStatus.server.connected ? 'Conectado' : 'Desconectado'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {connectionStatus.server.connected 
                            ? `URL: ${connectionStatus.server.url || 'localhost'}`
                            : 'Funciones avanzadas deshabilitadas'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {connectionStatus.mode === 'mixed' && (
                    <div className="text-amber-600 dark:text-amber-400 text-xs mt-1 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-2 rounded flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 mt-0.5">⚠️</span>
                      <span>Modo mixto: Algunas funcionalidades avanzadas pueden estar limitadas o funcionar diferente.</span>
                    </div>
                  )}
                  
                  {connectionStatus.mode === 'offline' && (
                    <div className="text-blue-600 dark:text-blue-400 text-xs mt-1 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-2 rounded flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">💾</span>
                      <span>Modo local: Los datos se guardarán temporalmente en tu dispositivo y se sincronizarán cuando recuperes la conexión.</span>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground border-t pt-2 mt-1">
                    Última verificación: {new Date().toLocaleTimeString()}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={checkConnections}
                      className="ml-1 h-6 text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" /> Verificar ahora
                    </Button>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Toggle de tema */}
          <ThemeToggle />

          {/* Notificaciones */}
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Notificaciones</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notificaciones</span>
                {notifications.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={markAllAsRead}
                  >
                    Marcar todo como leído
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No tienes notificaciones
                </div>
              ) : (
                notifications.map(notification => (
                  <DropdownMenuItem 
                    key={notification.id} 
                    className="cursor-pointer p-3"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div 
                        className={`h-2 w-2 mt-1.5 rounded-full shrink-0 ${
                          notification.type === 'error' ? 'bg-red-500' : 
                          notification.type === 'warning' ? 'bg-amber-500' :
                          notification.type === 'success' ? 'bg-green-500' : 
                          'bg-primary'
                        }`} 
                        style={{ opacity: notification.read ? 0.3 : 1 }} 
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${notification.read ? 'text-muted-foreground' : ''}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {getRelativeTime(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer justify-center">
                    <Button variant="ghost" className="w-full text-xs">Ver todas</Button>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Menú de usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="pl-1">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage 
                    src={authState.currentUser?.avatarUrl || "/placeholder.svg"} 
                    alt={authState.currentUser?.fullName || "Usuario"} 
                  />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-flex text-sm font-medium truncate max-w-[100px]">
                  {authState.currentUser?.fullName || authState.currentUser?.username || "Usuario"}
                </span>
                <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{authState.currentUser?.fullName || "Usuario"}</p>
                  <p className="text-xs text-muted-foreground truncate">{authState.currentUser?.email || ""}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/settings')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive" 
                onClick={async () => {
                  try {
                    await logout();
                    toast.success("Sesión cerrada con éxito");
                    navigate('/login');
                  } catch (error) {
                    console.error("Error al cerrar sesión:", error);
                    toast.error("Ocurrió un error al cerrar sesión");
                  }
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;