import { useCallback, useRef, useEffect } from 'react';
import { useLoading } from '@/hooks/use-loading';

/**
 * Hook que simplifica el manejo del estado de carga global y evita problemas comunes
 * 
 * @param defaultSource - Identificador predeterminado para esta fuente de carga
 * @param options - Opciones adicionales para configurar el comportamiento
 * @returns Métodos para gestionar la carga
 */
export function useLoadingManager(
  defaultSource?: string,
  options: {
    timeout?: number;      // Tiempo en ms después del cual la carga se cancelará automáticamente
    silentOnTimeout?: boolean; // Si es true, no muestra ningún mensaje de error cuando se supera el timeout
  } = {}
) {
  const { loadingState, startLoading, stopLoading, resetLoading } = useLoading();
  const sourceIdRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Generar un ID único para esta fuente si no se proporciona uno
  if (!sourceIdRef.current) {
    sourceIdRef.current = defaultSource || `loading-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  // Limpiar el timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // También asegurarse de detener cualquier carga activa al desmontar
      if (sourceIdRef.current) {
        stopLoading(sourceIdRef.current);
      }
    };
  }, [stopLoading]);

  /**
   * Inicia una operación de carga
   * @param message - Mensaje a mostrar durante la carga
   * @param source - Identificador opcional para esta carga específica
   */
  const start = useCallback((message: string, source?: string) => {
    const sourceId = source || sourceIdRef.current;
    if (!sourceId) return;

    // Limpiar cualquier timeout existente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Iniciar la carga
    startLoading(message, sourceId);

    // Configurar un timeout de seguridad si se especificó
    if (options.timeout) {
      timeoutRef.current = setTimeout(() => {
        if (!options.silentOnTimeout) {
          console.warn(`[LoadingManager] La operación ${sourceId} ha excedido el tiempo máximo de espera (${options.timeout}ms)`);
        }
        stop(sourceId);
      }, options.timeout);
    }
  }, [startLoading, options.timeout, options.silentOnTimeout]);

  /**
   * Detiene una operación de carga
   * @param source - Identificador opcional para la carga a detener
   */
  const stop = useCallback((source?: string) => {
    const sourceId = source || sourceIdRef.current;
    if (!sourceId) return;

    // Limpiar el timeout si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Detener la carga
    stopLoading(sourceId);
  }, [stopLoading]);

  /**
   * Envuelve una promesa con indicadores de carga automáticos
   * @param promise - La promesa a ejecutar
   * @param message - Mensaje a mostrar durante la carga
   * @param source - Identificador opcional
   * @returns La misma promesa pasada como parámetro
   */
  const withLoading = useCallback(<T>(
    promise: Promise<T>, 
    message: string, 
    source?: string
  ): Promise<T> => {
    const sourceId = source || sourceIdRef.current;
    if (!sourceId) return promise;

    start(message, sourceId);

    return promise
      .finally(() => {
        stop(sourceId);
      });
  }, [start, stop]);

  return {
    start,
    stop,
    withLoading,
    reset: resetLoading,
    isLoading: loadingState.isLoading,
    currentMessage: loadingState.message,
    sourceId: sourceIdRef.current
  };
}