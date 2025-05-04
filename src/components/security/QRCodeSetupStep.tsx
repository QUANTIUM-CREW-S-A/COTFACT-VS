
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import QRCode from "react-qr-code";
import { AlertTriangle, ClipboardCopy, Check } from "lucide-react";
import { toast } from "sonner";

interface QRCodeSetupStepProps {
  twoFactorSecret: string;
  twoFactorURL: string;
  onCancel: () => void;
  onContinue: () => void;
}

const QRCodeSetupStep: React.FC<QRCodeSetupStepProps> = ({
  twoFactorSecret,
  twoFactorURL,
  onCancel,
  onContinue,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopySecret = () => {
    navigator.clipboard.writeText(twoFactorSecret);
    setCopied(true);
    toast.success("Clave secreta copiada al portapapeles");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="rounded-md border p-4 space-y-4 bg-white shadow-sm">
      <div className="flex items-start gap-2 bg-amber-50 p-3 rounded-md">
        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-medium mb-1">Importante</p>
          <p>Guarda una copia de esta clave secreta en un lugar seguro. La necesitarás si pierdes acceso a tu dispositivo de autenticación.</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium text-gray-900 text-lg">Configuración de autenticación de dos factores</h3>
        <ol className="space-y-2 ml-5 list-decimal text-sm text-gray-600">
          <li>Descarga una aplicación de autenticación como Google Authenticator o Authy.</li>
          <li>Escanea el código QR con la aplicación.</li>
          <li>Al finalizar, introduce el código de verificación que se muestra en tu aplicación.</li>
        </ol>
      </div>
      
      <div className="flex justify-center py-4">
        <div className="p-4 bg-white border rounded-md shadow-sm">
          <QRCode value={twoFactorURL} size={180} />
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">¿No puedes escanear el código QR?</p>
        <p className="text-xs text-gray-500">
          Ingresa esta clave secreta manualmente en tu aplicación:
        </p>
        <div className="flex space-x-2">
          <Input 
            value={twoFactorSecret} 
            readOnly 
            className="font-mono text-sm"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopySecret}
            className="flex items-center gap-1 min-w-[90px]"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <ClipboardCopy className="h-4 w-4" />
                <span>Copiar</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-2 border-t mt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onContinue}>
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default QRCodeSetupStep;
