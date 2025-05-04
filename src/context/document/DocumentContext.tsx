import React, { createContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '@/context/auth';
import { useLoading } from '@/context/loading/LoadingContext';
import { toast } from 'sonner';

const DocumentContext = createContext(null);

export const DocumentProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { authState } = useAuth();
  const { startLoading, stopLoading, resetLoading } = useLoading();

  const loadingSourceRef = useRef(null);
  const loadingTimeoutRef = useRef(null);
  const initialLoadCompletedRef = useRef(false);

  const loadData = useCallback(async () => {
    if (!initialLoadCompletedRef.current) {
      setIsLoading(true);
      const sourceId = `document-context-${Date.now()}`;
      loadingSourceRef.current = sourceId;
      startLoading("Cargando datos", sourceId);

      try {
        const localDocuments = localStorage.getItem('documents');
        if (localDocuments) {
          setDocuments(JSON.parse(localDocuments));
        }

        // Simular carga de datos remotos
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Marcar como completado
        initialLoadCompletedRef.current = true;
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("Error al cargar datos del servidor");
      } finally {
        setIsLoading(false);
        if (loadingSourceRef.current) {
          stopLoading(loadingSourceRef.current);
          loadingSourceRef.current = null;
        }
      }
    }
  }, [startLoading, stopLoading]);

  useEffect(() => {
    loadData();

    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn("⚠️ [DocumentContext] Forzando fin de carga después de timeout de seguridad");
        setIsLoading(false);
        resetLoading();
      }
    }, 10000);

    return () => clearTimeout(safetyTimeout);
  }, [loadData, isLoading, resetLoading]);

  const value = useMemo(() => ({
    documents,
    setDocuments,
    isLoading
  }), [documents, isLoading]);

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

export default DocumentContext;
