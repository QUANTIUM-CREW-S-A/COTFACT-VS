import React, { createContext, useState, useContext, ReactNode, useEffect, useRef, useCallback } from 'react';

// Tipos
interface LoadingSource {
  id: string;
  message: string;
  startTime: number;
  stackTrace?: string; // Nueva propiedad para capturar la pila de llamadas
}

interface LoadingState {
  isLoading: boolean;
  message: string;
  sources: LoadingSource[];
  diagnosticMode: boolean; // Nueva propiedad para modo diagnóstico
}

interface LoadingContextType {
  loadingState: LoadingState;
  startLoading: (message: string, source: string) => void;
  stopLoading: (source: string) => void;
  resetLoading: () => void;
  toggleDiagnosticMode: () => void; // Nuevo método para activar/desactivar diagnósticos
}

// Valor predeterminado del contexto
const defaultContext: LoadingContextType = {
  loadingState: {
    isLoading: false,
    message: '',
    sources: [],
    diagnosticMode: false,
  },
  startLoading: () => {},
  stopLoading: () => {},
  resetLoading: () => {},
  toggleDiagnosticMode: () => {},
};

// Crear el contexto
const LoadingContext = createContext<LoadingContextType>(defaultContext);

// Hook para usar el contexto de carga
export const useLoading = () => useContext(LoadingContext);

// Obtener el stack trace actual para debugging
const getStackTrace = (): string => {
  try {
    throw new Error('Stack trace');
  } catch (error) {
    if (error instanceof Error) {
      // Quitar las primeras 2 líneas que corresponden a este método y a startLoading
      return error.stack?.split('\n').slice(2).join('\n') || '';
    }
    return '';
  }
};

// Proveedor del contexto
export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    message: '',
    sources: [],
    diagnosticMode: localStorage.getItem('loading-diagnostic-mode') === 'true',
  });
  
  // Referencia para el intervalo de verificación de fuentes inactivas
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Referencia para mantener la última versión de sources
  const sourcesRef = useRef<LoadingSource[]>([]);
  
  // Actualizar la ref cuando cambia el state
  useEffect(() => {
    sourcesRef.current = loadingState.sources;
  }, [loadingState.sources]);

  // Activar/desactivar modo diagnóstico
  const toggleDiagnosticMode = useCallback(() => {
    setLoadingState(prev => {
      const newMode = !prev.diagnosticMode;
      localStorage.setItem('loading-diagnostic-mode', newMode.toString());
      return {
        ...prev,
        diagnosticMode: newMode
      };
    });
  }, []);
  
  // Iniciar la carga con un mensaje
  const startLoading = useCallback((message: string, source: string) => {
    console.log(`[Loading] Started from ${source}: ${message}`);
    
    // Capturar stack trace si el modo diagnóstico está activado
    const stackTrace = loadingState.diagnosticMode ? getStackTrace() : undefined;
    
    setLoadingState(prevState => {
      // Filtrar fuentes existentes con el mismo ID
      const filteredSources = prevState.sources.filter(s => s.id !== source);
      
      // Agregar la nueva fuente con timestamp y stack trace
      const newSources = [...filteredSources, { 
        id: source, 
        message, 
        startTime: Date.now(),
        stackTrace 
      }];
      
      return {
        ...prevState,
        isLoading: true,
        message: message,
        sources: newSources
      };
    });
    
    // Guardar metadata de inicio de carga para el sistema de emergencia
    localStorage.setItem('loadingStartTime', Date.now().toString());
    localStorage.setItem('lastActiveLoadingSource', source);
  }, [loadingState.diagnosticMode]);

  // Detener la carga para un origen específico
  const stopLoading = useCallback((source: string) => {
    console.log(`[Loading] Stopped from ${source}`);
    
    setLoadingState(prevState => {
      // Filtrar la fuente del array
      const newSources = prevState.sources.filter(s => s.id !== source);
      
      // Determinar nuevos estados
      const newIsLoading = newSources.length > 0;
      const newMessage = newSources.length > 0 ? newSources[newSources.length - 1].message : '';
      
      // Si ya no quedan sources, limpiar metadata de emergencia
      if (newSources.length === 0) {
        localStorage.removeItem('loadingStartTime');
        localStorage.removeItem('lastActiveLoadingSource');
      }
      
      return {
        ...prevState,
        isLoading: newIsLoading,
        message: newMessage,
        sources: newSources
      };
    });
  }, []);

  // Resetear completamente el estado de carga
  const resetLoading = useCallback(() => {
    console.log('[Loading] Reset all loading states');
    
    // Si había fuentes activas, las registramos para depuración
    if (loadingState.sources.length > 0) {
      console.warn('[Loading] Fuentes de carga activas al momento del reset:', 
        loadingState.sources.map(s => ({
          id: s.id,
          message: s.message,
          timeActive: `${Math.round((Date.now() - s.startTime) / 1000)}s`,
          stackTrace: s.stackTrace
        }))
      );
    }
    
    // Reiniciar el estado
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      message: '',
      sources: []
    }));
    
    // Limpiar metadata de emergencia
    localStorage.removeItem('loadingStartTime');
    localStorage.removeItem('lastActiveLoadingSource');
  }, [loadingState.sources]);

  // Efecto para detectar y limpiar fuentes de carga inactivas
  useEffect(() => {
    // Limpiar cualquier intervalo existente
    if (cleanupIntervalRef.current) {
      clearInterval(cleanupIntervalRef.current);
    }
    
    // Verificar fuentes inactivas cada 5 segundos
    cleanupIntervalRef.current = setInterval(() => {
      const currentSources = sourcesRef.current;
      if (currentSources.length > 0) {
        const now = Date.now();
        const MAX_SOURCE_AGE = 15000; // 15 segundos (más estricto que antes)
        
        // Buscar fuentes que llevan demasiado tiempo activas
        const oldSources = currentSources.filter(
          source => now - source.startTime > MAX_SOURCE_AGE
        );
        
        // Si hay fuentes antiguas, eliminarlas
        if (oldSources.length > 0) {
          console.warn(
            `[Loading] Detectadas ${oldSources.length} fuentes de carga inactivas por más de 15s:`,
            oldSources.map(s => ({
              id: s.id,
              timeActive: `${Math.round((now - s.startTime) / 1000)}s`,
              stackTrace: s.stackTrace
            }))
          );
          
          // Filtrar solo las fuentes activas
          const activeSources = currentSources.filter(
            source => now - source.startTime <= MAX_SOURCE_AGE
          );
          
          // Actualizar el estado (solo si realmente hay cambios)
          if (oldSources.length > 0) {
            setLoadingState(prev => ({
              ...prev,
              isLoading: activeSources.length > 0,
              message: activeSources.length > 0 ? activeSources[activeSources.length - 1].message : '',
              sources: activeSources
            }));
            
            // Si no quedan fuentes activas después de la limpieza
            if (activeSources.length === 0) {
              localStorage.removeItem('loadingStartTime');
              localStorage.removeItem('lastActiveLoadingSource');
            }
          }
        }
      }
    }, 5000); // Verificar cada 5 segundos
    
    // Limpiar al desmontar
    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, []); // Solo se ejecuta al montar/desmontar, no depende de loadingState.sources

  return (
    <LoadingContext.Provider value={{ 
      loadingState, 
      startLoading, 
      stopLoading, 
      resetLoading,
      toggleDiagnosticMode
    }}>
      {children}
    </LoadingContext.Provider>
  );
};

export { LoadingContext };