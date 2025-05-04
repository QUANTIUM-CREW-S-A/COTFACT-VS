import { CompanyInfo } from '@/types';
import { supabase } from '@/lib/supabase';

export const getCompanyInfo = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('company_info')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error en getCompanyInfo:`, error);
    throw error;
  }
};

export const updateCompanyInfo = async (info: Partial<CompanyInfo> & { user_id: string }) => {
  try {
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
      user_id: info.user_id,
      updated_at: new Date().toISOString()
    };

    const { data: existing } = await supabase
      .from('company_info')
      .select('id')
      .eq('user_id', info.user_id)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('company_info')
        .update(infoForDB)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('company_info')
        .insert(infoForDB)
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
