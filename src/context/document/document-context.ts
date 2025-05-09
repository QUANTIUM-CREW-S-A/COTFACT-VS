import { createContext, useContext } from 'react';
import { DocumentContextValue } from '../types';
import DocumentContext from './DocumentContext';

// El contexto ya está exportado desde './DocumentContext'
// No necesitamos crearlo de nuevo, solo exportar el hook useDocuments

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};