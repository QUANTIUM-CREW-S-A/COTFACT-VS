
import React, { useState, useEffect } from "react";
import { useWindowSize } from "@/hooks/use-window-size";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import LoginFooter from "./LoginFooter";
import LoadingButton from "./LoadingButton";

interface TwoFactorFormProps {
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const TwoFactorForm: React.FC<TwoFactorFormProps> = ({ onSubmit, isLoading }) => {
  const [otpCode, setOtpCode] = useState("");
  const { width } = useWindowSize();
  const isDesktop = width >= 768;
  
  // Auto-focus the first input when the form is mounted
  useEffect(() => {
    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      const firstInput = document.querySelector('input[inputmode="numeric"]') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle key press for quick submission
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && otpCode.length === 6) {
      const form = e.currentTarget.closest('form');
      if (form) form.requestSubmit();
    }
  };
  
  // Clear OTP code
  const handleClearOTP = () => {
    setOtpCode("");
    // Focus first input after clearing
    const firstInput = document.querySelector('input[inputmode="numeric"]') as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full">
      <CardContent className="space-y-6 pt-4 px-4 sm:px-8">
        <div className="space-y-4">
          <div className="text-center">
            <div className="mb-4 inline-flex p-3 rounded-full bg-blue-50">
              <ShieldCheck className="h-6 w-6 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Verificación adicional</h2>
            <p className="text-sm text-gray-600 mb-4">
              Introduce el código de 6 dígitos de tu aplicación de autenticación para continuar.
            </p>
          </div>
          <div className="flex flex-col items-center py-2">
            <div onKeyDown={handleKeyPress}>
              <InputOTP 
                maxLength={6}
                value={otpCode}
                onChange={(value) => setOtpCode(value)}
                render={({ slots }) => (
                  <InputOTPGroup>
                    {slots.map((slot, i) => (
                      <InputOTPSlot key={i} {...slot} index={i} />
                    ))}
                  </InputOTPGroup>
                )}
              />
            </div>
            
            {otpCode.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearOTP}
                className="mt-3 flex items-center gap-1 text-sm text-gray-500"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Borrar código</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className={`pb-8 flex flex-col ${isDesktop ? 'px-8' : 'px-6'}`}>
        <LoadingButton
          type="submit"
          isLoading={isLoading}
          icon={ShieldCheck}
          loadingText="Verificando..."
          disabled={otpCode.length !== 6}
          className={`w-full bg-viangblue hover:bg-viangblue-dark transition-colors ${isDesktop ? 'py-6 text-base' : 'py-5'}`}
        >
          Verificar
        </LoadingButton>
        
        <LoginFooter />
      </CardFooter>
    </form>
  );
};

export default TwoFactorForm;
