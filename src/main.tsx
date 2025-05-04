/*
 * Punto de entrada principal de la aplicación React.
 * - Inicializa el cliente de React Query para manejo de datos asíncronos.
 * - Registra el Service Worker para soporte PWA.
 * - Provee el contexto de autenticación global.
 * - Renderiza el componente principal <App />.
 */
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/auth';

const queryClient = new QueryClient();

// Registrar el service worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registrado correctamente:', registration.scope);
    }).catch(error => {
      console.log('Error al registrar el ServiceWorker:', error);
    });
  });
}

// Código para detectar "Add to Home Screen" y mostrar mensaje personalizado
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevenir el comportamiento por defecto
  e.preventDefault();
  // Guardar el evento para usarlo después
  deferredPrompt = e;
  
  // Opcional: Mostrar un mensaje personalizado invitando al usuario a instalar la app
  // Esto se podría implementar más adelante con un componente React
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </QueryClientProvider>
);
