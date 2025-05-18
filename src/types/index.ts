// Base types used throughout the application

// Customer types
export interface Customer {
  id?: string;
  name: string;
  company: string;
  location: string;
  phone: string;
  email?: string;
  type: "person" | "business";
  metadata?: {
    subType?: string;
    notes?: string;
    [key: string]: unknown;
  };
}

// Document types
export interface DocumentItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number; // Changed from price to unitPrice to match usage
  tax?: number;
  discount?: number;
  total: number;
}

// LineItem is an alias for DocumentItem to maintain compatibility
export type LineItem = DocumentItem;

export interface Document {
  id: string;
  type: "quote" | "invoice";
  documentNumber: string;
  date: string;
  expiryDate?: string;
  customer: Customer;
  items: DocumentItem[];
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  notes?: string;
  termsAndConditions: string[]; // Changed from string to string[] to match usage
  validDays: number; // Added validDays property
  status: "draft" | "pending" | "approved" | "paid" | "overdue" | "cancelled" | "rejected"; // Added rejected
  paymentMethods?: PaymentMethod[];
  paymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Company information types
export interface CompanyInfo {
  id?: string;
  name: string;
  logo?: string;
  ruc?: string;
  dv?: string;
  address?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  website?: string;
  user_id?: string;
}

// Template preferences
export interface TemplatePreferences {
  id?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  showLogo: boolean;
  showSignature: boolean;
  signatureImage?: string;
  user_id?: string;
  colorTheme?: string; // Added to match usage
  headerLayout?: string; // Added to match usage
  useTriangleDesign?: boolean; // Added to match usage
  showWatermark?: boolean; // Added to match usage
  termsAndConditions?: string[]; // Added to match usage
  showCompanyName?: boolean; // Added to match usage
  showFullDocumentNumber?: boolean; // Added to match usage
  logoPosition?: string; // Added to match usage
  dateFormat?: string; // Added to match usage
}

// Payment Method types
export interface PaymentMethod {
  id?: string;
  bank: string;
  accountHolder: string;
  accountNumber: string;
  accountType: string;
  isYappy?: boolean;
  yappyPhone?: string;
  yappyLogo?: string;
}

export interface DBDocument {
  id: string;
  title?: string;
  document_number: string;
  date: string;
  customer: DBCustomer;
  items: DBDocumentItem[];
  total: number;
  status: string;
  type: 'quote' | 'invoice';
  expire_date: string | null;
  terms_conditions: string | null;
  notes: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface DBCustomer {
  id: string;
  name: string;
  company: string;
  address: {
    location: string;
  };
  phone: string;
  email: string;
  type: 'business' | 'individual';
}

export interface DBDocumentItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
