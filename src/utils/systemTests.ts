import { supabase } from '@/lib/supabase';
import { testSupabaseConnection } from '@/services/api';

/**
 * Función principal para probar todas las funcionalidades del sistema
 * Esta función debe ser llamada después de que el usuario haya iniciado sesión
 */
export async function testAppFunctionality() {
  console.log("🔎 Iniciando pruebas del sistema...");

  // Bandera para rastrear si hay algún error crítico
  let hasCriticalError = false;

  // 1. Verificar conexión a base de datos
  try {
    console.log("⏳ Probando conexión a la base de datos...");
    const dbConnected = await testSupabaseConnection();
    
    if (!dbConnected) {
      hasCriticalError = true;
      throw new Error("❌ Fallo en conexión a la base de datos");
    }
    console.log("✅ Conexión a base de datos correcta");
  } catch (error) {
    console.error("❌ Error al verificar la conexión a la base de datos:", error);
    hasCriticalError = true;
  }

  // 2. Probar métodos HTTP (GET, POST, PUT, DELETE)
  try {
    console.log("⏳ Probando métodos HTTP...");
    
    // Probar GET - Obtener lista de clientes
    console.log("  ⏳ Probando método GET...");
    const { data: getResult, error: getError } = await supabase
      .from('customers')
      .select('*')
      .limit(1);
    
    if (getError) throw new Error(`Método GET falló: ${getError.message}`);
    console.log("  ✅ Método GET funcionando");
    
    // Probar POST - Crear un cliente temporal de prueba
    console.log("  ⏳ Probando método POST...");
    const testCustomer = {
      name: "Cliente Prueba",
      email: "test@example.com",
      created_at: new Date().toISOString(),
      created_by: (await supabase.auth.getUser()).data.user?.id || 'anonymous'
    };
    
    const { data: postResult, error: postError } = await supabase
      .from('customers')
      .insert(testCustomer)
      .select()
      .single();
    
    if (postError) throw new Error(`Método POST falló: ${postError.message}`);
    const testCustomerId = postResult?.id;
    console.log("  ✅ Método POST funcionando");
    
    // Probar PUT - Actualizar el cliente recién creado
    if (testCustomerId) {
      console.log("  ⏳ Probando método PUT...");
      const { error: putError } = await supabase
        .from('customers')
        .update({ name: "Cliente Actualizado" })
        .eq('id', testCustomerId);
      
      if (putError) throw new Error(`Método PUT falló: ${putError.message}`);
      console.log("  ✅ Método PUT funcionando");
      
      // Probar DELETE - Eliminar el cliente de prueba
      console.log("  ⏳ Probando método DELETE...");
      const { error: deleteError } = await supabase
        .from('customers')
        .delete()
        .eq('id', testCustomerId);
      
      if (deleteError) throw new Error(`Método DELETE falló: ${deleteError.message}`);
      console.log("  ✅ Método DELETE funcionando");
    }
    
    console.log("✅ Todos los métodos HTTP están funcionando");
  } catch (error: any) {
    console.error("❌ Error al verificar los métodos HTTP:", error.message);
  }

  // 3. Verificar persistencia de sesión
  try {
    console.log("⏳ Verificando persistencia de la sesión...");
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();
    
    if (sessionError || !user) {
      throw new Error("❌ Sesión de usuario no disponible o expirada");
    }
    console.log("✅ La sesión de usuario está activa", user?.email);
  } catch (error) {
    console.error("❌ Error al verificar la sesión de usuario:", error);
  }

  // 4. Verificar sección de clientes
  try {
    console.log("⏳ Verificando funcionalidad de clientes...");
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .limit(5);
    
    if (customersError) {
      throw new Error(`❌ Error al acceder a los datos de clientes: ${customersError.message}`);
    }
    
    if (customers && customers.length > 0) {
      console.log(`✅ Área de clientes accesible (${customers.length} clientes encontrados)`);
    } else {
      console.log("⚠️ Área de clientes accesible, pero no hay datos");
    }
  } catch (error) {
    console.error("❌ Error al verificar la sección de clientes:", error);
  }

  // 5. Verificar sección de configuración
  try {
    console.log("⏳ Verificando acceso a la configuración...");
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error("No se puede acceder a la información del usuario actual");
    }
    
    // Intentar acceder a la información de la empresa
    const { data: companyInfo, error: companyError } = await supabase
      .from('company_info')
      .select('*')
      .eq('user_id', user.id);
    
    if (companyError) {
      throw new Error(`Error al acceder a la configuración de la empresa: ${companyError.message}`);
    }
    
    // Intentar acceder a las preferencias de plantilla
    const { data: templatePrefs, error: prefError } = await supabase
      .from('template_preferences')
      .select('*')
      .eq('user_id', user.id);
    
    if (prefError) {
      throw new Error(`Error al acceder a las preferencias de plantilla: ${prefError.message}`);
    }
    
    console.log("✅ Acceso a la sección de configuración correcto");
  } catch (error) {
    console.error("❌ Error al verificar la sección de configuración:", error);
  }

  // 6. Verificar exportación
  try {
    console.log("⏳ Verificando funcionalidad de exportación...");
    
    // Verificar que existen los archivos de exportación necesarios
    const exportModules = {
      documentExport: await import('@/utils/documentExport'),
      pdfExport: await import('@/utils/pdfExport')
    };
    
    if (!exportModules.documentExport || !exportModules.pdfExport) {
      throw new Error("Módulos de exportación no encontrados");
    }
    
    console.log("✅ Módulos de exportación disponibles");
    
    // Obtener un documento para probar
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('*')
      .limit(1);
    
    if (documentsError) {
      throw new Error(`No se pueden obtener documentos: ${documentsError.message}`);
    }
    
    if (!documents || documents.length === 0) {
      console.log("⚠️ No hay documentos disponibles para probar la exportación");
    } else {
      console.log("✅ Documentos disponibles para exportación");
    }
  } catch (error) {
    console.error("❌ Error al verificar la funcionalidad de exportación:", error);
  }

  // 7. Verificar si hay errores de consola adicionales
  try {
    console.log("⏳ Verificando errores adicionales...");
    
    // Verificar si el navegador es compatible
    const isChrome = navigator.userAgent.indexOf("Chrome") > -1;
    const isEdge = navigator.userAgent.indexOf("Edg") > -1;
    const isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
    
    if (!isChrome && !isEdge && !isFirefox) {
      console.warn("⚠️ Navegador no completamente compatible. Recomendamos Chrome, Edge o Firefox");
    } else {
      console.log("✅ Navegador compatible");
    }
    
    // Verificar la conexión a Internet
    const isOnline = navigator.onLine;
    if (!isOnline) {
      console.error("❌ No hay conexión a Internet");
    } else {
      console.log("✅ Conexión a Internet disponible");
    }
  } catch (error) {
    console.error("❌ Error al verificar errores adicionales:", error);
  }

  // Resumen final
  const emoji = hasCriticalError ? "⚠️" : "✅";
  console.log(`\n${emoji} Pruebas finalizadas. ${hasCriticalError ? "Se encontraron errores críticos." : "Sistema funcionando correctamente."}`);
  
  return !hasCriticalError;
}

// Función para ejecutar todo el test y mostrar un informe amigable
export async function runDiagnostics() {
  console.log("%c COTFACT-VS - Diagnóstico del Sistema ", "background: #3b82f6; color: white; padding: 10px; font-size: 16px; font-weight: bold; border-radius: 5px;");
  
  try {
    const success = await testAppFunctionality();
    
    if (success) {
      console.log("%c ✨ ¡Sistema en buen estado! ✨ ", "background: #22c55e; color: white; padding: 10px; font-size: 14px; font-weight: bold; border-radius: 5px;");
    } else {
      console.log("%c ⚠️ Se detectaron problemas en el sistema ⚠️ ", "background: #ef4444; color: white; padding: 10px; font-size: 14px; font-weight: bold; border-radius: 5px;");
      console.log("Por favor, revise los errores detallados arriba y contacte al soporte técnico si necesita ayuda.");
    }
  } catch (error) {
    console.error("Error crítico durante el diagnóstico:", error);
    console.log("%c 🚨 Error crítico en el diagnóstico 🚨 ", "background: #991b1b; color: white; padding: 10px; font-size: 14px; font-weight: bold; border-radius: 5px;");
  }
}