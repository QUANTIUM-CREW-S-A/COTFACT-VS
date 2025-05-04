
import { CompanyInfo, TemplatePreferences } from '@/types';
import { defaultCompanyInfo, defaultTermsAndConditions, defaultPaymentMethods, mockDocuments } from './mockData';

// Default template preferences
export const defaultTemplatePreferences: TemplatePreferences = {
  primaryColor: "#3b82f6",
  secondaryColor: "#1e40af",
  fontFamily: "Inter",
  showLogo: true,
  showSignature: true,
  colorTheme: "blue",
  headerLayout: "default",
  useTriangleDesign: false,
  showWatermark: true,
  showCompanyName: true,
  showFullDocumentNumber: true,
  logoPosition: "left",
  dateFormat: "DD/MM/YYYY",
  termsAndConditions: defaultTermsAndConditions
};

// Exportamos los valores predeterminados del archivo mockData
export {
  defaultCompanyInfo,
  defaultTermsAndConditions,
  defaultPaymentMethods,
  mockDocuments
};
