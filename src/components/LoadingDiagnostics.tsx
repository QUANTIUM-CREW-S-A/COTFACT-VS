import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, X, ChevronUp, ChevronDown, Clock, Info } from 'lucide-react';
import { useLoading } from '@/context/loading/LoadingContext';
import { Button } from './ui/button';

/**
 * Componente de diagnóstico de carga que muestra información detallada
 * sobre las operaciones de carga activas y su estado.
 */
const LoadingDiagnostics: React.FC = () => {
  const { loadingState } = useLoading();
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  // Solo mostrar si el modo diagnóstico está activo
  useEffect(() => {
    if (loadingState.diagnosticMode) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [loadingState.diagnosticMode]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-5 left-5 z-50 bg-slate-800 text-white rounded-lg shadow-xl border border-slate-600 overflow-hidden max-w-md"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
      >
        <div className="bg-slate-700 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <Bug className="h-4 w-4 text-amber-400 mr-2" />
            <h3 className="font-medium text-sm">Monitor de Carga (Diagnóstico)</h3>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-slate-300 hover:text-white hover:bg-slate-600"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-slate-300 hover:text-white hover:bg-slate-600"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <div className="p-3 text-xs">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1 text-blue-400" />
                <span>Estado global: </span>
              </div>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] ${
                  loadingState.isLoading
                    ? "bg-amber-500 text-amber-950"
                    : "bg-green-500 text-green-950"
                }`}
              >
                {loadingState.isLoading ? "CARGANDO" : "INACTIVO"}
              </span>
            </div>

            {loadingState.isLoading && (
              <div className="mb-2">
                <div className="font-medium">Mensaje actual:</div>
                <div className="text-amber-300">{loadingState.message}</div>
              </div>
            )}

            <div className="mb-2">
              <div className="font-medium flex items-center">
                <Info className="h-3 w-3 mr-1 text-blue-400" />
                <span>
                  Fuentes activas: {loadingState.sources.length}
                </span>
              </div>
            </div>

            {loadingState.sources.length > 0 ? (
              <div className="mt-3">
                <div className="font-medium mb-1 text-blue-300">Lista de operaciones:</div>
                <div className="max-h-40 overflow-y-auto">
                  {loadingState.sources.map((source, index) => {
                    const duration = Math.floor(
                      (Date.now() - source.startTime) / 1000
                    );
                    
                    return (
                      <div
                        key={index}
                        className={`mb-2 p-2 rounded ${
                          duration > 10
                            ? "bg-red-900/40 border border-red-800"
                            : duration > 5
                            ? "bg-amber-900/40 border border-amber-800"
                            : "bg-slate-700 border border-slate-600"
                        }`}
                      >
                        <div className="font-medium">{source.id}</div>
                        <div className="text-slate-300">{source.message}</div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[10px] text-slate-400">
                            Inicio: {new Date(source.startTime).toLocaleTimeString()}
                          </span>
                          <span
                            className={`text-[10px] ${
                              duration > 10
                                ? "text-red-300"
                                : duration > 5
                                ? "text-amber-300"
                                : "text-green-300"
                            }`}
                          >
                            Duración: {duration}s
                          </span>
                        </div>
                        
                        {source.stackTrace && (
                          <details className="mt-1">
                            <summary className="text-[10px] text-blue-400 cursor-pointer">
                              Ver stacktrace
                            </summary>
                            <pre className="text-[9px] mt-1 p-1 bg-slate-900 rounded overflow-x-auto whitespace-pre-wrap">
                              {source.stackTrace}
                            </pre>
                          </details>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-2 text-slate-400">
                No hay operaciones de carga activas
              </div>
            )}

            <div className="border-t border-slate-600 mt-2 pt-2 text-[10px] text-slate-400">
              El modo diagnóstico está actualmente ACTIVADO.
              <br />
              Desactívalo desde el panel de emergencia cuando no lo necesites.
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingDiagnostics;