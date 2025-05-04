import { createContext, useContext } from 'react';
import { DocumentContextValue } from './types';

export const DocumentContext = createContext<DocumentContextValue>({} as DocumentContextValue);

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};