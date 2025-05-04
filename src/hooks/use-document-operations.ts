import { Document, Customer, DocumentItem, DBDocument, DBCustomer, DBDocumentItem } from '@/types';
import { toast } from 'sonner';
import * as api from '@/services/api';
import { useAuth } from '@/context/auth';

interface DocumentForDB {
  title?: string;
  document_number?: string;
  date?: string;
  customer?: Customer;
  items?: DocumentItem[];
  total?: number;
  status?: Document['status'];
  type?: 'quote' | 'invoice';
  expire_date?: string | null;
  terms_conditions?: string | null;
  notes?: string | null;
  user_id?: string;
}

export function useDocumentOperations(
  documents: Document[],
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>
) {
  const { authState } = useAuth();

  const getNextDocumentNumber = (type: "quote" | "invoice") => {
    const prefix = type === "quote" ? "COT-" : "FAC-";
    const typeDocuments = documents.filter(doc => doc.type === type);
    const lastNumber = typeDocuments.length > 0
      ? Math.max(...typeDocuments.map(doc => {
          const parts = doc.documentNumber.split('-');
          return parts.length > 1 ? parseInt(parts[1], 10) : 0;
        }))
      : 0;
    
    return `${prefix}${String(lastNumber + 1).padStart(3, '0')}`;
  };

  const formatCustomerFromDB = (customer: DBCustomer): Customer => ({
    id: customer.id || '',
    name: customer.name || '',
    company: customer.company || '',
    location: customer.address?.location || '',
    phone: customer.phone || '',
    email: customer.email || '',
    type: customer.type === 'individual' ? 'person' : 'business'
  });

  const formatItemFromDB = (item: DBDocumentItem): DocumentItem => ({
    id: item.id || '',
    description: item.description || '',
    quantity: item.quantity || 0,
    unitPrice: item.unitPrice || 0,
    total: item.total || 0
  });

  const formatDocumentFromDB = (doc: DBDocument, existingDoc?: Document): Document => ({
    id: doc.id,
    documentNumber: doc.document_number,
    date: doc.date,
    customer: typeof doc.customer === 'object' ? formatCustomerFromDB(doc.customer) : existingDoc?.customer || {} as Customer,
    items: Array.isArray(doc.items) ? doc.items.map(formatItemFromDB) : existingDoc?.items || [],
    subtotal: existingDoc?.subtotal || 0,
    tax: existingDoc?.tax || 0,
    total: Number(doc.total) || 0,
    status: doc.status as Document['status'],
    type: doc.type,
    validDays: doc.expire_date ? 
      Math.ceil((new Date(doc.expire_date).getTime() - new Date(doc.date).getTime()) / (24 * 60 * 60 * 1000)) : 
      existingDoc?.validDays || 30,
    termsAndConditions: doc.terms_conditions ? 
      (typeof doc.terms_conditions === 'string' ? 
        [doc.terms_conditions] : 
        doc.terms_conditions as string[]
      ) : [],
    paymentMethods: existingDoc?.paymentMethods || [],
    createdAt: doc.created_at || new Date().toISOString(),
    updatedAt: doc.updated_at || new Date().toISOString()
  });

  const addDocument = async (document: Omit<Document, 'id'>) => {
    try {
      const documentForDB: DocumentForDB = {
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
      
      if (!documentForDB.user_id) {
        toast.error('Necesitas iniciar sesión para realizar esta acción');
        return null;
      }
      
      const savedDocument = await api.createDocument(documentForDB);
      // Cast through unknown to avoid type mismatch
      const documentFormatted = formatDocumentFromDB(savedDocument as unknown as DBDocument);
      
      setDocuments(prev => [documentFormatted, ...prev]);
      toast.success(`${document.type === 'quote' ? 'Cotización' : 'Factura'} creada exitosamente`);
      return documentFormatted;
    } catch (error) {
      console.error('Error al crear documento:', error);
      toast.error('Error al crear documento');
      return null;
    }
  };

  const updateDocument = async (id: string, document: Partial<Document>) => {
    try {
      const documentForDB: DocumentForDB = {};
      
      if (document.documentNumber) documentForDB.document_number = document.documentNumber;
      if (document.date) documentForDB.date = document.date;
      if (document.customer) documentForDB.customer = document.customer;
      if (document.items) documentForDB.items = document.items;
      if (document.total !== undefined) documentForDB.total = document.total;
      if (document.status) documentForDB.status = document.status;
      if (document.type) documentForDB.type = document.type;
      if (document.validDays !== undefined) {
        documentForDB.expire_date = new Date(
          new Date(document.date || new Date()).getTime() + document.validDays * 24 * 60 * 60 * 1000
        ).toISOString().split('T')[0];
      }
      if (document.termsAndConditions) {
        documentForDB.terms_conditions = document.termsAndConditions.join('\n');
      }
      
      const updatedDocument = await api.updateDocument(id, documentForDB);
      const existingDoc = documents.find(d => d.id === id);
      // Cast through unknown to avoid type mismatch
      const documentFormatted = formatDocumentFromDB(updatedDocument as unknown as DBDocument, existingDoc);
      
      setDocuments(prev => prev.map(doc => doc.id === id ? documentFormatted : doc));
      toast.success(`${document.type === 'quote' ? 'Cotización' : 'Factura'} actualizada exitosamente`);
      return documentFormatted;
    } catch (error) {
      console.error('Error al actualizar documento:', error);
      toast.error('Error al actualizar documento');
      return null;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      await api.deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      toast.success('Documento eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      toast.error('Error al eliminar documento');
    }
  };

  const convertToInvoice = async (id: string) => {
    try {
      const quote = documents.find(d => d.id === id);
      if (!quote) {
        toast.error('Cotización no encontrada');
        return;
      }
      
      // Actualizar estado de la cotización a aprobada
      await updateDocument(id, { status: 'approved' as const });
      
      // Crear una nueva factura basada en la cotización pero sin el id
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
      
      // Guardar la nueva factura
      const savedInvoice = await addDocument(newInvoice);
      if (savedInvoice) {
        // Actualizar el estado local inmediatamente
        setDocuments(prev => {
          const updated = prev.map(doc => 
            doc.id === id ? { ...doc, status: 'approved' as const } : doc
          );
          return [savedInvoice, ...updated];
        });
        toast.success('Cotización convertida a factura exitosamente');
      }
    } catch (error) {
      console.error('Error al convertir a factura:', error);
      toast.error('Error al convertir a factura');
    }
  };

  const approveQuote = async (id: string) => {
    try {
      const doc = documents.find(d => d.id === id);
      if (!doc) {
        toast.error('Documento no encontrado');
        return;
      }
      
      // Actualizar estado y crear factura
      await convertToInvoice(id);
    } catch (error) {
      console.error('Error al aprobar cotización:', error);
      toast.error('Error al aprobar cotización');
    }
  };

  return {
    addDocument,
    updateDocument,
    deleteDocument,
    getNextDocumentNumber,
    approveQuote,
    convertToInvoice
  };
}
