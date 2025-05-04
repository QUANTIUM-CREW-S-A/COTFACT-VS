
import { Document, Customer, CompanyInfo, TemplatePreferences } from '@/types';

export interface DocumentContextValue {
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  companyInfo: CompanyInfo;
  setCompanyInfo: React.Dispatch<React.SetStateAction<CompanyInfo>>;
  templatePreferences: TemplatePreferences;
  setTemplatePreferences: React.Dispatch<React.SetStateAction<TemplatePreferences>>;
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updatedDocument: Document) => void;
  deleteDocument: (id: string) => void;
  approveQuote: (id: string) => void;
  convertToInvoice: (id: string) => void;
  getNextDocumentNumber: (type: "quote" | "invoice") => string;
  updateCompanyInfo: (updates: Partial<CompanyInfo>) => void;
  updateTemplatePreferences: (updates: Partial<TemplatePreferences>) => void;
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, updatedCustomer: Customer) => void;
  deleteCustomer: (id: string) => void;
}
