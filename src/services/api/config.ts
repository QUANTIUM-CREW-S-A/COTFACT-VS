/**
 * Configuración central de conexiones API
 * Este archivo centraliza las URLs de backend para facilitar cambios
 */

// Detectar automáticamente la IP local para desarrollo
export const getLocalIpAddress = (): string => {
  // Intentar obtener la IP del host desde la respuesta de salud del backend
  // Esto se actualizará dinámicamente una vez tengamos respuesta del backend
  return localStorage.getItem('backend_host_ip') || '127.0.0.1';
};

// URLs para conexión al backend
export const API_URLS = [
  // IP específica (más resistente a bloqueadores)
  `http://${getLocalIpAddress()}:3001`,
  // IP loopback (alternativa)
  'http://127.0.0.1:3001',
  // Localhost tradicional (puede ser bloqueado)
  'http://localhost:3001',
  // Puertos alternativos
  `http://${getLocalIpAddress()}:3000`,
  'http://127.0.0.1:3000',
  'http://localhost:3000',
];

// Función para actualizar la IP del backend en caso de que se detecte una dirección diferente
export const updateBackendIp = (ip: string): void => {
  if (ip && ip !== 'localhost' && ip !== getLocalIpAddress()) {
    localStorage.setItem('backend_host_ip', ip);
    console.log(`IP del backend actualizada a: ${ip}`);
  }
};

// Función para obtener la URL del backend preferida
export const getPreferredBackendUrl = (): string => {
  return API_URLS[0]; // La primera URL es siempre la preferida
};

// Endpoints comunes
export const API_ENDPOINTS = {
  HEALTH: '/health',
  ROOT: '/',
  API_HEALTH: '/api/health',
  API_STATUS: '/api/status',
  STATUS: '/status',
  CUSTOMERS: '/customers',
  DOCUMENTS: '/documents'
};