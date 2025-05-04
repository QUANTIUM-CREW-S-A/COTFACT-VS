import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLoading } from '@/context/loading/LoadingContext';

interface LoadingScreenProps {
  fullScreen?: boolean;
  withProgress?: boolean;
  progress?: number;
  theme?: 'default' | 'gradient' | 'minimal';
  minimumDisplayTime?: number; // Tiempo mínimo en ms que se mostrará la animación
  forceLoading?: boolean; // Prop para controlar explícitamente el estado de carga
  message?: string; // Mensaje personalizado opcional
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  fullScreen = true,
  withProgress = false,
  progress = 0,
  theme = 'minimal',
  minimumDisplayTime = 1000,
  forceLoading = false,
  message,
}) => {
  // Usar el contexto global de carga
  const { loadingState } = useLoading();
  
  // Determinar si estamos en estado de carga y qué mensaje mostrar
  const isLoadingActive = forceLoading || loadingState?.isLoading || false;
  const displayMessage = message || loadingState?.message || 'Cargando...';
  
  // Estado local para controlar la visibilidad de la pantalla de carga
  const [shouldRender, setShouldRender] = useState(isLoadingActive);
  
  // Referencia para timeout de renderizado
  const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Referencia para el tiempo de inicio de carga
  const loadStartTimeRef = useRef<number | null>(null);

  // Efecto para manejar el tiempo mínimo de visualización
  useEffect(() => {
    // Si se activa la carga, registramos el tiempo de inicio
    if (isLoadingActive) {
      // Si no tenemos tiempo de inicio o estaba oculto, reiniciar el tiempo
      if (!loadStartTimeRef.current || !shouldRender) {
        loadStartTimeRef.current = Date.now();
      }
      
      // Asegurarnos de que se muestre inmediatamente
      setShouldRender(true);
      
      // Limpiar cualquier timeout existente
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = null;
      }
    } 
    // Si ya no está cargando pero estaba visible
    else if (shouldRender) {
      // Calcular cuánto tiempo ha estado visible
      const timeElapsed = loadStartTimeRef.current 
        ? Date.now() - loadStartTimeRef.current 
        : 0;
      
      // Calculamos cuánto tiempo adicional debe permanecer visible
      const remainingTime = Math.max(0, minimumDisplayTime - timeElapsed);
      
      // Configuramos un timeout para ocultarlo después del tiempo mínimo
      exitTimeoutRef.current = setTimeout(() => {
        setShouldRender(false);
        loadStartTimeRef.current = null;
      }, remainingTime);
    }
    
    // Limpieza al desmontar
    return () => {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = null;
      }
    };
  }, [isLoadingActive, minimumDisplayTime, shouldRender]);

  // Si no debemos renderizar, no mostramos nada
  if (!shouldRender) return null;

  // Configuraciones para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const loaderVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
  };

  // Animación de la línea cargando
  const lineVariants = {
    hidden: { width: "0%" },
    visible: { 
      width: "100%",
      transition: { 
        duration: 2, 
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  };

  // Animación de los puntos
  const dotVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: [0.5, 1, 0.5],
      transition: {
        delay: i * 0.2,
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    })
  };

  const backgroundClass = theme === 'gradient' 
    ? 'bg-gradient-to-br from-background/95 via-background/90 to-background/85 backdrop-blur-md'
    : theme === 'minimal' 
      ? 'bg-background/90 backdrop-blur-sm' 
      : 'bg-background';

  return (
    <motion.div
      className={`${
        fullScreen 
          ? `fixed inset-0 z-50 ${backgroundClass}` 
          : `w-full h-full min-h-[200px] ${backgroundClass}`
      } flex items-center justify-center`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div
        className="flex flex-col items-center justify-center gap-8"
        variants={loaderVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Loader minimalista */}
        <div className="relative">
          {theme === 'minimal' ? (
            <>
              {/* Versión minimalista */}
              <div className="relative w-24 h-24">
                {/* Círculo central pulsando */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"
                  animate={{
                    opacity: [0.7, 0.4, 0.7],
                    scale: [1, 0.92, 1],
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                />
                
                {/* Círculo girando */}
                <motion.div
                  className="absolute inset-0 border-2 border-blue-500/40 border-t-blue-500 rounded-full"
                  animate={{
                    rotate: 360
                  }}
                  transition={{
                    duration: 1.5,
                    ease: "linear",
                    repeat: Infinity
                  }}
                />
              </div>
            </>
          ) : (
            <>
              {/* Versión más elaborada */}
              <div className="w-24 h-24 relative flex items-center justify-center">
                {/* Círculo externo rotando */}
                <motion.div
                  className="absolute w-full h-full rounded-full border-2 border-t-transparent border-blue-400/80"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Círculo medio rotando inverso */}
                <motion.div
                  className="absolute w-4/5 h-4/5 rounded-full border-2 border-b-transparent border-indigo-400/80"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Círculo interno pulsando */}
                <motion.div
                  className="w-2/4 h-2/4 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500"
                  animate={{ 
                    scale: [0.8, 1.1, 0.8],
                    opacity: [0.7, 0.9, 0.7]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </>
          )}
        </div>
        
        {/* Mensaje con puntos animados */}
        <div className="text-center">
          <div className="flex items-center justify-center">
            <h3 className={`text-base font-medium ${theme === 'minimal' ? 'text-foreground' : 'bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent'}`}>
              {displayMessage}
              <span className="inline-flex ml-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    custom={i}
                    variants={dotVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-primary mx-[1px] inline-block"
                  >
                    .
                  </motion.span>
                ))}
              </span>
            </h3>
          </div>
          
          {/* Línea animada o barra de progreso */}
          {withProgress ? (
            <div className="mt-4 w-48 md:w-64">
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="mt-1 text-xs text-muted-foreground text-right">
                {progress}%
              </div>
            </div>
          ) : theme === 'minimal' && (
            <div className="mt-2 w-16 mx-auto">
              <div className="h-0.5 w-full bg-muted/40 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary/70"
                  variants={lineVariants}
                  initial="hidden"
                  animate="visible"
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoadingScreen;