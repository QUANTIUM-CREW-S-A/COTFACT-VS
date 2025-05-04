import { supabase } from '@/lib/supabase';
import { testSupabaseConnection, testServerConnection, testBackendFeatures } from './realtime';

// Tipos para el estado de conexión
export interface ConnectionStatus {
  database: {
    connected: boolean;
    mode: 'online' | 'offline';
    error?: any;
  };
  server: {
    connected: boolean;
    url: string;
    mode: 'online' | 'offline';
    status?: 'full' | 'partial' | 'minimal' | 'down';
    features?: Record<string, boolean>;
    error?: any;
  };
  mode: 'online' | 'offline' | 'mixed';
  status: 'connected' | 'disconnected' | 'checking' | 'partial';
}

/**
 * Verifica el estado de la conexión con la base de datos Supabase
 */
export const checkDatabaseConnection = async (): Promise<{ connected: boolean; mode: 'online' | 'offline'; error?: any }> => {
  try {
    const isConnected = await testSupabaseConnection();
    return {
      connected: isConnected,
      mode: isConnected ? 'online' : 'offline'
    };
  } catch (error) {
    console.error('Error verificando conexión con Supabase:', error);
    return {
      connected: false,
      mode: 'offline',
      error
    };
  }
};

/**
 * Verifica el estado de la conexión con el servidor de API
 */
export const checkServerConnection = async (
  serverUrls = ['http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3002']
): Promise<{ connected: boolean; url: string; mode: 'online' | 'offline'; status?: 'full' | 'partial' | 'minimal' | 'down'; features?: Record<string, boolean>; error?: any }> => {
  try {
    // Probar cada URL hasta encontrar una que funcione
    const serverResult = await testServerConnection(serverUrls);
    
    if (serverResult.connected) {
      // Si tenemos una conexión, verificar las características disponibles
      const featuresResult = await testBackendFeatures(serverResult.url);
      
      return {
        connected: true,
        url: serverResult.url,
        mode: 'online',
        status: featuresResult.status,
        features: featuresResult.features
      };
    } else {
      return {
        connected: false,
        url: '',
        mode: 'offline',
        status: 'down',
        error: serverResult.error
      };
    }
  } catch (error) {
    console.error('Error verificando conexión con el servidor API:', error);
    return {
      connected: false,
      url: '',
      mode: 'offline',
      status: 'down',
      error
    };
  }
};

/**
 * Verifica el estado de la conexión con la base de datos y el servidor API
 */
export const checkConnectionStatus = async (): Promise<ConnectionStatus> => {
  // Verificar ambas conexiones en paralelo
  const [dbStatus, serverStatus] = await Promise.all([
    checkDatabaseConnection(),
    checkServerConnection()
  ]);

  // Determinar el modo general de la aplicación
  let mode: 'online' | 'offline' | 'mixed' = 'offline';
  let status: 'connected' | 'disconnected' | 'checking' | 'partial' = 'disconnected';

  if (dbStatus.connected && serverStatus.connected) {
    mode = 'online';
    status = 'connected';
  } else if (!dbStatus.connected && !serverStatus.connected) {
    mode = 'offline';
    status = 'disconnected';
  } else {
    mode = 'mixed';
    status = 'partial';
  }

  return {
    database: dbStatus,
    server: serverStatus,
    mode,
    status
  };
};

/**
 * Inicia una comprobación programada del estado de conexión
 * Útil para monitorear automáticamente la conexión en segundo plano
 */
export const setupConnectionMonitoring = (
  onStatusChange: (status: ConnectionStatus) => void,
  intervalMs = 30000 // Default: 30 segundos
) => {
  let lastStatus: string = '';
  
  const checkAndNotify = async () => {
    const status = await checkConnectionStatus();
    const statusSignature = `${status.database.connected}-${status.server.connected}-${status.mode}`;
    
    // Sólo notificar si hay un cambio en el estado
    if (statusSignature !== lastStatus) {
      onStatusChange(status);
      lastStatus = statusSignature;
    }
  };
  
  // Hacer una verificación inicial inmediata
  checkAndNotify();
  
  // Configurar verificación periódica
  const intervalId = setInterval(checkAndNotify, intervalMs);
  
  // Devolver una función para detener el monitoreo
  return () => clearInterval(intervalId);
};