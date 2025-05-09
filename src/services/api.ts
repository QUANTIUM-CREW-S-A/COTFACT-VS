// Servicio para manejar las peticiones a la API utilizando Supabase

import { Document, Customer, CompanyInfo, TemplatePreferences, PaymentMethod } from '@/types';

// Extend Partial<Document> to include user_id
type DocumentWithUserId = Partial<Document> & { user_id?: string };
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Helper para añadir timestamps a los objetos
const addTimestamps = <T extends object>(obj: T): T & { created_at?: string; updated_at?: string } => {
  const now = new Date().toISOString();
  return {
    ...obj,
    updated_at: now,
    ...('id' in obj ? {} : { created_at: now })
  };
};

// Add a function to enable real-time for tables that need it
export const enableRealtimeForTable = async (tableName: string) => {
  try {
    // Make the table full replica identity to ensure complete row data in change events
    await supabase.rpc('set_table_replica_identity_full', { 
      table_name: tableName 
    } as any);
    
    // Add the table to the supabase_realtime publication
    await supabase.rpc('add_table_to_realtime', { 
      table_name: tableName 
    } as any);
    
    console.log(`Realtime enabled for table: ${tableName}`);
    return true;
  } catch (error) {
    console.error(`Error enabling realtime for table ${tableName}:`, error);
    return false;
  }
};

// Función auxiliar para agregar headers comunes a las consultas Supabase
export const addCommonHeaders = (query: any) => {
  return query.headers({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  });
};

// DOCUMENTOS

interface DocumentDB {
  id: string;
  user_id: string;
  title: string;
  type: string;
  document_number: string;
  date: string;
  customer: Customer;
  items: any[];
  total: number;
  status: string;
  expire_date: string;
  terms_conditions?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const getDocuments = async (): Promise<DocumentDB[]> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching documents:', error);
      throw new Error('Failed to fetch documents');
    }
    
    return data || [];
  } catch (error) {
    console.error(`Error en getDocuments:`, error);
    throw error;
  }
};

export const getDocumentById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error en getDocumentById:`, error);
    throw error;
export const createDocument = async (document: DocumentWithUserId): Promise<DocumentDB> => {
};

export const createDocument = async (document: Partial<Document>): Promise<DocumentDB> => {
  try {
    if (!document.user_id) {
      throw new Error('user_id is required');
    }

    const documentForDB: Partial<DocumentDB> = {
      user_id: document.user_id,
      title: document.title || document.customer?.name,
      type: document.type,
      document_number: document.documentNumber,
      date: document.date,
      customer: document.customer,
      items: document.items,
      total: document.total,
      status: document.status,
      expire_date: document.expireDate,
      terms_conditions: Array.isArray(document.termsAndConditions) 
        ? document.termsAndConditions.join('\n')
        : document.termsAndConditions,
      notes: document.notes
    };

    const documentWithId = {
      ...documentForDB,
      id: uuidv4()
    };
    
    const documentWithTimestamps = addTimestamps(documentWithId);
    
    const { data, error } = await supabase
      .from('documents')
      .insert(documentWithTimestamps)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating document:', error);
      throw new Error('Failed to create document');
    }
    
    return data;
  } catch (error) {
    console.error(`Error en createDocument:`, error);
    throw error;
  }
};

export const updateDocument = async (id: string, document: Partial<Document>) => {
  try {
    // Preparar documento para guardar en Supabase
    const documentForDB: any = {};
    
    if (document.documentNumber) documentForDB.document_number = document.documentNumber;
    if (document.date) documentForDB.date = document.date;
    if (document.customer) documentForDB.customer = document.customer;
    if (document.items) documentForDB.items = document.items;
    if (document.subtotal !== undefined) documentForDB.subtotal = document.subtotal;
    if (document.tax !== undefined) documentForDB.tax = document.tax;
    if (document.total !== undefined) documentForDB.total = document.total;
    if (document.status) documentForDB.status = document.status;
    if (document.type) documentForDB.type = document.type;
    if (document.validDays !== undefined) documentForDB.expire_date = new Date(new Date(document.date || new Date()).getTime() + document.validDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    if (document.termsAndConditions) documentForDB.terms_conditions = document.termsAndConditions.join('\n');
    
    // Añadir solo updated_at para actualizaciones
    const documentWithTimestamp = {
      ...documentForDB,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('documents')
      .update(documentWithTimestamp)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error en updateDocument:`, error);
    throw error;
  }
};

export const deleteDocument = async (id: string) => {
  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error en deleteDocument:`, error);
    throw error;
  }
};

// CLIENTES
export const getCustomers = async () => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error en getCustomers:`, error);
    throw error;
  }
};

export const createCustomer = async (customer: { 
  user_id: string;
  name: string;
  address: { company: string; location: string };
  phone: string;
  email: string;
  type?: string;
}) => {
  try {
    console.log("Creating customer in api.ts with data:", customer);
    
    // Validamos datos mínimos requeridos
    if (!customer.name) {
      throw new Error("El nombre del cliente es obligatorio");
    }
    
    // Adaptar al formato de la tabla real en la base de datos
    // IMPORTANTE: Eliminamos user_id porque no existe en la tabla customers
    const customerForDB = {
      name: customer.name,
      company: customer.address?.company || 'N/A',
      location: customer.address?.location || 'N/A',
      phone: customer.phone || 'N/A',
      email: customer.email || null,
      type: customer.type || 'business',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log("Formatted customer for DB in api.ts:", customerForDB);
    
    const { data, error } = await supabase
      .from('customers')
      .insert(customerForDB)
      .select()
      .single();

    if (error) {
      console.error("Error al crear cliente:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

export const updateCustomer = async (id: string, customer: { 
  user_id: string;
  name: string;
  address: { company: string; location: string };
  phone: string;
  email: string;
  type?: string;
}) => {
  try {
    console.log("Updating customer:", id, "with data:", customer);
    
    // Adaptar al formato de la tabla real en la base de datos
    const customerForDB = {
      name: customer.name,
      company: customer.address?.company || 'N/A',
      location: customer.address?.location || 'N/A',
      phone: customer.phone,
      email: customer.email || null,
      type: customer.type || 'business',
      updated_at: new Date().toISOString()
    };
    
    console.log("Sending update to Supabase:", customerForDB);
    
    const { data, error } = await supabase
      .from('customers')
      .update(customerForDB)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }
    
    console.log("Response from Supabase update:", data);
    
    return data;
  } catch (error) {
    console.error(`Error en updateCustomer:`, error);
    throw error;
  }
};

export const deleteCustomer = async (id: string) => {
  try {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error en deleteCustomer:`, error);
    throw error;
  }
};

// CONFIGURACIÓN DE LA EMPRESA
export const getCompanyInfo = async (userId: string) => {
  try {
    const { data, error } = await addCommonHeaders(
      supabase
        .from('company_info')
        .select('*')
        .eq('user_id', userId)
    );
    
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error al obtener información de la empresa:', error);
    return null;
  }
};

export const updateCompanyInfo = async (info: Partial<CompanyInfo> & { user_id?: string }) => {
  try {
    // Adaptar CompanyInfo al formato de la base de datos
    const infoForDB = {
      name: info.name,
      tax_id: info.ruc && info.dv ? `${info.ruc}-${info.dv}` : undefined,
      email: info.email,
      phone: info.phone,
      logo_url: info.logo,
      address: { 
        location: info.address,
        contactName: info.contactName
      },
      user_id: info.user_id || 'anonymous',
      updated_at: new Date().toISOString()
    };
    
    // Si no existe una fila, crear; de lo contrario, actualizar
    const { data: existingInfo } = await supabase
      .from('company_info')
      .select('id')
      .maybeSingle();
    
    if (existingInfo) {
      // Actualizar información existente
      const { data, error } = await supabase
        .from('company_info')
        .update(infoForDB)
        .eq('id', existingInfo.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Crear nueva información
      const infoWithId = { ...infoForDB, id: uuidv4() };
      
      const { data, error } = await supabase
        .from('company_info')
        .insert(infoWithId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error(`Error en updateCompanyInfo:`, error);
    throw error;
  }
};

// PREFERENCIAS DE PLANTILLA
export const getTemplatePreferences = async (userId: string) => {
  try {
    const { data, error } = await addCommonHeaders(
      supabase
        .from('template_preferences')
        .select('*')
        .eq('user_id', userId)
    );
    
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error al obtener preferencias de plantilla:', error);
    return null;
  }
};

export const updateTemplatePreferences = async (preferences: Partial<TemplatePreferences> & { user_id?: string }) => {
  try {
    console.log("Updating template preferences:", preferences);
    
    // Verificar si tenemos un user_id válido y asegurarnos de que sea un UUID
    if (!preferences.user_id || preferences.user_id === 'anonymous') {
      console.error("No valid user_id provided for template preferences");
      throw new Error("Se requiere un usuario válido para guardar preferencias");
    }
    
    // Convertir del modelo de la aplicación al modelo de la base de datos
    const preferencesForDB = {
      font_family: preferences.fontFamily || 'arial',
      primary_color: preferences.primaryColor || '#3b82f6',
      secondary_color: preferences.secondaryColor || '#1e40af',
      show_logo: preferences.showLogo !== undefined ? preferences.showLogo : true,
      show_signature: preferences.showSignature !== undefined ? preferences.showSignature : true,
      color_theme: preferences.colorTheme || 'blue',
      header_layout: preferences.headerLayout || 'default',
      use_triangle_design: preferences.useTriangleDesign !== undefined ? preferences.useTriangleDesign : false,
      show_watermark: preferences.showWatermark !== undefined ? preferences.showWatermark : true,
      show_company_name: preferences.showCompanyName !== undefined ? preferences.showCompanyName : true,
      show_full_document_number: preferences.showFullDocumentNumber !== undefined ? preferences.showFullDocumentNumber : true,
      logo_position: preferences.logoPosition || 'left',
      date_format: preferences.dateFormat || 'DD/MM/YYYY',
      terms_and_conditions: preferences.termsAndConditions || [],
      user_id: preferences.user_id,
      updated_at: new Date().toISOString()
    };
    
    console.log("Formatted preferences for DB:", preferencesForDB);
    
    // Si no existe una fila, crear; de lo contrario, actualizar
    const { data: existingPreferences } = await supabase
      .from('template_preferences')
      .select('id')
      .eq('user_id', preferences.user_id)
      .maybeSingle();
    
    console.log("Existing preferences:", existingPreferences);
    
    let result;
    
    if (existingPreferences) {
      // Actualizar preferencias existentes
      const { data, error } = await supabase
        .from('template_preferences')
        .update(preferencesForDB)
        .eq('id', existingPreferences.id)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating preferences:", error);
        throw error;
      }
      
      result = data;
    } else {
      // Crear nuevas preferencias
      const preferencesWithId = { ...preferencesForDB, id: uuidv4() };
      
      const { data, error } = await supabase
        .from('template_preferences')
        .insert(preferencesWithId)
        .select()
        .single();
      
      if (error) {
        console.error("Error inserting preferences:", error);
        throw error;
      }
      
      result = data;
    }
    
    console.log("Result from saving preferences:", result);
    return result;
  } catch (error) {
    console.error(`Error en updateTemplatePreferences:`, error);
    throw error;
  }
};

// Métodos de pago
export const getPaymentMethods = async () => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Convertir del formato de la base de datos al formato de la aplicación
    const formattedMethods = data.map(method => {
      // Las propiedades específicas como 'bank', 'accountHolder', etc. están en details
      const details = method.details as any;
      return {
        id: method.id,
        bank: details.bank || '',
        accountHolder: details.accountHolder || '',
        accountNumber: details.accountNumber || '',
        accountType: details.accountType || '',
        isYappy: details.isYappy || false,
        yappyLogo: details.yappyLogo || '',
        yappyPhone: details.yappyPhone || ''
      };
    });
    
    return formattedMethods;
  } catch (error) {
    console.error(`Error en getPaymentMethods:`, error);
    throw error;
  }
};

export const createPaymentMethod = async (method: Omit<PaymentMethod, 'id'> & { user_id: string }) => {
  try {
    console.log("Creating payment method with data:", method);
    
    // Validate user_id is a valid UUID
    if (!method.user_id || method.user_id === 'anonymous') {
      console.error("Invalid user_id for payment method creation:", method.user_id);
      throw new Error("Se requiere un ID de usuario válido");
    }
    
    // Extraemos user_id del objeto method para usarlo por separado
    const { user_id, ...paymentMethodData } = method;
    
    // Preparar el método de pago para guardar en Supabase
    // El campo 'details' contendrá las propiedades específicas del método de pago
    const methodForDB = {
      name: paymentMethodData.isYappy ? 'Yappy' : paymentMethodData.bank || 'Cuenta Bancaria',
      type: paymentMethodData.isYappy ? 'mobile' : 'bank',
      details: {
        bank: paymentMethodData.bank,
        accountHolder: paymentMethodData.accountHolder,
        accountNumber: paymentMethodData.accountNumber,
        accountType: paymentMethodData.accountType,
        isYappy: paymentMethodData.isYappy || false,
        yappyLogo: paymentMethodData.yappyLogo || '',
        yappyPhone: paymentMethodData.yappyPhone || ''
      },
      user_id: user_id, // Usamos el user_id extraído
      is_default: false
    };
    
    console.log("Formatted payment method for DB:", methodForDB);
    
    // Asignar ID y añadir timestamps
    const methodWithId = {
      ...methodForDB,
      id: uuidv4()
    };
    
    const methodWithTimestamps = addTimestamps(methodWithId);
    
    console.log("Sending to Supabase:", methodWithTimestamps);
    
    const { data, error } = await supabase
      .from('payment_methods')
      .insert(methodWithTimestamps)
      .select()
      .single();
    
    if (error) {
      console.error("Supabase error:", error);
      // More detailed error information
      if (error.code === '42501') {
        console.error("Permission denied: Check RLS policies");
      } else if (error.code === '23502') {
        console.error("Not null violation: Check required fields", error.details);
      } else if (error.code === '23505') {
        console.error("Unique violation: Check duplicate entries");
      }
      throw error;
    }
    
    console.log("Response from Supabase:", data);
    
    // Convertir respuesta al formato de la aplicación
    const formattedMethod = {
      id: data.id,
      bank: (data.details as any).bank || '',
      accountHolder: (data.details as any).accountHolder || '',
      accountNumber: (data.details as any).accountNumber || '',
      accountType: (data.details as any).accountType || '',
      isYappy: (data.details as any).isYappy || false,
      yappyLogo: (data.details as any).yappyLogo || '',
      yappyPhone: (data.details as any).yappyPhone || ''
    };
    
    return formattedMethod;
  } catch (error) {
    console.error(`Error en createPaymentMethod:`, error);
    throw error;
  }
};

export const updatePaymentMethod = async (id: string, method: Partial<PaymentMethod>) => {
  try {
    console.log("Updating payment method:", id, "with data:", method);
    
    // Preparar las actualizaciones para Supabase
    const updates: any = {
      updated_at: new Date().toISOString()
    };
    
    // Solo actualizar los campos details si hay cambios en los campos específicos del método
    if (method.bank || method.accountHolder || method.accountNumber || 
        method.accountType || method.isYappy !== undefined || 
        method.yappyLogo || method.yappyPhone) {
      
      // Primero obtener el método actual
      const { data: currentMethod, error: fetchError } = await supabase
        .from('payment_methods')
        .select('details')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.error("Error fetching current payment method:", fetchError);
        throw fetchError;
      }
      
      // Combinar los detalles existentes con las actualizaciones
      updates.details = {
        ...(currentMethod?.details as any || {}),
        bank: method.bank !== undefined ? method.bank : (currentMethod?.details as any)?.bank,
        accountHolder: method.accountHolder !== undefined ? method.accountHolder : (currentMethod?.details as any)?.accountHolder,
        accountNumber: method.accountNumber !== undefined ? method.accountNumber : (currentMethod?.details as any)?.accountNumber,
        accountType: method.accountType !== undefined ? method.accountType : (currentMethod?.details as any)?.accountType,
        isYappy: method.isYappy !== undefined ? method.isYappy : (currentMethod?.details as any)?.isYappy,
        yappyLogo: method.yappyLogo !== undefined ? method.yappyLogo : (currentMethod?.details as any)?.yappyLogo,
        yappyPhone: method.yappyPhone !== undefined ? method.yappyPhone : (currentMethod?.details as any)?.yappyPhone
      };
      
      // Actualizar name y type si es necesario
      if (method.isYappy !== undefined) {
        updates.name = method.isYappy ? 'Yappy' : method.bank || (currentMethod?.details as any)?.bank || 'Cuenta Bancaria';
        updates.type = method.isYappy ? 'mobile' : 'bank';
      } else if (method.bank) {
        updates.name = method.bank;
      }
    }
    
    console.log("Sending update to Supabase:", updates);
    
    const { data, error } = await supabase
      .from('payment_methods')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }
    
    console.log("Response from Supabase update:", data);
    
    // Convertir respuesta al formato de la aplicación
    const formattedMethod = {
      id: data.id,
      bank: (data.details as any).bank || '',
      accountHolder: (data.details as any).accountHolder || '',
      accountNumber: (data.details as any).accountNumber || '',
      accountType: (data.details as any).accountType || '',
      isYappy: (data.details as any).isYappy || false,
      yappyLogo: (data.details as any).yappyLogo || '',
      yappyPhone: (data.details as any).yappyPhone || ''
    };
    
    return formattedMethod;
  } catch (error) {
    console.error(`Error en updatePaymentMethod:`, error);
    throw error;
  }
};

export const deletePaymentMethod = async (id: string) => {
  try {
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error en deletePaymentMethod:`, error);
    throw error;
  }
};

// Users (autenticación)
export const login = async (username: string, password: string) => {
  try {
    // Verificar si es un correo o nombre de usuario
    const isEmail = username.includes('@');
    const email = isEmail ? username : `${username}@example.com`;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error en login:`, error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) throw profileError;
      return profile;
    }
    
    return null;
  } catch (error) {
    console.error(`Error en getCurrentUser:`, error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error en logout:`, error);
    throw error;
  }
};

// Add a function to verify Supabase connection
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('customers').select('*').limit(1);

    if (error) {
      console.error('Error testing Supabase connection:', error);
      return false;
    }

    console.log('Supabase connection successful:', data);
    return true;
  } catch (error) {
    console.error('Unexpected error testing Supabase connection:', error);
    return false;
  }
};
