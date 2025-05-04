
export interface Customer {
  id?: string;
  name: string;
  company: string;
  location: string;
  phone: string;
  email?: string;
  type: "person" | "business";
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PaymentMethod {
  id?: string;
  bank: string;
  accountHolder: string;
  accountNumber: string;
  accountType: string;
  isYappy?: boolean;
  yappyLogo?: string;
  yappyPhone?: string;
}

export interface Document {
  id: string;
  documentNumber: string;
  date: string;
  customer: Customer;
  items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  type: 'quote' | 'invoice';
  validDays: number;
  termsAndConditions: string[];
  paymentMethods: PaymentMethod[];
}

export interface CompanyInfo {
  name: string;
  ruc: string;
  dv: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  logo: string;
}

export interface TemplatePreferences {
  primaryColor: string;
  fontFamily: string;
  logoPosition: string;
  showLogo: boolean;
  dateFormat: string;
  colorTheme: string;
  headerLayout: string;
  useTriangleDesign: boolean;
  showWatermark: boolean;
  showSignature: boolean;
  showCompanyName: boolean;
  showFullDocumentNumber: boolean;
  termsAndConditions?: string[];
}
