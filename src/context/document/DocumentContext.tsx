import React, { createContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '@/context/auth';
import { useLoading } from '@/context/loading/LoadingContext';
import { toast } from 'sonner';
import { Document } from '@/types'; // Import Document type
import { DocumentContextValue } from '@/context/types'; // Import DocumentContextValue type
import * as api from '@/services/api';
import { supabase } from '@/lib/supabase';
import { enableRealtimeForTable, disableRealtimeForTable } from '@/services/api/realtime';
import { ApiError, ErrorType } from '@/services/api/utils';

// Initialize DocumentContext with a default value that matches DocumentContextValue
const defaultDocumentContextValue: DocumentContextValue = {
  documents: [],
  setDocuments: () => {},
  isLoading: true,
  // Add other methods like addDocument, updateDocument, deleteDocument, etc., with empty functions
  addDocument: async () => null,
  updateDocument: async () => null,
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

  // Helper function to format documents from DB
  const formatDocumentFromDB = (doc: {
    id: string;
    document_number: string;
    date?: string;
    customer?: {
      id?: string;
      name?: string;
      company?: string;
      address?: {
        company?: string;
        location?: string;
      };
      email?: string;
      phone?: string;
      type?: string;
    };
    items?: Array<{
      id?: string;
      description?: string;
      quantity?: number;
      unitPrice?: number;
      total?: number;
    }>;
    tax?: number;
    total?: number;
    status?: string;
    type?: string;
    expire_date?: string;
    terms_conditions?: string | string[];
    payment_methods?: string[];
    created_at?: string;
    updated_at?: string;
  }): Document => {
    // Extract or create customer data
    let customer = { name: '', company: '', location: '', email: '', phone: '', id: '', type: 'business' as const };
    if (doc.customer) {
      if (typeof doc.customer === 'object') {
        customer = {
          id: doc.customer.id || '',
          name: doc.customer.name || '',
          company: doc.customer.company || doc.customer.address?.company || '',
          location: doc.customer.address?.location || '',
          email: doc.customer.email || '',
          phone: doc.customer.phone || '',
          type: doc.customer.type === 'individual' ? 'person' : 'business'
        };
      }
    }

    // Format items
    const items = Array.isArray(doc.items) 
      ? doc.items.map(item => ({
          id: item.id || String(Math.random()),
          description: item.description || '',
          quantity: item.quantity || 0,
          unitPrice: item.unitPrice || 0,
          total: item.total || 0
        }))
      : [];

    // Calculate subtotal and tax (if not provided)
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = doc.tax || 0;
    const total = doc.total || subtotal + tax;

    return {
      id: doc.id,
      documentNumber: doc.document_number,
      date: doc.date || new Date().toISOString().split('T')[0],
      customer,
      items,
      subtotal,
      tax,
      total,
      status: doc.status || 'draft',
      type: doc.type || 'quote',
      validDays: doc.expire_date ? 
        Math.ceil((new Date(doc.expire_date).getTime() - new Date(doc.date).getTime()) / (24 * 60 * 60 * 1000)) : 
        30,
      termsAndConditions: doc.terms_conditions ? 
        (typeof doc.terms_conditions === 'string' ? 
          [doc.terms_conditions] : 
          doc.terms_conditions) : 
        [],
      paymentMethods: doc.payment_methods || [],
      createdAt: doc.created_at || new Date().toISOString(),
      updatedAt: doc.updated_at || new Date().toISOString()
    };
  };

  // Setup Supabase realtime subscriptions
  useEffect(() => {
    // Only setup realtime when authenticated
    if (authState.isAuthenticated && !authState.isLoading) {
      enableRealtimeForTable('documents', (payload) => {
        // Handle document changes from other clients
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        if (eventType === 'INSERT') {
          // Add new document if it's not already in the list
          setDocuments(prev => {
            const exists = prev.some(doc => doc.id === newRecord.id);
            if (!exists) {
              try {
                const formattedDoc = formatDocumentFromDB(newRecord);
                return [formattedDoc, ...prev];
              } catch (err) {
                console.error('Error formatting new document from realtime:', err);
                return prev;
              }
            }
            return prev;
          });
        } 
        else if (eventType === 'UPDATE') {
          // Update existing document
          setDocuments(prev => prev.map(doc => {
            if (doc.id === oldRecord.id) {
              try {
                return formatDocumentFromDB(newRecord);
              } catch (err) {
                console.error('Error formatting updated document from realtime:', err);
                return doc;
              }
            }
            return doc;
          }));
        }
        else if (eventType === 'DELETE') {
          // Remove deleted document
          setDocuments(prev => prev.filter(doc => doc.id !== oldRecord.id));
        }
      });
    }

    return () => {
      disableRealtimeForTable('documents');
    };
  }, [authState.isAuthenticated, authState.isLoading]);

  const loadData = useCallback(async () => {
    if (!initialLoadCompletedRef.current && authState.isAuthenticated && !authState.isLoading) {
      setIsLoading(true);
      loadingSourceRef.current = DOCUMENT_SOURCE_ID;
      startLoadingRef.current("Cargando documentos", DOCUMENT_SOURCE_ID);

      try {
        // Try to fetch documents from API
        const documentsData = await api.getDocuments();
        
        if (Array.isArray(documentsData)) {
          const formattedDocuments = documentsData.map(formatDocumentFromDB);
          setDocuments(formattedDocuments);
          
          // Cache in localStorage as fallback
          localStorage.setItem('documents', JSON.stringify(formattedDocuments));
        } else {
          throw new Error('Invalid documents data received');
        }

        initialLoadCompletedRef.current = true;
      } catch (error) {
        console.error("Error al cargar documentos:", error);
        
        // Try to load from localStorage as fallback
        try {
          const localDocuments = localStorage.getItem('documents');
          if (localDocuments) {
            setDocuments(JSON.parse(localDocuments) as Document[]);
            toast.warning("Usando datos de documentos guardados localmente");
          } else {
            setDocuments([]);
          }
        } catch (storageError) {
          console.error("Error reading from localStorage:", storageError);
          setDocuments([]);
        }

        // Show appropriate error message
        if (error instanceof ApiError) {
          switch(error.type) {
            case ErrorType.NETWORK:
              toast.error("Error de conexión al cargar documentos");
              break;
            case ErrorType.PERMISSION:
              toast.error("No tienes permisos para ver estos documentos");
              break;
            default:
              toast.error("Error al cargar documentos");
          }
        } else {
          toast.error("Error al cargar documentos");
        }
      } finally {
        setIsLoading(false);
        stopLoadingRef.current(DOCUMENT_SOURCE_ID);
        loadingSourceRef.current = null;
      }
    }
  }, [authState.isAuthenticated, authState.isLoading]); 

  useEffect(() => {
    loadData();

    // Increase safety timeout from 10s to 15s to give more time for loading
    const safetyTimeout = setTimeout(() => {
      // Only force reset if still loading after safety timeout
      if (initialLoadCompletedRef.current === false) {
        console.warn("⚠️ [DocumentContext] Forzando fin de carga después de timeout de seguridad");
        setIsLoading(false);
        stopLoadingRef.current(DOCUMENT_SOURCE_ID);
        
        // First try to load from localStorage as fallback
        try {
          const localDocuments = localStorage.getItem('documents');
          if (localDocuments) {
            const parsedDocs = JSON.parse(localDocuments);
            setDocuments(parsedDocs);
            toast.warning("Usando datos de documentos guardados localmente debido a timeout");
            initialLoadCompletedRef.current = true;
          }
        } catch (storageError) {
          console.error("Error reading from localStorage after timeout:", storageError);
        }
        
        // Reset loading state completely
        resetLoadingRef.current();
      }
    }, 15000); // Increased from 10000 to 15000ms

    return () => {
      stopLoadingRef.current(DOCUMENT_SOURCE_ID);
      clearTimeout(safetyTimeout);
    };
  }, [loadData]);

  // Generate next document number
  const getNextDocumentNumber = useCallback((type: "quote" | "invoice") => {
    const prefix = type === "quote" ? "COT-" : "FAC-";
    const typeDocuments = documents.filter(doc => doc.type === type);
    const lastNumber = typeDocuments.length > 0
      ? Math.max(...typeDocuments.map(doc => {
          const parts = doc.documentNumber.split('-');
          return parts.length > 1 ? parseInt(parts[1], 10) : 0;
        }))
      : 0;
    
    return `${prefix}${String(lastNumber + 1).padStart(3, '0')}`;
  }, [documents]);

  // Implementation of CRUD operations using API
  const addDocument = useCallback(async (document: Omit<Document, 'id'>) => {
    try {
      if (!authState.isAuthenticated) {
        toast.error('Necesitas iniciar sesión para crear documentos');
        return null;
      }

      const documentForDB = {
        title: document.customer.name,
        document_number: document.documentNumber,
        type: document.type,
        date: document.date,
        customer: document.customer,
        items: document.items,
        total: document.total,
        status: document.status,
        expire_date: document.validDays ? 
          new Date(new Date(document.date).getTime() + document.validDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
          null,
        terms_conditions: document.termsAndConditions.length > 0 ? 
          document.termsAndConditions.join('\n') : 
          null,
        notes: null,
        user_id: authState.currentUser?.id || ''
      };

      const savedDocument = await api.createDocument(documentForDB);
      const formattedDocument = formatDocumentFromDB(savedDocument);
      
      setDocuments(prev => [formattedDocument, ...prev]);
      
      // Update localStorage cache
      const updatedDocuments = [formattedDocument, ...documents];
      localStorage.setItem('documents', JSON.stringify(updatedDocuments));
      
      toast.success(`${document.type === 'quote' ? 'Cotización' : 'Factura'} creada exitosamente`);
      return formattedDocument;
    } catch (error) {
      console.error('Error al crear documento:', error);
      
      if (error instanceof ApiError) {
        switch(error.type) {
          case ErrorType.NETWORK:
            toast.error("Error de conexión al crear documento");
            break;
          case ErrorType.PERMISSION:
            toast.error("No tienes permisos para crear documentos");
            break;
          case ErrorType.VALIDATION:
            toast.error("Error de validación: " + error.message);
            break;
          default:
            toast.error("Error al crear documento: " + error.message);
        }
      } else {
        toast.error('Error al crear documento');
      }
      
      return null;
    }
  }, [authState.isAuthenticated, authState.currentUser?.id, documents]);

  const updateDocument = useCallback(async (id: string, document: Partial<Document>) => {
    try {
      const documentForDB: Partial<{
        document_number: string;
        date: string;
        customer: typeof document.customer;
        items: typeof document.items;
        total: number;
        status: string;
        type: string;
        expire_date: string;
        terms_conditions: string;
      }> = {};
      
      if (document.documentNumber) documentForDB.document_number = document.documentNumber;
      if (document.date) documentForDB.date = document.date;
      if (document.customer) documentForDB.customer = document.customer;
      if (document.items) documentForDB.items = document.items;
      if (document.total !== undefined) documentForDB.total = document.total;
      if (document.status) documentForDB.status = document.status;
      if (document.type) documentForDB.type = document.type;
      if (document.validDays !== undefined) {
        const baseDate = document.date || documents.find(d => d.id === id)?.date || new Date().toISOString().split('T')[0];
        documentForDB.expire_date = new Date(
          new Date(baseDate).getTime() + document.validDays * 24 * 60 * 60 * 1000
        ).toISOString().split('T')[0];
      }
      if (document.termsAndConditions) {
        documentForDB.terms_conditions = document.termsAndConditions.join('\n');
      }
      
      const updatedDocument = await api.updateDocument(id, documentForDB);
      const existingDoc = documents.find(d => d.id === id);
      const formattedDocument = formatDocumentFromDB({...updatedDocument, ...existingDoc});
      
      setDocuments(prev => prev.map(doc => doc.id === id ? formattedDocument : doc));
      
      // Update localStorage cache
      const updatedDocuments = documents.map(doc => doc.id === id ? formattedDocument : doc);
      localStorage.setItem('documents', JSON.stringify(updatedDocuments));
      
      toast.success(`Documento actualizado exitosamente`);
      return formattedDocument;
    } catch (error) {
      console.error('Error al actualizar documento:', error);
      
      if (error instanceof ApiError) {
        switch(error.type) {
          case ErrorType.NETWORK:
            toast.error("Error de conexión al actualizar documento");
            break;
          case ErrorType.NOT_FOUND:
            toast.error("No se encontró el documento para actualizar");
            break;
          case ErrorType.PERMISSION:
            toast.error("No tienes permisos para actualizar este documento");
            break;
          default:
            toast.error("Error al actualizar documento: " + error.message);
        }
      } else {
        toast.error('Error al actualizar documento');
      }
      
      return null;
    }
  }, [documents]);

  const deleteDocument = useCallback(async (id: string) => {
    try {
      await api.deleteDocument(id);
      
      // Update local state
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      
      // Update localStorage cache
      const updatedDocuments = documents.filter(doc => doc.id !== id);
      localStorage.setItem('documents', JSON.stringify(updatedDocuments));
      
      toast.success('Documento eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      
      if (error instanceof ApiError) {
        switch(error.type) {
          case ErrorType.NETWORK:
            toast.error("Error de conexión al eliminar documento");
            break;
          case ErrorType.NOT_FOUND:
            toast.error("No se encontró el documento para eliminar");
            break;
          case ErrorType.PERMISSION:
            toast.error("No tienes permisos para eliminar este documento");
            break;
          default:
            toast.error("Error al eliminar documento: " + error.message);
        }
      } else {
        toast.error('Error al eliminar documento');
      }
    }
  }, [documents]);

  const convertToInvoice = useCallback(async (id: string) => {
    try {
      // Find the quote to convert
      const quote = documents.find(d => d.id === id);
      if (!quote) {
        toast.error('Cotización no encontrada');
        return;
      }
      
      // Update quote status to approved
      await updateDocument(id, { status: 'approved' as const });
      
      // Create a new invoice based on the quote but without the id
      const {
        id: _,
        documentNumber: __,
        createdAt: ___,
        updatedAt: ____,
        ...baseInvoice
      } = quote;
      
      const newInvoice = {
        ...baseInvoice,
        documentNumber: getNextDocumentNumber('invoice'),
        type: 'invoice' as const,
        status: 'pending' as const,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Create the new invoice
      const savedInvoice = await addDocument(newInvoice);
      if (savedInvoice) {
        toast.success('Cotización convertida a factura exitosamente');
      }
    } catch (error) {
      console.error('Error al convertir a factura:', error);
      toast.error('Error al convertir a factura');
    }
  }, [documents, updateDocument, getNextDocumentNumber, addDocument]);

  const approveQuote = useCallback(async (id: string) => {
    try {
      await convertToInvoice(id);
    } catch (error) {
      console.error('Error al aprobar cotización:', error);
      toast.error('Error al aprobar cotización');
    }
  }, [convertToInvoice]);

  const getDocumentById = useCallback((id: string) => {
    return documents.find(doc => doc.id === id);
  }, [documents]);

  // Provide context value with all required functions
  const value = useMemo(() => ({
    documents,
    setDocuments,
    isLoading,
    addDocument,
    updateDocument,
    deleteDocument,
    approveQuote,
    convertToInvoice,
    getDocumentById,
    getNextDocumentNumber,
    customers: [], // Se actualizará por el CustomerProvider
    companyInfo: {}, // Se actualizará por otro provider
    templatePreferences: {}, // Se actualizará por otro provider
    setCustomers: () => {}, // Placeholder function
    setCompanyInfo: () => {}, // Placeholder function
    setTemplatePreferences: () => {}, // Placeholder function
    updateCompanyInfo: async () => {}, // Placeholder async function
    updateTemplatePreferences: async () => {}, // Placeholder async function

    // Implementación de addCustomer con adaptador para la API
    addCustomer: async (customerData) => {
      try {
        if (!authState.isAuthenticated || !authState.currentUser || !authState.currentUser.id) {
          toast.error('Necesitas iniciar sesión para crear clientes');
          return undefined;
        }
        
        console.log("Creando cliente con datos:", customerData);
        
        // Adaptar el formato de datos para la API
        const customerForAPI = {
          user_id: authState.currentUser.id,
          name: customerData.name,
          // Estructura anidada que espera la API
          address: { 
            company: customerData.company || '', 
            location: customerData.location || '' 
          },
          phone: customerData.phone || '',
          email: customerData.email || '',
          type: customerData.type || 'business'
        };
        
        const savedCustomer = await api.createCustomer(customerForAPI);
        
        // Adaptar el formato de respuesta para la UI
        const formattedCustomer = {
          id: savedCustomer.id,
          name: savedCustomer.name,
          company: savedCustomer.address?.company || '',
          location: savedCustomer.address?.location || '',
          phone: savedCustomer.phone || '',
          email: savedCustomer.email || '',
          type: savedCustomer.type || 'business'
        };
        
        toast.success('Cliente creado exitosamente');
        return formattedCustomer;
      } catch (error) {
        console.error('Error al crear cliente:', error);
        
        if (error instanceof ApiError) {
          switch(error.type) {
            case ErrorType.NETWORK:
              toast.error("Error de conexión al crear cliente");
              break;
            case ErrorType.PERMISSION:
              toast.error("No tienes permisos para crear clientes");
              break;
            case ErrorType.DUPLICATE:
              toast.error("Ya existe un cliente con esos datos");
              break;
            default:
              toast.error("Error al crear cliente: " + error.message);
          }
        } else {
          toast.error('Error al crear cliente: ' + (error instanceof Error ? error.message : 'Error desconocido'));
        }
        
        return undefined;
      }
    },
    
    updateCustomer: async (id, customerData) => {
      try {
        if (!authState.isAuthenticated || !authState.currentUser || !authState.currentUser.id) {
          toast.error('Necesitas iniciar sesión para actualizar clientes');
          return null;
        }
        
        // Adaptar el formato para la API
        const customerForAPI = {
          user_id: authState.currentUser.id,
          name: customerData.name,
          address: { 
            company: customerData.company || '', 
            location: customerData.location || '' 
          },
          phone: customerData.phone || '',
          email: customerData.email || '',
          type: customerData.type || 'business'
        };
        
        const updatedCustomer = await api.updateCustomer(id, customerForAPI);
        
        // Adaptar el formato de respuesta para UI
        const formattedCustomer = {
          id: updatedCustomer.id,
          name: updatedCustomer.name,
          company: updatedCustomer.address?.company || '',
          location: updatedCustomer.address?.location || '',
          phone: updatedCustomer.phone || '',
          email: updatedCustomer.email || '',
          type: updatedCustomer.type || 'business'
        };
        
        toast.success('Cliente actualizado exitosamente');
        return formattedCustomer;
      } catch (error) {
        console.error('Error al actualizar cliente:', error);
        toast.error('Error al actualizar cliente: ' + (error instanceof Error ? error.message : 'Error desconocido'));
        return null;
      }
    },
    
    deleteCustomer: async (id) => {
      try {
        await api.deleteCustomer(id);
        toast.success('Cliente eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        toast.error('Error al eliminar cliente: ' + (error instanceof Error ? error.message : 'Error desconocido'));
      }
    }
  }), [
    documents, 
    isLoading,
    addDocument,
    updateDocument,
    deleteDocument,
    approveQuote,
    convertToInvoice,
    getDocumentById,
    getNextDocumentNumber,
    authState.isAuthenticated,
    authState.currentUser
  ]);

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

export default DocumentContext;
