
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, ShieldCheck, RefreshCw } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp";
import { toast } from "sonner";

interface VerificationStepProps {
  verificationCode: string;
  onCodeChange: (value: string) => void;
  onVerify: () => void;
  onCancel: () => void;
  error: string | null;
}

const VerificationStep: React.FC<VerificationStepProps> = ({
  verificationCode,
  onCodeChange,
  onVerify,
  onCancel,
  error
}) => {
  // Reference to the container for scrolling into view on mobile
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll verification into view on mobile when component mounts
  useEffect(() => {
    if (containerRef.current) {
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, []);

  // Function to handle OTP input changes
  const handleOTPChange = (value: string) => {
    onCodeChange(value);
  };

  // Function to clear the input
  const handleClearCode = () => {
    onCodeChange("");
    toast.info("Código borrado");
  };

  // Function to handle key press events for quick verification
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && verificationCode.length === 6) {
      onVerify();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="rounded-md border p-4 sm:p-6 space-y-4 sm:space-y-6 bg-white shadow-sm"
    >
      <div className="text-center mb-2 sm:mb-4">
        <div className="inline-flex p-3 rounded-full bg-blue-100 mb-3">
          <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
        </div>
        <h3 className="font-semibold text-gray-900 text-lg sm:text-xl">Verificar configuración</h3>
      </div>
      
      <p className="text-sm sm:text-base text-gray-600 text-center">
        Ingresa el código de 6 dígitos que ves en tu aplicación de autenticación para activar 2FA
      </p>
      
      <div className="py-2 sm:py-4">
        <div className="flex justify-center" onKeyDown={handleKeyPress}>
          <InputOTP
            maxLength={6}
            value={verificationCode}
            onChange={handleOTPChange}
            containerClassName="gap-1 sm:gap-3"
            render={({ slots }) => (
              <InputOTPGroup>
                {slots.map((slot, i) => (
                  <InputOTPSlot key={i} {...slot} index={i} />
                ))}
              </InputOTPGroup>
            )}
          />
        </div>
        <div className="flex justify-between items-center mt-3 sm:mt-5">
          <p className="text-xs sm:text-sm text-gray-500">Código de verificación</p>
          {verificationCode.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearCode}
              className="flex items-center gap-1 text-gray-500 h-7"
            >
              <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="text-xs">Borrar</span>
            </Button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-3 sm:p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-xs sm:text-sm font-medium text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row-reverse gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
        <Button 
          onClick={onVerify}
          disabled={verificationCode.length !== 6}
          className="gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          size="lg"
        >
          <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
          Verificar y Activar
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancel} 
          size="lg"
          className="w-full sm:w-auto"
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default VerificationStep;
