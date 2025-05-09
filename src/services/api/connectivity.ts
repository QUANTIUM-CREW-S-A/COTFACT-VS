import { supabase } from '@/lib/supabase';
import { testSupabaseConnection, testServerConnection, testBackendFeatures } from './realtime';

// Estado global para la detección de bloqueadores
const blockerDetectionState = {
  detected: false,
  detectionTimestamp: 0,
  attemptCount: 0,
  cooldownPeriodMs: 60000, // 1 minuto de cooldown entre intentos de detección
  maxAttempts: 3, // Máximo número de intentos antes de asumir bloqueo permanente
  blockedUrls: new Set<string>()
};

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
  blockerDetected?: boolean; // Nueva propiedad para indicar si hay bloqueadores detectados
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
 * Verifica si debemos proceder con la detección del servidor basado en
 * intentos previos y tiempo de enfriamiento para evitar mensajes repetitivos
 */
function shouldAttemptServerDetection(): boolean {
  const now = Date.now();
  
  // Si ya detectamos bloqueo permanente (después de maxAttempts)
  if (blockerDetectionState.attemptCount >= blockerDetectionState.maxAttempts) {
    // Solo intentar ocasionalmente (cada 5 minutos) después de confirmar bloqueo
    return (now - blockerDetectionState.detectionTimestamp) > 5 * 60 * 1000;
  }
  
  // Si estamos en periodo de cooldown después de una detección reciente
  if (blockerDetectionState.detected && 
      (now - blockerDetectionState.detectionTimestamp) < blockerDetectionState.cooldownPeriodMs) {
    return false;
  }
  
  return true;
}

/**
 * Registra un error de bloqueo detectado
 */
export function registerBlockedRequest(url: string): void {
  blockerDetectionState.detected = true;
  blockerDetectionState.detectionTimestamp = Date.now();
  blockerDetectionState.attemptCount++;
  blockerDetectionState.blockedUrls.add(url);
  
  console.warn(`Bloqueador detectado para ${url}. Intento ${blockerDetectionState.attemptCount} de ${blockerDetectionState.maxAttempts}`);
}

/**
 * Verifica el estado de la conexión con el servidor de API
 */
export const checkServerConnection = async (
  serverUrls = ['http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3002']
): Promise<{ connected: boolean; url: string; mode: 'online' | 'offline'; status?: 'full' | 'partial' | 'minimal' | 'down'; features?: Record<string, boolean>; error?: any }> => {
  // Si hemos detectado un bloqueador y estamos en cooldown, saltamos la detección completa
  if (!shouldAttemptServerDetection()) {
    return {
      connected: true, // Asumimos conectado para no mostrar errores repetitivos
      url: 'http://localhost:3001', // URL por defecto
      mode: 'online',
      status: 'partial',
      features: {},
      error: {
        type: 'BLOCKER_DETECTED',
        message: 'Detección de servidor omitida debido a bloqueador detectado previamente'
      }
    };
  }
  
  try {
    // Probar cada URL hasta encontrar una que funcione
    const serverResult = await testServerConnection(serverUrls);
    
    if (serverResult.connected) {
      // Resetear el contador de intentos si la conexión es exitosa
      if (serverResult.status !== 'detected') {
        blockerDetectionState.attemptCount = 0;
        blockerDetectionState.detected = false;
      }
      
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
      if (serverResult.error?.type === 'BLOCKER_DETECTED') {
        // Si se detectó un bloqueador, registramos el evento
        registerBlockedRequest(serverResult.url || 'unknown-url');
      }
      
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
    
    // Verificar si el error es por un bloqueador
    if (error?.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
      registerBlockedRequest('request-error');
    }
    
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
    status,
    blockerDetected: blockerDetectionState.detected
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
    try {
      const status = await checkConnectionStatus();
      const statusSignature = `${status.database.connected}-${status.server.connected}-${status.mode}-${status.blockerDetected}`;
      
      // Sólo notificar si hay un cambio en el estado
      if (statusSignature !== lastStatus) {
        onStatusChange(status);
        lastStatus = statusSignature;
      }
    } catch (err) {
      console.error('Error en checkAndNotify:', err);
    }
  };
  
  // Hacer una verificación inicial inmediata
  checkAndNotify();
  
  // Configurar verificación periódica
  const intervalId = setInterval(checkAndNotify, intervalMs);
  
  // Devolver una función para detener el monitoreo
  return () => clearInterval(intervalId);
};

/**
 * Devuelve el estado actual de detección de bloqueadores
 */
export const getBlockerDetectionState = () => {
  return {
    ...blockerDetectionState,
    blockedUrls: [...blockerDetectionState.blockedUrls]
  };
};

/**
 * Resetea el estado de detección de bloqueadores
 */
export const resetBlockerDetection = () => {
  blockerDetectionState.detected = false;
  blockerDetectionState.attemptCount = 0;
  blockerDetectionState.blockedUrls.clear();
  return true;
};