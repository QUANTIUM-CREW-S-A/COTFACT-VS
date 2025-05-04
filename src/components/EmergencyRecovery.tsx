import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Home, Bug, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLoading } from '@/context/loading/LoadingContext';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

/**
 * Componente de recuperación de emergencia que se activa cuando se detectan
 * problemas prolongados con el sistema de carga.
 */
const EmergencyRecovery: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState<{
    startTime?: Date;
    duration?: number;
    source?: string;
  }>({});
  
  const { resetLoading, loadingState, toggleDiagnosticMode } = useLoading();
  
  // Comprobar si el loader ha estado activo por más de 20 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      const loadingStartTime = localStorage.getItem('loadingStartTime');
      
      if (loadingStartTime) {
        const startTime = parseInt(loadingStartTime, 10);
        const currentTime = Date.now();
        const loadingDuration = currentTime - startTime;
        const lastSource = localStorage.getItem('lastActiveLoadingSource') || 'desconocido';
        
        // Si han pasado más de 15 segundos, mostrar el panel de recuperación
        if (loadingDuration > 15000) {
          console.warn('⚠️ [EmergencyRecovery] Detectado loading atascado por más de 15 segundos');
          setLoadingDetails({
            startTime: new Date(startTime),
            duration: Math.floor(loadingDuration / 1000),
            source: lastSource
          });
          setIsVisible(true);
        }
      }
    }, 15000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Guardar el tiempo de inicio cuando se monta el componente
  useEffect(() => {
    const existingTime = localStorage.getItem('loadingStartTime');
    
    if (!existingTime) {
      localStorage.setItem('loadingStartTime', Date.now().toString());
    }
    
    return () => {
      // No limpiamos el tiempo al desmontar - lo dejamos para que lo limpie
      // explícitamente la finalización de una operación de carga
    };
  }, []);
  
  // Actualizar la duración del problema cada segundo
  useEffect(() => {
    if (!isVisible || !loadingDetails.startTime) return;
    
    const interval = setInterval(() => {
      const startTime = loadingDetails.startTime?.getTime() || 0;
      const currentTime = Date.now();
      const loadingDuration = currentTime - startTime;
      
      setLoadingDetails(prev => ({
        ...prev,
        duration: Math.floor(loadingDuration / 1000)
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isVisible, loadingDetails.startTime]);
  
  // Funciones de recuperación
  const handleResetLoading = useCallback(() => {
    resetLoading();
    toast.success('Estado de carga reiniciado', {
      description: 'Se han limpiado todos los estados bloqueados'
    });
    setIsVisible(false);
    localStorage.removeItem('loadingStartTime');
    localStorage.removeItem('lastActiveLoadingSource');
  }, [resetLoading]);
  
  const handleReloadApp = useCallback(() => {
    localStorage.removeItem('loadingStartTime');
    localStorage.removeItem('lastActiveLoadingSource');
    window.location.reload();
  }, []);
  
  const handleGoToDashboard = useCallback(() => {
    resetLoading();
    localStorage.removeItem('loadingStartTime');
    localStorage.removeItem('lastActiveLoadingSource');
    // En lugar de usar useNavigate, usamos window.location directamente
    window.location.href = '/dashboard';
    setIsVisible(false);
  }, [resetLoading]);
  
  const handleClose = useCallback(() => {
    setIsVisible(false);
  }, []);
  
  // No renderizar nada si no es visible
  if (!isVisible) {
    return null;
  }
  
  const formatTime = (date?: Date) => {
    if (!date) return 'N/A';
    return date.toLocaleTimeString();
  }
  
  return (
    <motion.div 
      className="fixed bottom-5 right-5 z-50 w-80 rounded-lg bg-white dark:bg-gray-800 shadow-2xl border border-orange-200 dark:border-orange-900 overflow-hidden"
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-orange-50 dark:bg-orange-900/30 border-b border-orange-100 dark:border-orange-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-2" />
          <h3 className="font-medium text-orange-800 dark:text-orange-200">Recuperación de emergencia</h3>
        </div>
        <button
          className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Parece que la aplicación está teniendo problemas para cargar. Puedes usar estas opciones para intentar recuperar el acceso:
        </p>
        <div className="flex flex-col gap-2">
          <Button 
            variant="outline" 
            className="w-full justify-start text-sm" 
            onClick={handleResetLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2 text-blue-500" />
            Reiniciar sistema de carga
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start text-sm" 
            onClick={handleGoToDashboard}
          >
            <Home className="h-4 w-4 mr-2 text-green-500" />
            Ir al Panel Principal
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start text-sm" 
            onClick={handleReloadApp}
          >
            <RefreshCw className="h-4 w-4 mr-2 text-purple-500" />
            Recargar aplicación
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-sm mt-2"
            onClick={() => setExpanded(!expanded)}
          >
            <Info className="h-4 w-4 mr-2 text-gray-500" />
            {expanded ? "Ocultar detalles" : "Mostrar detalles"}
          </Button>
          
          {expanded && (
            <motion.div 
              className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-md"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-2">
                <span className="font-semibold">Inicio del problema: </span>
                {formatTime(loadingDetails.startTime)}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Duración: </span>
                {loadingDetails.duration} segundos
              </div>
              <div className="mb-2">
                <span className="font-semibold">Fuente del bloqueo: </span>
                {loadingDetails.source}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Fuentes activas: </span>
                {loadingState.sources.length}
              </div>
              
              {/* Listado de fuentes activas */}
              {loadingState.sources.length > 0 && (
                <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-2">
                  <p className="font-semibold mb-1">Fuentes de carga activas:</p>
                  <ul className="list-disc pl-4">
                    {loadingState.sources.map((source, index) => (
                      <li key={index} className="mb-1">
                        {source.id} - {Math.floor((Date.now() - source.startTime) / 1000)}s
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Modo diagnóstico toggle */}
              <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bug className="h-3 w-3 mr-1 text-orange-500" />
                    <span className="font-semibold">Modo diagnóstico</span>
                  </div>
                  <Switch
                    checked={loadingState.diagnosticMode}
                    onCheckedChange={toggleDiagnosticMode}
                    size="sm"
                  />
                </div>
                <p className="text-xs mt-1 text-gray-500">
                  Activa para capturar información detallada de los bloqueos
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EmergencyRecovery;