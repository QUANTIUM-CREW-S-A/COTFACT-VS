import { supabase } from '@/lib/supabase';

export const login = async (username: string, password: string) => {
  try {
    // Si el usuario ingresa 'admin', usar el email correcto de la base de datos
    const email = username === 'admin' ? 'admin@example.com' : username.includes('@') ? username : `${username}@example.com`;
    
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
