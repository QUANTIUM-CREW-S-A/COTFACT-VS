import { useState, useEffect, useCallback } from 'react';
import { Document, Customer, CompanyInfo, TemplatePreferences } from '@/types';
import { useLocalStorage } from './use-local-storage';
import { useAuth } from '@/context/auth';
import * as api from '@/services/api';
import { supabase } from '@/lib/supabase';
import { defaultCompanyInfo, defaultTemplatePreferences } from '@/lib/defaults';
import { useLoading } from '@/context/loading/LoadingContext';
import { toast } from 'sonner';

// Funciones auxiliares de formateo
const formatDocumentsFromDB = (docs: any[]): Document[] => {
  return docs.map(doc => ({
    id: doc.id,
    documentNumber: doc.document_number,
    date: doc.date,
    customer: formatCustomerFromDB(doc.customer),
    items: formatItemsFromDB(doc.items),
    subtotal: doc.total ? Number(doc.total) - (Number(doc.total) * 0.07) : 0,
    tax: doc.total ? Number(doc.total) * 0.07 : 0,
    total: Number(doc.total) || 0,
    status: doc.status as 'draft' | 'pending' | 'approved' | 'rejected',
    type: doc.type as 'quote' | 'invoice',
    validDays: doc.expire_date ? 30 : 30,
    termsAndConditions: formatTermsFromDB(doc.terms_conditions),
    paymentMethods: [],
    createdAt: doc.created_at || new Date().toISOString(),
    updatedAt: doc.updated_at || new Date().toISOString()
  }));
};

const formatCustomerFromDB = (customer: any): Customer => {
  if (!customer || typeof customer !== 'object') {
    return {
      id: '',
      name: '',
      company: '',
      location: '',
      phone: '',
      email: '',
      type: 'business'
    };
  }
  
  return {
    id: customer.id || '',
    name: customer.name || '',
    company: typeof customer.address === 'object' ? customer.address?.company || '' : '',
    location: typeof customer.address === 'object' ? customer.address?.location || '' : '',
    phone: customer.phone || '',
    email: customer.email || '',
    type: customer.type || 'business'
  };
};

const formatItemsFromDB = (items: any[]): any[] => {
  if (!Array.isArray(items)) return [];
  
  return items.map(item => ({
    id: item.id || '',
    description: item.description || '',
    quantity: item.quantity || 0,
    unitPrice: item.unitPrice || 0,
    total: item.total || 0
  }));
};

const formatTermsFromDB = (terms: any): string[] => {
  if (!terms) return [];
  if (Array.isArray(terms)) return terms;
  if (typeof terms === 'string') return [terms];
  return [];
};

const formatCustomersFromDB = (customers: any[]): Customer[] => {
  return customers.map(customer => ({
    id: customer.id,
    name: customer.name,
    company: typeof customer.address === 'object' ? customer.address?.company || '' : '',
    location: typeof customer.address === 'object' ? customer.address?.location || '' : '',
    phone: customer.phone || '',
    email: customer.email || '',
    type: customer.type || 'business'
  }));
};

export const useInitialData = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(defaultCompanyInfo);
  const [templatePreferences, setTemplatePreferences] = useState<TemplatePreferences>(defaultTemplatePreferences);
  const [isLoading, setIsLoading] = useState(true);
  const { authState } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  
  // Estado para controlar qué datos se han cargado ya
  const [loadedResources, setLoadedResources] = useState({
    documents: false,
    customers: false,
    companyInfo: false,
    templatePreferences: false
  });

  // localStorage para respaldo
  const [docsLocalStorage, setDocsLocalStorage] = useLocalStorage<Document[]>('documents', []);
  const [customersLocalStorage, setCustomersLocalStorage] = useLocalStorage<Customer[]>('customers', []);
  const [companyInfoLocalStorage, setCompanyInfoLocalStorage] = useLocalStorage<CompanyInfo>('companyInfo', defaultCompanyInfo);
  const [templatePreferencesLocalStorage, setTemplatePreferencesLocalStorage] = useLocalStorage<TemplatePreferences>('templatePreferences', defaultTemplatePreferences);
  
  // Cargar documentos solo cuando sea necesario
  const loadDocuments = useCallback(async (force = false) => {
    startLoading("Cargando documentos", "initial-data-documents");
    // Si ya están cargados y no es forzado, usar los datos en memoria
    if (loadedResources.documents && !force && documents.length > 0) {
      stopLoading("initial-data-documents");
      return documents;
    }
    
    if (!authState.isAuthenticated || !authState.currentUser) {
      if (docsLocalStorage.length > 0) {
        setDocuments(docsLocalStorage);
      }
      stopLoading("initial-data-documents");
      return docsLocalStorage;
    }
    
    try {
      const docs = await api.getDocuments();
      if (docs && docs.length > 0) {
        const formattedDocs = formatDocumentsFromDB(docs);
        setDocuments(formattedDocs);
        setDocsLocalStorage(formattedDocs);
        setLoadedResources(prev => ({ ...prev, documents: true }));
        stopLoading("initial-data-documents");
        return formattedDocs;
      } else {
        console.info('No se encontraron documentos en la base de datos');
        if (docsLocalStorage.length > 0) {
          setDocuments(docsLocalStorage);
          stopLoading("initial-data-documents");
          return docsLocalStorage;
        }
      }
    } catch (error) {
      console.error('Error al cargar documentos:', error);
      toast.error("Error al cargar documentos");
      if (docsLocalStorage.length > 0) {
        setDocuments(docsLocalStorage);
        stopLoading("initial-data-documents");
        return docsLocalStorage;
      }
    }
    stopLoading("initial-data-documents");
    return [];
  }, [authState.isAuthenticated, authState.currentUser, documents, docsLocalStorage, loadedResources.documents, startLoading, stopLoading]);
  
  // Cargar clientes solo cuando sea necesario
  const loadCustomers = useCallback(async (force = false) => {
    startLoading("Cargando clientes", "initial-data-customers");
    // Si ya están cargados y no es forzado, usar los datos en memoria
    if (loadedResources.customers && !force && customers.length > 0) {
      stopLoading("initial-data-customers");
      return customers;
    }
    
    if (!authState.isAuthenticated || !authState.currentUser) {
      if (customersLocalStorage.length > 0) {
        setCustomers(customersLocalStorage);
      }
      stopLoading("initial-data-customers");
      return customersLocalStorage;
    }
    
    try {
      const customersData = await api.getCustomers();
      if (customersData && customersData.length > 0) {
        const formattedCustomers = formatCustomersFromDB(customersData);
        setCustomers(formattedCustomers);
        setCustomersLocalStorage(formattedCustomers);
        setLoadedResources(prev => ({ ...prev, customers: true }));
        stopLoading("initial-data-customers");
        return formattedCustomers;
      } else {
        console.info('No se encontraron clientes en la base de datos');
        if (customersLocalStorage.length > 0) {
          setCustomers(customersLocalStorage);
          stopLoading("initial-data-customers");
          return customersLocalStorage;
        }
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      toast.error("Error al cargar clientes");
      if (customersLocalStorage.length > 0) {
        setCustomers(customersLocalStorage);
        stopLoading("initial-data-customers");
        return customersLocalStorage;
      }
    }
    stopLoading("initial-data-customers");
    return [];
  }, [authState.isAuthenticated, authState.currentUser, customers, customersLocalStorage, loadedResources.customers, startLoading, stopLoading]);
  
  // Cargar información de la empresa solo cuando sea necesaria
  const loadCompanyInfo = useCallback(async (force = false) => {
    // Si ya está cargada y no es forzado, usar los datos en memoria
    if (loadedResources.companyInfo && !force) {
      return companyInfo;
    }
    
    if (!authState.isAuthenticated || !authState.currentUser) {
      setCompanyInfo(companyInfoLocalStorage);
      return companyInfoLocalStorage;
    }
    
    try {
      const companyInfoData = await api.getCompanyInfo();
      if (companyInfoData) {
        const formattedCompanyInfo: CompanyInfo = {
          name: companyInfoData.name || '',
          ruc: companyInfoData.tax_id?.split('-')[0] || '',
          dv: companyInfoData.tax_id?.split('-')[1] || '',
          contactName: typeof companyInfoData.address === 'object' ? ((companyInfoData.address as any)?.contactName || '') : '',
          phone: companyInfoData.phone || '',
          email: companyInfoData.email || '',
          address: typeof companyInfoData.address === 'object' ? ((companyInfoData.address as any)?.location || '') : '',
          logo: companyInfoData.logo_url || ''
        };
        
        setCompanyInfo(formattedCompanyInfo);
        setCompanyInfoLocalStorage(formattedCompanyInfo);
        setLoadedResources(prev => ({ ...prev, companyInfo: true }));
        return formattedCompanyInfo;
      } else {
        console.info('No se encontró información de empresa en la base de datos');
        setCompanyInfo(companyInfoLocalStorage);
        return companyInfoLocalStorage;
      }
    } catch (error) {
      console.error('Error al cargar información de empresa:', error);
      setCompanyInfo(companyInfoLocalStorage);
      return companyInfoLocalStorage;
    }
  }, [authState.isAuthenticated, authState.currentUser, companyInfo, companyInfoLocalStorage, loadedResources.companyInfo]);
  
  // Cargar preferencias de plantilla solo cuando sea necesario
  const loadTemplatePreferences = useCallback(async (force = false) => {
    // Si ya están cargadas y no es forzado, usar los datos en memoria
    if (loadedResources.templatePreferences && !force) {
      return templatePreferences;
    }
    
    if (!authState.isAuthenticated || !authState.currentUser) {
      setTemplatePreferences(templatePreferencesLocalStorage);
      return templatePreferencesLocalStorage;
    }
    
    try {
      const templatePrefsData = await api.getTemplatePreferences();
      if (templatePrefsData) {
        const formattedPrefs: TemplatePreferences = {
          primaryColor: templatePrefsData.primary_color || '#3b82f6',
          secondaryColor: templatePrefsData.secondary_color || '#1e40af',
          fontFamily: templatePrefsData.font_family || 'arial',
          showLogo: templatePrefsData.show_logo !== undefined ? templatePrefsData.show_logo : true,
          showSignature: templatePrefsData.show_signature !== undefined ? templatePrefsData.show_signature : true,
          logoPosition: templatePrefsData.logo_position || 'left',
          dateFormat: templatePrefsData.date_format || 'DD/MM/YYYY',
          colorTheme: templatePrefsData.color_theme || 'blue',
          headerLayout: templatePrefsData.header_layout || 'default',
          useTriangleDesign: templatePrefsData.use_triangle_design !== undefined ? templatePrefsData.use_triangle_design : false,
          showWatermark: templatePrefsData.show_watermark !== undefined ? templatePrefsData.show_watermark : true,
          showCompanyName: templatePrefsData.show_company_name !== undefined ? templatePrefsData.show_company_name : true,
          showFullDocumentNumber: templatePrefsData.show_full_document_number !== undefined ? templatePrefsData.show_full_document_number : true,
          termsAndConditions: templatePrefsData.terms_and_conditions || []
        };
        
        setTemplatePreferences(formattedPrefs);
        setTemplatePreferencesLocalStorage(formattedPrefs);
        setLoadedResources(prev => ({ ...prev, templatePreferences: true }));
        return formattedPrefs;
      } else {
        console.info('No se encontraron preferencias de plantilla en la base de datos');
        setTemplatePreferences(templatePreferencesLocalStorage);
        return templatePreferencesLocalStorage;
      }
    } catch (error) {
      console.error('Error al cargar preferencias de plantilla:', error);
      setTemplatePreferences(templatePreferencesLocalStorage);
      return templatePreferencesLocalStorage;
    }
  }, [authState.isAuthenticated, authState.currentUser, templatePreferences, templatePreferencesLocalStorage, loadedResources.templatePreferences]);

  // Set up real-time subscriptions - con límite de frecuencia
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.currentUser) return;
    
    console.log("Setting up real-time subscriptions for initial data");
    
    // Límite de tiempo para evitar múltiples recargas cercanas
    let documentDebounceTimer: NodeJS.Timeout | null = null;
    let customerDebounceTimer: NodeJS.Timeout | null = null;
    
    const documentsChannel = supabase
      .channel('documents-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'documents',
        filter: `user_id=eq.${authState.currentUser.id}`
      }, async (payload) => {
        console.log("Document change detected:", payload);
        
        // Evitar múltiples cargas cercanas en el tiempo
        if (documentDebounceTimer) {
          clearTimeout(documentDebounceTimer);
        }
        
        documentDebounceTimer = setTimeout(() => {
          loadDocuments(true); // Forzar recarga
        }, 2000); // Esperar 2 segundos para evitar múltiples solicitudes
      })
      .subscribe();
    
    const customersChannel = supabase
      .channel('customers-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'customers',
        filter: `user_id=eq.${authState.currentUser.id}`
      }, async (payload) => {
        console.log("Customer change detected:", payload);
        
        // Evitar múltiples cargas cercanas en el tiempo
        if (customerDebounceTimer) {
          clearTimeout(customerDebounceTimer);
        }
        
        customerDebounceTimer = setTimeout(() => {
          loadCustomers(true); // Forzar recarga
        }, 2000); // Esperar 2 segundos para evitar múltiples solicitudes
      })
      .subscribe();

    return () => {
      console.log("Cleaning up real-time subscriptions");
      if (documentDebounceTimer) clearTimeout(documentDebounceTimer);
      if (customerDebounceTimer) clearTimeout(customerDebounceTimer);
      supabase.removeChannel(documentsChannel);
      supabase.removeChannel(customersChannel);
    };
  }, [authState.isAuthenticated, authState.currentUser?.id, loadDocuments, loadCustomers]);

  // Initial data loading - minimiza las cargas iniciales al arranque
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      
      // Usar primero los datos del localStorage para una carga rápida inicial
      if (docsLocalStorage.length > 0) {
        setDocuments(docsLocalStorage);
      }
      
      if (customersLocalStorage.length > 0) {
        setCustomers(customersLocalStorage);
      }
      
      setCompanyInfo(companyInfoLocalStorage);
      setTemplatePreferences(templatePreferencesLocalStorage);
      
      setIsLoading(false);
      
      // Solo si está autenticado, cargamos los datos del servidor en segundo plano
      if (authState.isAuthenticated && authState.currentUser) {
        // Retraso para mejorar la experiencia de carga inicial
        setTimeout(() => {
          // Cargar solo la información mínima necesaria al inicio
          loadDocuments();
          loadCustomers();
        }, 1000);
      }
    };
    
    initializeData();
  }, [authState.isAuthenticated, authState.currentUser?.id]);

  // Guardar en localStorage cuando cambien
  useEffect(() => {
    if (documents.length > 0) {
      setDocsLocalStorage(documents);
    }
  }, [documents]);
  
  useEffect(() => {
    if (customers.length > 0) {
      setCustomersLocalStorage(customers);
    }
  }, [customers]);
  
  useEffect(() => {
    setCompanyInfoLocalStorage(companyInfo);
  }, [companyInfo]);
  
  useEffect(() => {
    setTemplatePreferencesLocalStorage(templatePreferences);
  }, [templatePreferences]);

  return {
    documents,
    setDocuments,
    customers,
    setCustomers,
    companyInfo,
    setCompanyInfo,
    templatePreferences,
    setTemplatePreferences,
    isLoading,
    // Exportamos las funciones de carga bajo demanda
    loadDocuments,
    loadCustomers,
    loadCompanyInfo,
    loadTemplatePreferences
  };
};
