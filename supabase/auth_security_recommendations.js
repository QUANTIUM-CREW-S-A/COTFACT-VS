// Configuración recomendada para mejorar la seguridad de autenticación en Supabase

/*
INSTRUCCIONES DE IMPLEMENTACIÓN:

Estos cambios deben aplicarse en la interfaz de administración de Supabase.
Navega a:
1. Authentication > Providers > Email
2. Authentication > URL Configuration
3. Authentication > Security

*/

const supabaseAuthConfig = {
  // 1. Reduce el tiempo de expiración de OTP (Problema: auth_otp_long_expiry)
  otpSettings: {
    expiryTime: 3600, // Recomendado: Máximo 1 hora (3600 segundos)
  },
  
  // 2. Habilitar la protección de contraseñas filtradas (Problema: auth_leaked_password_protection)
  securitySettings: {
    enableLeakedPasswordProtection: true, // Habilita la verificación con HaveIBeenPwned
    enforceStrongPassword: true,          // Recomendar habilitar también esta opción
    minimumPasswordLength: 8,             // Longitud mínima recomendada
  },
  
  // Configuraciones adicionales de seguridad recomendadas
  additionalSettings: {
    disableSignupAutomatically: false,     // Considera habilitarlo en producción
    jwtExpiryTime: 3600,                  // Tiempo recomendado: 1 hora o menos
  }
};

/*
PASOS DETALLADOS:

Para corregir auth_otp_long_expiry:
1. Ir a Authentication > Providers > Email
2. Modificar "OTP Expiry" a 3600 (segundos) o menos
3. Guardar los cambios

Para corregir auth_leaked_password_protection:
1. Ir a Authentication > Security
2. Habilitar "Enable leaked password protection"
3. Guardar los cambios

*/