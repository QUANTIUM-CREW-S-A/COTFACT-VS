// Script para conectarse a Supabase y mostrar información de la base de datos
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Cargar variables de entorno si existe el archivo .env
try {
  dotenv.config();
} catch (err) {
  console.warn('No se encontró archivo .env, usando valores proporcionados directamente');
}

// Usar las credenciales desde variables de entorno o definirlas directamente aquí
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://emvokmblixoeosgouwsn.supabase.co';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtdm9rbWJsaXhvZW9zZ291d3NuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTAxMjY5NCwiZXhwIjoyMDYwNTg4Njk0fQ.hL69Za7EKMuysYv8jh68OcD4qFwzWzjKWiL0Avxc1Fc';

// Crear una instancia del cliente de Supabase con la clave de servicio
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Función para listar todas las tablas en la base de datos
async function listTables() {
  console.log('Conectando a Supabase en:', supabaseUrl);
  
  try {
    // Ejecutar una consulta SQL para listar todas las tablas públicas
    const { data, error } = await supabase
      .from('pg_tables')
      .select('*')
      .eq('schemaname', 'public');
    
    if (error) throw error;
    
    console.log('\n=== TABLAS EN LA BASE DE DATOS ===');
    if (data && data.length > 0) {
      data.forEach(table => {
        console.log(`- ${table.tablename}`);
      });
    } else {
      console.log('No se encontraron tablas en el esquema público');
    }

    // Para cada tabla, mostrar su estructura
    if (data && data.length > 0) {
      for (const table of data) {
        await describeTable(table.tablename);
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error al listar tablas:', error);
    return [];
  }
}

// Función para mostrar la estructura de una tabla
async function describeTable(tableName) {
  try {
    // Ejecutar una consulta SQL para obtener información sobre las columnas de la tabla
    const { data, error } = await supabase
      .rpc('describe_table', { table_name: tableName });
    
    if (error) throw error;
    
    console.log(`\n=== ESTRUCTURA DE LA TABLA: ${tableName} ===`);
    if (data && data.length > 0) {
      data.forEach(column => {
        console.log(`- ${column.column_name} (${column.data_type})`);
      });
    } else {
      console.log(`No se encontraron columnas en la tabla ${tableName}`);
    }

    // Obtener algunos datos de ejemplo
    const { data: sampleData, error: sampleError } = await supabase
      .from(tableName)
      .select('*')
      .limit(5);
    
    if (!sampleError && sampleData && sampleData.length > 0) {
      console.log(`\n=== MUESTRA DE DATOS DE: ${tableName} (5 registros) ===`);
      console.log(JSON.stringify(sampleData, null, 2));
    }
    
    return data;
  } catch (error) {
    console.error(`Error al describir la tabla ${tableName}:`, error);
    return [];
  }
}

// Ejecutar la función principal
listTables()
  .then(() => {
    console.log('\nConsulta completada con éxito');
  })
  .catch((error) => {
    console.error('Error en la ejecución:', error);
  });

const { createDocument, updateDocument, deleteDocument } = require('./src/services/api');

(async () => {
  try {
    // Crear un documento
    console.log('Creando documento...');
    const newDocument = {
      user_id: 'test-user-id', // Reemplazar con un ID de usuario válido
      title: 'Documento de prueba',
      type: 'quote',
      documentNumber: 'COT-TEST-001',
      date: new Date().toISOString(),
      customer: {
        name: 'Cliente de prueba',
        company: 'Empresa de prueba',
        location: 'Ciudad de prueba',
        phone: '123456789',
        email: 'cliente@prueba.com',
        type: 'company'
      },
      items: [
        {
          description: 'Servicio de prueba',
          quantity: 1,
          unitPrice: 100,
          total: 100
        }
      ],
      total: 100,
      status: 'draft',
      termsAndConditions: ['Condición de prueba'],
    };
    const createdDocument = await createDocument(newDocument);
    console.log('Documento creado:', createdDocument);

    // Actualizar el documento
    console.log('Actualizando documento...');
    const updatedDocument = await updateDocument(createdDocument.id, {
      title: 'Documento actualizado',
      total: 200
    });
    console.log('Documento actualizado:', updatedDocument);

    // Eliminar el documento
    console.log('Eliminando documento...');
    const deleteResult = await deleteDocument(createdDocument.id);
    console.log('Documento eliminado:', deleteResult);
  } catch (error) {
    console.error('Error durante las pruebas:', error);
  }
})();