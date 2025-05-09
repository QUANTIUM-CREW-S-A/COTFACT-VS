import { useContext } from 'react';
import DocumentContext from '@/context/document/DocumentContext';
import { DocumentContextValue } from '@/context/types';

export const useDocuments = (): DocumentContextValue => {
  const context = useContext(DocumentContext);
  
  // En lugar de lanzar un error, retornar un contexto con valores predeterminados
  // cuando se usa fuera del DocumentProvider
  if (context === undefined) {
    console.warn('useDocuments debe ser utilizado dentro de un DocumentProvider');
    
    // Retornar un objeto con valores predeterminados en lugar de lanzar un error
    return {
      documents: [],
      setDocuments: () => {},
      isLoading: false,
      addDocument: async () => null,
      updateDocument: async () => null,
      deleteDocument: async () => {},
      approveQuote: async () => {},
      convertToInvoice: async () => {},
      getDocumentById: () => undefined,
      customers: [],
      companyInfo: {},
      templatePreferences: {},
      addCustomer: async () => undefined,
      updateCustomer: async () => null,
      deleteCustomer: async () => {},
      getNextDocumentNumber: () => "TEMP-001"
    } as DocumentContextValue;
  }
  
  return context;
};