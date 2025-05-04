import { TemplatePreferences } from '@/types';
import { supabase } from '@/lib/supabase';

export const getTemplatePreferences = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('template_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error en getTemplatePreferences:`, error);
    throw error;
  }
};

export const updateTemplatePreferences = async (preferences: Partial<TemplatePreferences> & { user_id: string }) => {
  try {
    const preferencesForDB = {
      font_family: preferences.fontFamily || 'Inter',
      primary_color: preferences.primaryColor || '#3b82f6',
      secondary_color: preferences.secondaryColor || '#1e40af',
      show_logo: preferences.showLogo !== undefined ? preferences.showLogo : true,
      show_signature: preferences.showSignature !== undefined ? preferences.showSignature : true,
      signature_image: preferences.signatureImage,
      user_id: preferences.user_id,
      updated_at: new Date().toISOString()
    };

    const { data: existing } = await supabase
      .from('template_preferences')
      .select('id')
      .eq('user_id', preferences.user_id)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('template_preferences')
        .update(preferencesForDB)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('template_preferences')
        .insert(preferencesForDB)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error(`Error en updateTemplatePreferences:`, error);
    throw error;
  }
};
