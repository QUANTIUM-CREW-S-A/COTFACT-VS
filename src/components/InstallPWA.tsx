import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

/*
 * Componente InstallPWA.
 * - Muestra un banner para instalar la aplicación como PWA en dispositivos móviles.
 * - Detecta el evento beforeinstallprompt y gestiona la lógica de instalación.
 * - Permite al usuario instalar la app o descartar el banner.
 */
const InstallPWA = () => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Detectar si la app ya está instalada
    const isInStandaloneMode = () => 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone || 
      document.referrer.includes('android-app://');
      
    if (isInStandaloneMode()) {
      return;
    }
    
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevenir el comportamiento por defecto
      e.preventDefault();
      // Guardar el evento
      setInstallPromptEvent(e);
      // Mostrar el banner de instalación
      setShowInstallPrompt(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  const handleInstallClick = async () => {
    if (!installPromptEvent) return;
    
    // Mostrar el prompt de instalación
    installPromptEvent.prompt();
    
    // Esperar a que el usuario responda
    const choiceResult = await installPromptEvent.userChoice;
    
    // Ocultar el banner después de la selección del usuario
    setShowInstallPrompt(false);
    setInstallPromptEvent(null);
    
    // Analítica (opcional)
    if (choiceResult.outcome === 'accepted') {
      console.log('El usuario aceptó instalar la PWA');
    } else {
      console.log('El usuario rechazó instalar la PWA');
    }
  };
  
  const dismissInstallBanner = () => {
    setShowInstallPrompt(false);
  };
  
  // Solo mostrar en móviles y cuando el evento beforeinstallprompt se haya disparado
  if (!isMobile || !showInstallPrompt) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white shadow-lg border-t">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-sm">Instala COTFACT-VS</h3>
          <p className="text-xs text-gray-600">Acceso más rápido y uso sin conexión</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="default"
            size="sm"
            onClick={handleInstallClick}
            className="text-xs"
          >
            Instalar
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={dismissInstallBanner}
          >
            <X size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;
