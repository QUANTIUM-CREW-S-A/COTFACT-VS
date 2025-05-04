import { useContext } from 'react';
import { DocumentContext } from '@/context/document/document-context';
import { DocumentContextValue } from '@/context/types';

export const useDocuments = (): DocumentContextValue => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};