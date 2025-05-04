
import { Customer } from '@/types';
import { supabase } from '@/lib/supabase';
import { isValidUUID } from './utils';

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
}) => {
  try {
    console.log("Creating customer with data:", customer);
    
    if (!customer.user_id || customer.user_id === 'anonymous' || !isValidUUID(customer.user_id)) {
      console.error("Invalid user_id for customer creation:", customer.user_id);
      throw new Error("Se requiere un ID de usuario válido");
    }
    
    const customerForDB = {
      user_id: customer.user_id,
      name: customer.name,
      address: customer.address,
      phone: customer.phone,
      email: customer.email,
    };
    
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
    console.error(`Error en createCustomer:`, error);
    throw error;
  }
};

export const updateCustomer = async (id: string, customer: { 
  user_id: string;
  name: string;
  address: { company: string; location: string };
  phone: string;
  email: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .update(customer)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
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
