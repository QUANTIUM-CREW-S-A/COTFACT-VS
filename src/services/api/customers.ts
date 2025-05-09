import { Customer } from '@/types';
import { supabase } from '@/lib/supabase';
import { isValidUUID, handleSupabaseError } from './utils';

export const getCustomers = async () => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleSupabaseError('getCustomers', error, 'cliente');
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
    console.log("Creating customer with data:", customer);
    
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
    
    console.log("Formatted customer for DB:", customerForDB);
    
    const { data, error } = await supabase
      .from('customers')
      .insert(customerForDB)
      .select()
      .single();
    
    if (error) {
      console.error("Supabase customer error:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    return handleSupabaseError('createCustomer', error, 'cliente');
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
    console.log("Updating customer in api/customers.ts with data:", customer);
    
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
    
    console.log("Formatted customer for DB update:", customerForDB);
    
    const { data, error } = await supabase
      .from('customers')
      .update(customerForDB)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleSupabaseError('updateCustomer', error, 'cliente');
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
    return handleSupabaseError('deleteCustomer', error, 'cliente');
  }
};
