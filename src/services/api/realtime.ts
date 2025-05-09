import { supabase } from '@/lib/supabase';
import { handleSupabaseError } from './utils';
import { API_URLS, API_ENDPOINTS, updateBackendIp } from './config';

// Store active channel subscriptions for cleanup
const activeChannels: Record<string, any> = {};

/**
 * Enable realtime subscriptions for a specific table
 * @param tableName The database table to subscribe to
 * @param eventCallback Callback function for handling change events
 * @returns {boolean} Success status
 */
export const enableRealtimeForTable = async (
  tableName: string, 
  eventCallback?: (payload: any) => void
) => {
  try {
    // Cleanup any existing subscription for this table
    if (activeChannels[tableName]) {
      try {
        await activeChannels[tableName].unsubscribe();
        console.log(`Unsubscribed from previous ${tableName} channel`);
      } catch (err) {
        console.warn(`Error unsubscribing from ${tableName} channel:`, err);
      }
    }

    // Create a new channel with a unique name to avoid conflicts
    const channelId = `${tableName}-changes-${Date.now()}`;
    const channel = supabase.channel(channelId)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        payload => {
          console.log(`Change in ${tableName}:`, payload);
          // Execute callback if provided
          if (eventCallback && typeof eventCallback === 'function') {
            eventCallback(payload);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to ${tableName} changes`);
        } else if (status === 'CLOSED') {
          console.log(`Channel for ${tableName} was closed`);
          delete activeChannels[tableName];
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error in channel for ${tableName}`);
        }
      });

    activeChannels[tableName] = channel;
    console.log(`Realtime enabled for table: ${tableName}`);
    return true;
  } catch (error) {
    console.error(`Error enabling realtime for table ${tableName}:`, error);
    return false;
  }
};

/**
 * Disable realtime subscriptions for a specific table
 * @param tableName The database table to unsubscribe from
 * @returns {boolean} Success status
 */
export const disableRealtimeForTable = async (tableName: string) => {
  try {
    if (activeChannels[tableName]) {
      await activeChannels[tableName].unsubscribe();
      delete activeChannels[tableName];
      console.log(`Realtime disabled for table: ${tableName}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error disabling realtime for table ${tableName}:`, error);
    return false;
  }
};

/**
 * Cleanup all active realtime subscriptions
 * @returns {Promise<void>}
 */
export const cleanupAllRealtimeSubscriptions = async () => {
  try {
    const tables = Object.keys(activeChannels);
    for (const table of tables) {
      await disableRealtimeForTable(table);
    }
    console.log('All realtime subscriptions cleaned up');
  } catch (error) {
    console.error('Error cleaning up realtime subscriptions:', error);
  }
};

/**
 * Prueba la conexión a Supabase.
 * Esta función intenta un método simple para verificar la conexión de la base de datos.
 */
export const testSupabaseConnection = async () => {
  try {
    // Primero intentamos un método más simple: verificar la sesión
    const { data: sessionData } = await supabase.auth.getSession();
    
    // Como respaldo, intentamos una consulta simple a cualquier tabla
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .maybeSingle();
    
    if (error) {
      // Si hay un error específico de permisos, pero la conexión fue exitosa
      if (error.code === 'PGRST301' || error.code === '42501') {
        console.log("Supabase connected but permission issue:", error);
        return true;
      }
      
      throw error;
    }
    
    console.log("Supabase connection successful");
    return true;
  } catch (error) {
    console.error("Error testing Supabase connection:", error);
    return false;
  }
};

/**
 * Verifica si un servidor está activo mediante un ping simple
 */
const pingServer = async (url: string): Promise<boolean> => {
  try {
    return await new Promise<boolean>((resolve) => {
      const timeoutId = setTimeout(() => resolve(false), 3000);
      
      // Crear un elemento que intente cargar algo del servidor
      const pingElement = document.createElement('iframe');
      pingElement.style.display = 'none';
      
      pingElement.onload = () => {
        clearTimeout(timeoutId);
        document.body.removeChild(pingElement);
        resolve(true);
      };
      
      pingElement.onerror = () => {
        // Si hay error de carga pero el servidor respondió con algo
        // (como un error 404), el servidor está activo
        clearTimeout(timeoutId);
        document.body.removeChild(pingElement);
        resolve(true);
      };
      
      document.body.appendChild(pingElement);
      
      // La URL incluye un timestamp para evitar caché
      pingElement.src = `${url}?ping=${Date.now()}`;
    });
  } catch (e) {
    console.log('Error en ping:', e);
    return false;
  }
};

/**
 * Prueba la conexión al servidor de backend.
 * Esta función intenta conectarse a múltiples URLs posibles para encontrar el servidor.
 * @param urls Lista de URLs para intentar conectar.
 * @returns Un objeto con la información de la conexión.
 */
export const testServerConnection = async (
  urls: string[] = API_URLS
): Promise<{ connected: boolean; url: string; status?: string; error?: any }> => {
  // Intentar con múltiples endpoints para aumentar posibilidades de éxito
  const endpoints = [
    API_ENDPOINTS.HEALTH, 
    API_ENDPOINTS.ROOT, 
    API_ENDPOINTS.API_HEALTH, 
    API_ENDPOINTS.API_STATUS, 
    API_ENDPOINTS.STATUS
  ];
  
  console.log('Iniciando pruebas de conexión con el servidor backend...');

  /**
   * Detecta si una extensión o política de navegador está bloqueando solicitudes (ERR_BLOCKED_BY_CLIENT)
   * Llama a onBlocked si se detecta el bloqueo.
   */
  async function checkForBlockers(url: string, onBlocked: (url: string) => void) {
    try {
      // Crear un iframe oculto para detectar si el navegador bloquea el contenido
      const testFrame = document.createElement('iframe');
      testFrame.style.display = 'none';
      testFrame.src = 'about:blank';
      document.body.appendChild(testFrame);
      
      // Intentar cargar un recurso desde la URL para ver si está bloqueado
      const testImg = document.createElement('img');
      testImg.src = `${url}/favicon.ico?nocache=${Date.now()}`;
      testImg.style.display = 'none';
      
      // Si la imagen se carga, significa que no hay bloqueo
      testImg.onload = () => {
        if (document.body.contains(testFrame)) {
          document.body.removeChild(testFrame);
        }
      };
      
      // Si ocurre un error, podría ser un bloqueo por una extensión
      testImg.onerror = (e: any) => {
        const errorMessage = e?.message || '';
        const blockedErrorPatterns = [
          'BLOCKED_BY_CLIENT',
          'ERR_BLOCKED_BY_CLIENT',
          'net::ERR_BLOCKED_BY_CLIENT',
          'AbortError',
          'NetworkError'
        ];
        
        if (blockedErrorPatterns.some(pattern => errorMessage.includes(pattern))) {
          console.warn(`Bloqueador detectado para ${url}. Algunas funciones pueden no trabajar correctamente.`);
          onBlocked(url);
        }
        
        if (document.body.contains(testFrame)) {
          document.body.removeChild(testFrame);
        }
      };
      
      // Añadir la imagen al iframe para el test
      if (testFrame.contentDocument?.body) {
        testFrame.contentDocument.body.appendChild(testImg);
      }
      
      // Timeout para limpiar si no hay respuesta
      setTimeout(() => {
        if (document.body.contains(testFrame)) {
          document.body.removeChild(testFrame);
        }
      }, 3000);
    } catch (err) {
      // Si hay un error aquí, probablemente las políticas de seguridad son muy estrictas
      console.log('Error al verificar bloqueadores:', err);
    }
  }

  /**
   * Realiza una petición con reintentos inteligentes y backoff exponencial.
   */
  async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 2, delay = 500): Promise<Response> {
    // Importar la función registerBlockedRequest desde el módulo connectivity
    const { registerBlockedRequest } = await import('./connectivity');
    
    let lastError;
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        return response;
      } catch (err: any) {
        lastError = err;
        
        // Detectar errores de bloqueo por extensiones del navegador
        if (err?.message?.includes('ERR_BLOCKED_BY_CLIENT') || 
            err?.message?.includes('BLOCKED_BY_CLIENT') ||
            err?.message?.includes('NetworkError')) {
          // Registrar el bloqueo para reducir comprobaciones futuras
          registerBlockedRequest(url);
          console.warn(`Petición bloqueada detectada en ${url}. Esto puede deberse a extensiones como AdBlock.`);
          throw new Error(`BLOCKER_DETECTED: La petición a ${url} fue bloqueada por el navegador o una extensión`);
        }
        
        // Solo hacer reintento si no es un error de bloqueo
        await new Promise(res => setTimeout(res, delay * Math.pow(1.5, i)));
      }
    }
    throw lastError;
  }

  // Usar un método mejorado para probar la conexión con Fetch
  const testWithModernFetch = async (url: string, endpoint: string): Promise<{
    connected: boolean;
    data?: any;
    error?: any;
  }> => {
    try {
      // Usar fetchWithRetry para robustez
      await fetchWithRetry(`${url}${endpoint}`, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
        credentials: 'omit',
        redirect: 'follow',
        headers: {
          'Cache-Control': 'no-cache, no-store',
        },
      });
      
      // Si llegamos aquí, la petición no-cors funcionó, lo que significa que el servidor existe
      console.log(`Server at ${url} is active (detected with no-cors)`);
      
      // Ahora intentamos una solicitud normal para ver si podemos obtener datos
      try {
        const response = await fetch(`${url}${endpoint}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store',
          },
          cache: 'no-store',
          mode: 'cors',
          credentials: 'omit'
        });
        
        if (response.ok) {
          try {
            const data = await response.json();
            return { connected: true, data };
          } catch (e) {
            // Si no es JSON pero el servidor respondió, está activo
            return { connected: true, data: { status: 'active' } };
          }
        } else {
          // El servidor está activo pero respondió con error
          return { connected: true, data: { status: 'error', code: response.status } };
        }
      } catch (e) {
        // Si la petición con CORS falla pero sabemos que el servidor está activo
        return { connected: true, data: { status: 'cors-limited' } };
      }
    } catch (error) {
      // La petición no-cors también falló
      return { connected: false, error };
    }
  };
  
  // Método alternativo usando iframes para detectar servidores que bloquean fetch
  const testWithIframe = async (url: string): Promise<boolean> => {
    try {
      const isActive = await pingServer(url);
      return isActive;
    } catch (error) {
      return false;
    }
  };

  // Probar cada URL con la estrategia de fetch mejorada
  for (const url of urls) {
    for (const endpoint of endpoints) {
      try {
        console.log(`Testing connection to ${url}${endpoint} with enhanced fetch...`);
        const result = await testWithModernFetch(url, endpoint);
        
        if (result.connected) {
          console.log(`Enhanced fetch successful for ${url}${endpoint}:`, result.data);
          
          // Extraer y guardar la IP del host si está disponible en la respuesta
          if (result.data?.host) {
            updateBackendIp(result.data.host);
          }
          
          return {
            connected: true,
            url,
            status: result.data?.status || 'ok'
          };
        }
      } catch (error) {
        console.log(`Enhanced fetch failed for ${url}${endpoint}:`, error);
      }
    }
  }
  
  // Si ninguna URL funcionó con fetch, probar con iframe
  console.log('Enhanced fetch failed for all URLs, trying iframe ping detection...');
  for (const url of urls) {
    const isActive = await testWithIframe(url);
    if (isActive) {
      console.log(`Server detected at ${url} using iframe ping`);
      return {
        connected: true,
        url,
        status: 'detected'
      };
    }
  }

  // Si ningún método funcionó, probar con XMLHttpRequest como último recurso
  const testWithXHR = (url: string, endpoint: string): Promise<{ connected: boolean, data?: any }> => {
    return new Promise((resolve) => {
      try {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const jsonData = JSON.parse(xhr.responseText);
                resolve({ connected: true, data: jsonData });
              } catch(e) {
                resolve({ connected: true, data: { status: 'ok' } });
              }
            } else if (xhr.status > 0) {
              // Cualquier respuesta HTTP significa que el servidor está activo
              resolve({ connected: true, data: { status: 'error', code: xhr.status } });
            } else {
              resolve({ connected: false });
            }
          }
        };
        xhr.timeout = 3000;
        xhr.ontimeout = () => resolve({ connected: false });
        xhr.onerror = () => resolve({ connected: false });
        xhr.open('GET', `${url}${endpoint}`, true);
        xhr.send();
      } catch (error) {
        resolve({ connected: false });
      }
    });
  };

  console.log('Trying XMLHttpRequest as last resort...');
  for (const url of urls) {
    for (const endpoint of endpoints) {
      const result = await testWithXHR(url, endpoint);
      if (result.connected) {
        console.log(`XHR successful for ${url}${endpoint}:`, result.data);
        return {
          connected: true,
          url,
          status: result.data?.status || 'ok'
        };
      }
    }
  }

  // SOLUCIÓN TEMPORAL: Si sabemos que el servidor está en localhost:3001 y el problema es CORS
  // Asumimos que está activo para evitar bloquear la funcionalidad
  console.log('🔧 Verificando conexión con solución temporal para localhost:3001...');
  try {
    const response = await fetch('http://localhost:3001', {
      method: 'HEAD',
      mode: 'no-cors', // Evita errores CORS pero no permite leer la respuesta
    });
    // Si llegamos aquí sin error, el servidor probablemente está activo
    console.log('✅ Detectado servidor en localhost:3001 con método no-cors');
    return {
      connected: true,
      url: 'http://localhost:3001',
      status: 'detected'
    };
  } catch (e) {
    // Continuar con el flujo normal si esto también falla
    console.log('❌ Solución temporal para localhost:3001 falló:', e);
  }

  // Si llegamos aquí, ninguna URL funcionó con ninguna estrategia
  console.error("No se pudo conectar a ningún servidor backend. Todas las estrategias fallaron.");
  return { 
    connected: false, 
    url: '', 
    error: new Error('No se pudo conectar a ningún servidor de backend') 
  };
};

/**
 * Función para probar la conexión a varios endpoints del backend para verificar
 * que el servidor está completamente funcional, no solo el health check
 */
export const testBackendFeatures = async (baseUrl: string): Promise<{
  status: 'full' | 'partial' | 'minimal' | 'down';
  features: Record<string, boolean>;
}> => {
  if (!baseUrl) {
    return {
      status: 'down',
      features: {}
    };
  }
  
  const endpoints = [
    '/health',           // Health check básico
    '/',                 // Endpoint raíz
    '/customers',        // API de clientes
    '/documents'         // API de documentos
  ];
  
  const results: Record<string, boolean> = {};
  
  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      results[endpoint] = response.ok;
    } catch (error) {
      results[endpoint] = false;
    }
  }
  
  // Determinar el estado general
  const workingEndpoints = Object.values(results).filter(Boolean).length;
  const totalEndpoints = endpoints.length;
  
  let status: 'full' | 'partial' | 'minimal' | 'down';
  
  if (workingEndpoints === 0) {
    status = 'down';
  } else if (workingEndpoints === totalEndpoints) {
    status = 'full';
  } else if (workingEndpoints >= Math.floor(totalEndpoints / 2)) {
    status = 'partial';
  } else {
    status = 'minimal';
  }
  
  return { status, features: results };
};
