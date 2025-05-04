import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || (!supabaseServiceKey && !supabaseAnonKey)) {
  throw new Error('Missing Supabase credentials in environment variables');
}

// Cliente Supabase con privilegios de servicio para operaciones del backend
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Función para conectar a la base de datos
export const connectToDatabase = async () => {
  try {
    // Verificar la conexión realizando una consulta simple
    const { data, error } = await supabaseAdmin.from('documents').select('count').limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('Conexión a Supabase establecida correctamente');
    return true;
  } catch (error) {
    console.error('Error al conectar con Supabase:', error);
    return false;
  }
};