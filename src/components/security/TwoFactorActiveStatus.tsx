
import React from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, AlertTriangle } from "lucide-react";

interface TwoFactorActiveStatusProps {
  onDisable: () => void;
}

const TwoFactorActiveStatus: React.FC<TwoFactorActiveStatusProps> = ({ onDisable }) => {
  return (
    <div className="rounded-md bg-green-50 p-4 shadow-sm">
      <div className="flex">
        <div className="flex-shrink-0">
          <ShieldCheck className="h-5 w-5 text-green-500" />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-green-800">Autenticación de dos factores activa</h3>
            <div className="ml-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Activo
              </span>
            </div>
          </div>
          <div className="mt-2 text-sm text-green-700">
            <p className="mb-2">
              Tu cuenta está protegida con autenticación de dos factores. Cada vez que inicies sesión, 
              necesitarás ingresar un código de verificación de tu aplicación autenticadora.
            </p>
            <div className="mt-2 p-2 bg-white rounded-md border border-green-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">
                  Si pierdes acceso a tu dispositivo de autenticación, no podrás iniciar sesión en tu cuenta 
                  a menos que tengas guardada tu clave de respaldo.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onDisable}
              className="text-red-700 border-red-200 hover:bg-red-50 hover:text-red-800"
            >
              Desactivar 2FA
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorActiveStatus;
