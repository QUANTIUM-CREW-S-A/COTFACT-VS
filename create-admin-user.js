#!/usr/bin/env node

/**
 * Script para crear un usuario administrador en Supabase
 * Uso: node create-admin-user.js email@example.com password "Nombre Completo"
 */

import { createClient } from '@supabase/supabase-js';
import readline from 'readline';
import dotenv from 'dotenv';

// Cargar variables de entorno si existe un archivo .env
dotenv.config();

// Función para solicitar input del usuario
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Función para validar formato de email
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Función para crear la tabla profiles si no existe
async function ensureProfilesTableExists(supabase) {
  console.log('Verificando si existe la tabla profiles...');
  
  try {
    // Verificar si la tabla profiles existe
    const { error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
      
    if (!checkError) {
      console.log('✓ La tabla profiles existe.');
      return true;
    }

    console.log('⚠ La tabla profiles no existe o hay un problema con ella. Intentando crearla...');
    
    // Ejecutar la consulta SQL para crear la tabla profiles
    const { error: createError } = await supabase.rpc('create_profiles_if_not_exists');
    
    if (createError) {
      console.log('No se pudo usar la función RPC. Creando tabla manualmente...');
      
      // La función RPC no existe, intentar crear la tabla directamente con SQL
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          username TEXT,
          full_name TEXT,
          email TEXT,
          role TEXT DEFAULT 'user',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP WITH TIME ZONE,
          intentos_fallidos INTEGER DEFAULT 0,
          bloqueado_hasta TIMESTAMP WITH TIME ZONE
        );
        
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Users can view their own profile" 
          ON public.profiles FOR SELECT 
          USING (auth.uid() = id);
        
        CREATE POLICY IF NOT EXISTS "Users can update their own profile" 
          ON public.profiles FOR UPDATE
          USING (auth.uid() = id);
        
        -- Trigger para crear perfil automáticamente
        CREATE OR REPLACE FUNCTION public.handle_new_user() 
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO public.profiles (id, username, full_name, email, role)
          VALUES (
            NEW.id, 
            NEW.raw_user_meta_data->>'username', 
            NEW.raw_user_meta_data->>'full_name', 
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'role', 'user')
          );
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
      `;
      
      const { error: sqlError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (sqlError) {
        console.error('Error al crear la tabla profiles:', sqlError);
        console.log('\nNecesitarás configurar la tabla profiles manualmente en el panel de Supabase.');
        console.log('Sigue las instrucciones en la documentación o pide ayuda a un administrador.');
        return false;
      }
      
      console.log('✓ Tabla profiles creada correctamente.');
      return true;
    }
    
    console.log('✓ Tabla profiles creada correctamente mediante función RPC.');
    return true;
    
  } catch (error) {
    console.error('Error al verificar/crear la tabla profiles:', error);
    return false;
  }
}

// Función para crear una función SQL personalizada para ejecutar SQL dinámico
async function createExecSqlFunction(supabase) {
  try {
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text) RETURNS void AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    const { error } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
    
    if (error) {
      // Si falla, es probable que la función no exista todavía, intentar crearla con REST
      const response = await fetch(`${supabase.supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabase.supabaseKey,
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({ sql: createFunctionSQL })
      });
      
      if (!response.ok) {
        console.log('No se pudo crear la función exec_sql. Algunas operaciones pueden fallar.');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error al crear función exec_sql:', error);
    return false;
  }
}

// Función principal asíncrona
async function createAdminUser() {
  console.log('\n===== Creación de Usuario Administrador para CotFact =====\n');

  // Obtener variables de entorno o solicitar al usuario
  let SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  let SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  
  // Si no están definidas en las variables de entorno, solicitarlas
  if (!SUPABASE_URL) {
    SUPABASE_URL = await prompt('URL de Supabase (ej: https://xyz.supabase.co): ');
  }
  
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    SUPABASE_SERVICE_ROLE_KEY = await prompt('Service Role Key de Supabase: ');
  }

  // Obtener datos del usuario a crear
  let email = process.argv[2] || await prompt('Email del usuario administrador (formato: usuario@dominio.com): ');
  
  // Validar y solicitar de nuevo el email si no es válido
  while (!validateEmail(email)) {
    console.error('Error: Formato de email inválido. Debe ser usuario@dominio.com');
    email = await prompt('Email del usuario administrador (formato: usuario@dominio.com): ');
  }
  
  const password = process.argv[3] || await prompt('Contraseña (mín. 6 caracteres): ');
  const fullName = process.argv[4] || await prompt('Nombre completo: ');
  
  if (!email || !password || !fullName) {
    console.error('Error: Todos los campos son obligatorios');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('Error: La contraseña debe tener al menos 6 caracteres');
    process.exit(1);
  }

  try {
    // Inicializar cliente de Supabase con la clave de Service Role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    console.log('\nPreparando base de datos...');
    
    // Crear la función exec_sql para poder ejecutar SQL dinámico
    await createExecSqlFunction(supabase);
    
    // Asegurarnos de que la tabla profiles existe
    const profilesReady = await ensureProfilesTableExists(supabase);
    
    if (!profilesReady) {
      console.warn('\n⚠️ No se pudo verificar o crear la tabla profiles.');
      console.warn('El proceso continuará, pero puede haber problemas al crear el usuario.');
    }
    
    console.log('\nCreando usuario administrador...');
    
    // Intentar crear el usuario con la API de Supabase
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar correo automáticamente
      user_metadata: {
        full_name: fullName,
        username: email.split('@')[0],
        role: 'root'
      }
    });
    
    if (error) {
      if (error.message.includes('Database error')) {
        console.error('\n❌ Error de base de datos al crear el usuario.');
        console.error('Es probable que el trigger para crear el perfil no esté funcionando correctamente.');
        console.log('\nIntentando crear el usuario e insertar el perfil manualmente...');
        
        // Intentar una creación manual de dos pasos
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
            username: email.split('@')[0],
            role: 'root'
          }
        });
        
        if (userError) {
          throw userError;
        }
        
        // Usuario creado, ahora insertar manualmente el perfil
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userData.user.id,
            username: email.split('@')[0],
            full_name: fullName,
            email: email,
            role: 'root'
          });
          
        if (profileError) {
          console.error('Error al insertar el perfil:', profileError);
          throw new Error('No se pudo insertar el perfil para el usuario creado');
        }
        
        console.log('\n✅ Usuario administrador creado con éxito (modo manual)');
        console.log(`Email: ${email}`);
        console.log(`Nombre: ${fullName}`);
        console.log(`ID: ${userData.user.id}`);
        console.log('\nYa puedes iniciar sesión en la aplicación.');
        return;
      }
      
      throw error;
    }
    
    console.log('\n✅ Usuario administrador creado con éxito');
    console.log(`Email: ${email}`);
    console.log(`Nombre: ${fullName}`);
    console.log(`ID: ${data.user.id}`);
    console.log('\nYa puedes iniciar sesión en la aplicación.');
    
  } catch (error) {
    console.error('\n❌ Error al crear el usuario:');
    console.error(error.message || error);
    console.log('\nVerifica que:');
    console.log('1. Las credenciales de Supabase sean correctas');
    console.log('2. El correo electrónico no esté ya registrado');
    console.log('3. La tabla "profiles" exista en la base de datos');
    
    // Sugerir soluciones específicas según el error
    if (error.message && error.message.includes('JWT')) {
      console.log('\nParece haber un problema con la clave de servicio de Supabase.');
      console.log('Verifica que estés usando la clave "service_role" correcta y no la clave anónima.');
    }
    
    if (error.message && error.message.includes('duplicate') && error.message.includes('email')) {
      console.log('\nEste correo electrónico ya está registrado en la base de datos.');
      console.log('Intenta con otro correo electrónico o recupera la contraseña si es tu cuenta.');
    }
    
    process.exit(1);
  }
}

createAdminUser().catch(console.error);