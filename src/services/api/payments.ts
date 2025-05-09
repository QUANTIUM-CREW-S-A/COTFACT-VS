import { PaymentMethod } from '@/types';
import { supabase } from '@/lib/supabase';
import { isValidUUID, handleSupabaseError } from './utils';

export const getPaymentMethods = async () => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const formattedMethods = data.map(method => {
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
    return handleSupabaseError('getPaymentMethods', error, 'método de pago');
  }
};

export const createPaymentMethod = async (method: Omit<PaymentMethod, 'id'> & { user_id: string }) => {
  try {
    if (!method.user_id || method.user_id === 'anonymous' || !isValidUUID(method.user_id)) {
      throw new Error("Se requiere un ID de usuario válido");
    }
    
    const { user_id, ...paymentMethodData } = method;
    
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
      user_id: user_id,
      is_default: false
    };
    
    const { data, error } = await supabase
      .from('payment_methods')
      .insert(methodForDB)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleSupabaseError('createPaymentMethod', error, 'método de pago');
  }
};

export const updatePaymentMethod = async (id: string, method: Partial<PaymentMethod>) => {
  try {
    const updates: any = {
      updated_at: new Date().toISOString()
    };
    
    if (method.bank || method.accountHolder || method.accountNumber || 
        method.accountType || method.isYappy !== undefined || 
        method.yappyLogo || method.yappyPhone) {
      
      const { data: currentMethod, error: fetchError } = await supabase
        .from('payment_methods')
        .select('details')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
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
      
      if (method.isYappy !== undefined) {
        updates.name = method.isYappy ? 'Yappy' : method.bank || (currentMethod?.details as any)?.bank || 'Cuenta Bancaria';
        updates.type = method.isYappy ? 'mobile' : 'bank';
      } else if (method.bank) {
        updates.name = method.bank;
      }
    }
    
    const { data, error } = await supabase
      .from('payment_methods')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleSupabaseError('updatePaymentMethod', error, 'método de pago');
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
    return handleSupabaseError('deletePaymentMethod', error, 'método de pago');
  }
};
