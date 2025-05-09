import React, { useState, useEffect } from 'react';
import { AlertCircle, WifiIcon, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { resetBlockerDetection, getBlockerDetectionState } from '@/services/api/connectivity';
import { getLocalIpAddress, getPreferredBackendUrl } from '@/services/api/config';

interface BlockerDetectedAlertProps {
  onRetryConnection?: () => void;
}

/**
 * Componente que muestra una alerta cuando se detectan bloqueadores de contenido
 * como AdBlock, uBlock, etc. que están interfiriendo con la aplicación.
 * También proporciona información sobre la IP y puerto para conexión directa.
 */
const BlockerDetectedAlert: React.FC<BlockerDetectedAlertProps> = ({ onRetryConnection }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [blockerState, setBlockerState] = useState<any>(null);
  const [backendIp, setBackendIp] = useState<string>(getLocalIpAddress());
  const [backendUrl, setBackendUrl] = useState<string>(getPreferredBackendUrl());

  useEffect(() => {
    // Obtener información de bloqueadores
    const state = getBlockerDetectionState();
    setBlockerState(state);
    
    // Actualizar la información del backend cada vez que se muestra
    setBackendIp(getLocalIpAddress());
    setBackendUrl(getPreferredBackendUrl());
  }, []);

  const handleRetry = () => {
    // Reiniciar el estado de detección de bloqueadores
    resetBlockerDetection();
    
    // Llamar a la función de reconexión si existe
    if (onRetryConnection && typeof onRetryConnection === 'function') {
      onRetryConnection();
    }
    
    // Cerrar la alerta
    setIsOpen(false);
  };

  // No mostrar si no está abierto o no hay bloqueador detectado
  if (!isOpen || !blockerState?.detected) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Bloqueador de contenido detectado</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          Tu navegador o una extensión como AdBlock está bloqueando peticiones a los siguientes dominios:
          {blockerState?.blockedUrls?.length > 0 ? (
            <ul className="list-disc pl-5 mt-1">
              {blockerState.blockedUrls.map((url: string) => (
                <li key={url} className="text-sm">{url}</li>
              ))}
            </ul>
          ) : (
            <span> localhost</span>
          )}
        </p>
        
        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md mt-3">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <WifiIcon className="h-4 w-4" />
            <span className="font-medium">Conexión alternativa disponible</span>
          </div>
          <p className="mt-1 text-sm">
            Puedes usar la siguiente dirección IP en lugar de localhost para evitar el bloqueo:
          </p>
          <code className="block bg-slate-200 dark:bg-slate-700 p-2 rounded mt-1 font-mono text-sm">{backendUrl}</code>
        </div>
        
        <p className="mt-2">
          Para que la aplicación funcione correctamente, por favor:
        </p>
        <ol className="list-decimal pl-5">
          <li>Usa la IP mostrada arriba en lugar de localhost</li>
          <li>O desactiva temporalmente las extensiones de bloqueo para esta página</li>
          <li>O agrega localhost a las excepciones de tu bloqueador</li>
        </ol>
        <div className="flex gap-2 mt-3">
          <Button variant="outline" onClick={handleRetry}>
            Intentar de nuevo
          </Button>
          <Button 
            variant="default" 
            onClick={() => setIsOpen(false)}
          >
            Entendido
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default BlockerDetectedAlert;