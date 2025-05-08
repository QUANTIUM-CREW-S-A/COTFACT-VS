import React, { createContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '@/context/auth';
import { useLoading } from '@/context/loading/LoadingContext';
import { toast } from 'sonner';
import { Document } from '@/types'; // Import Document type
import { DocumentContextValue } from '@/context/types'; // Import DocumentContextValue type

// Initialize DocumentContext with a default value that matches DocumentContextValue
const defaultDocumentContextValue: DocumentContextValue = {
  documents: [],
  setDocuments: () => {},
  isLoading: true,
  // Add other methods like addDocument, updateDocument, deleteDocument, etc., with empty functions
  addDocument: async () => {},
  updateDocument: async () => {},
  deleteDocument: async () => {},
  approveQuote: async () => {},
  convertToInvoice: async () => {},
  getDocumentById: () => undefined,
};

const DocumentContext = createContext<DocumentContextValue>(defaultDocumentContextValue);

export const DocumentProvider = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]); // Explicitly type documents
  const [isLoading, setIsLoading] = useState(false);
  const { authState } = useAuth();
  const { startLoading, stopLoading, resetLoading } = useLoading();

  const loadingSourceRef = useRef(null);
  const loadingTimeoutRef = useRef(null);
  const initialLoadCompletedRef = useRef(false);

  // Referencias para funciones de carga
  const startLoadingRef = useRef(startLoading);
  const stopLoadingRef = useRef(stopLoading);
  const resetLoadingRef = useRef(resetLoading);

  // Actualizar referencias cuando las funciones cambien
  useEffect(() => {
    startLoadingRef.current = startLoading;
    stopLoadingRef.current = stopLoading;
    resetLoadingRef.current = resetLoading;
  }, [startLoading, stopLoading, resetLoading]);

  // Usar un sourceId FIJO para el contexto de documentos
  const DOCUMENT_SOURCE_ID = 'document-context-global';

  const loadData = useCallback(async () => {
    if (!initialLoadCompletedRef.current) {
      setIsLoading(true);
      loadingSourceRef.current = DOCUMENT_SOURCE_ID;
      startLoadingRef.current("Cargando datos de documentos", DOCUMENT_SOURCE_ID); // More specific message

      try {
        const localDocuments = localStorage.getItem('documents');
        if (localDocuments) {
          setDocuments(JSON.parse(localDocuments) as Document[]); // Add type assertion
        } else {
          // If no local documents, initialize with empty array or fetch from server
          setDocuments([]);
        }

        // Simular carga de datos remotos (replace with actual API call if needed)
        // For now, we assume local storage is the source or it starts empty.
        // await new Promise(resolve => setTimeout(resolve, 1000)); // Reduced delay

        initialLoadCompletedRef.current = true;
      } catch (error) {
        console.error("Error al cargar datos de documentos:", error); // More specific message
        toast.error("Error al cargar datos de documentos"); // More specific message
        setDocuments([]); // Ensure documents is an array on error
      } finally {
        setIsLoading(false);
        stopLoadingRef.current(DOCUMENT_SOURCE_ID);
        loadingSourceRef.current = null;
      }
    }
  }, []); // Sin dependencias para evitar reconstrucción

  useEffect(() => {
    loadData();

    const safetyTimeout = setTimeout(() => {
      // Solo forzar reset si sigue cargando después de 10s
      if (initialLoadCompletedRef.current === false) {
        console.warn("⚠️ [DocumentContext] Forzando fin de carga después de timeout de seguridad");
        setIsLoading(false);
        resetLoadingRef.current();
      }
    }, 10000);

    return () => {
      stopLoadingRef.current(DOCUMENT_SOURCE_ID);
      clearTimeout(safetyTimeout);
    };
  }, [loadData]); // Solo depende de loadData que ya no tiene dependencias

  // Ensure all functions from DocumentContextValue are provided in the value
  const value = useMemo(() => ({
    documents,
    setDocuments,
    isLoading,
    // Mock implementations for other context methods, replace with actual logic
    addDocument: async (doc: Document) => {
      setDocuments(prev => [...prev, doc]);
      // Add actual API call and error handling
    },
    updateDocument: async (id: string, updatedDoc: Partial<Document>) => {
      setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, ...updatedDoc } : doc));
      // Add actual API call and error handling
    },
    deleteDocument: async (id: string) => {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      // Add actual API call and error handling
    },
    approveQuote: async (id: string) => {
      // Add actual logic
      console.log("Approving quote:", id);
    },
    convertToInvoice: async (id: string) => {
      // Add actual logic
      console.log("Converting to invoice:", id);
    },
    getDocumentById: (id: string) => {
      return documents.find(doc => doc.id === id);
    }
  }), [documents, isLoading, setDocuments]); // Add setDocuments to dependencies

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

export default DocumentContext;
