import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '@/context/loading/LoadingContext';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Componente global de pantalla de carga que observa el contexto de carga.
 * Solo se renderiza una única instancia de este componente en toda la aplicación.
 */
const GlobalLoadingScreen: React.FC = () => {
  // Usar el contexto global para determinar si debe mostrarse
  const { loadingState, resetLoading } = useLoading();
  const [visible, setVisible] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [delayedMessage, setDelayedMessage] = useState('');
  const [failsafe, setFailsafe] = useState(false);
  
  // Referencias para los timeouts para evitar fugas de memoria
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const failsafeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Efecto para gestionar el estado de carga
  useEffect(() => {
    // Limpiar todos los timeouts existentes para evitar condiciones de carrera
    const clearAllTimeouts = () => {
      [showTimeoutRef, messageTimeoutRef, retryTimeoutRef, hideTimeoutRef, failsafeTimeoutRef].forEach(ref => {
        if (ref.current) {
          clearTimeout(ref.current);
          ref.current = null;
        }
      });
    };

    // Timeout de seguridad global para evitar pantallas de carga atascadas
    if (loadingState.isLoading && !failsafe) {
      failsafeTimeoutRef.current = setTimeout(() => {
        console.warn('⚠️ [GlobalLoadingScreen] Failsafe activado - Forzando cierre de carga después de 15 segundos');
        setFailsafe(true);
        resetLoading(); // Forzar reseteo del estado de carga
      }, 15000);
    }

    // Si está cargando, mostrar la UI después de un breve retraso para evitar parpadeos
    if (loadingState.isLoading) {
      clearAllTimeouts(); // Asegurarse de que timeouts previos se cancelen
      
      showTimeoutRef.current = setTimeout(() => {
        setVisible(true);
        
        // Actualizar el mensaje con un pequeño retraso para animaciones suaves
        messageTimeoutRef.current = setTimeout(() => {
          setDelayedMessage(loadingState.message);
        }, 100); // Reducido de 300ms a 100ms
        
        // Mostrar botón de reintentar solo si la carga tarda demasiado
        retryTimeoutRef.current = setTimeout(() => {
          setShowRetry(true);
        }, 2000); // Reducido de 5000ms a 2000ms
      }, 100); // Reducido de 300ms a 100ms
      
    } else {
      // Si ya no está cargando, ocultar con una pequeña transición
      clearAllTimeouts();
      
      if (visible) { // Solo ejecutar si estaba visible para evitar actualizaciones innecesarias
        hideTimeoutRef.current = setTimeout(() => {
          setVisible(false);
          setDelayedMessage('');
          setShowRetry(false);
          setFailsafe(false); // Resetear el estado del failsafe
        }, 100); // Reducido de 300ms a 100ms
      }
    }
    
    // Limpiar todos los timeouts al desmontar el componente
    return clearAllTimeouts;
  }, [loadingState.isLoading, loadingState.message, visible, failsafe, resetLoading]);
  
  // Función para reintentar la carga
  const handleRetry = useCallback(() => {
    setShowRetry(false);
    setFailsafe(false);
    resetLoading();
  }, [resetLoading]);
  
  // Optimización: No renderizar nada si no hay carga activa ni está visible
  if (!visible && !loadingState.isLoading) {
    return null;
  }
  
  return (
    <AnimatePresence>
      {(visible || loadingState.isLoading) && (
        <motion.div 
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="flex flex-col items-center gap-4 text-center px-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            
            <AnimatePresence mode="wait">
              {delayedMessage && (
                <motion.p 
                  className="text-base font-medium"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  key={delayedMessage}
                >
                  {delayedMessage}
                </motion.p>
              )}
            </AnimatePresence>
            
            <motion.p 
              className="text-sm text-muted-foreground mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.3 }}
            >
              {failsafe 
                ? "La carga está tomando más tiempo del esperado..." 
                : "Por favor espere un momento..."}
            </motion.p>
            
            <AnimatePresence>
              {/* Botón de reintentar eliminado por solicitud del usuario */}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoadingScreen;