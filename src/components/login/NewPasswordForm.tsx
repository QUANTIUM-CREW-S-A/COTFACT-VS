import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Check } from "lucide-react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useWindowSize } from "@/hooks/use-window-size";
import LoadingButton from "./LoadingButton";
import { validatePassword, getPasswordFeedback } from "@/utils/passwordValidation";

interface NewPasswordFormProps {
  onSubmit: (password: string) => Promise<void>;
  onComplete: () => void;
  isLoading: boolean;
}

const NewPasswordForm: React.FC<NewPasswordFormProps> = ({ 
  onSubmit, 
  onComplete, 
  isLoading 
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    strength: 'weak' | 'medium' | 'strong' | 'very-strong';
    feedback: string;
    score: number;
  }>({ strength: 'weak', feedback: '', score: 0 });
  const { width } = useWindowSize();
  const isDesktop = width >= 768;

  // Validar la contraseña mientras se escribe
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    if (newPassword.length > 0) {
      const validation = validatePassword(newPassword);
      setPasswordStrength({
        strength: validation.strength,
        feedback: getPasswordFeedback(validation),
        score: validation.score
      });
    } else {
      setPasswordStrength({ strength: 'weak', feedback: '', score: 0 });
    }
  };

  // Obtener el color de la barra de fortaleza
  const getStrengthColor = () => {
    switch (passwordStrength.strength) {
      case 'very-strong': return 'bg-green-500';
      case 'strong': return 'bg-blue-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  // Obtener el texto de fortaleza
  const getStrengthText = () => {
    switch (passwordStrength.strength) {
      case 'very-strong': return 'Muy segura';
      case 'strong': return 'Segura';
      case 'medium': return 'Media';
      default: return 'Débil';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación completa
    const validation = validatePassword(password);
    
    if (!validation.valid) {
      setError(validation.errors[0] || "La contraseña no cumple con los requisitos de seguridad");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      await onSubmit(password);
      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 3000); // Redirigir después de 3 segundos
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ha ocurrido un error al cambiar la contraseña");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4 pt-4 px-4 sm:px-8">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md">
            <p className="text-sm">
              ¡Tu contraseña ha sido restablecida correctamente!
              <br />
              Serás redirigido a la página de inicio de sesión en breve...
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Nueva contraseña</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Ingresa tu nueva contraseña"
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors text-gray-800"
                  required
                  autoFocus
                />
              </div>
              
              {/* Indicador de fortaleza de contraseña */}
              {password && (
                <div className="space-y-1 mt-2">
                  <div className="w-full h-1.5 bg-gray-200 rounded-full">
                    <div 
                      className={`h-1.5 rounded-full ${getStrengthColor()}`} 
                      style={{ width: `${passwordStrength.score}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Fortaleza: <span className="font-medium">{getStrengthText()}</span></span>
                    <span className="text-gray-500">{passwordStrength.feedback}</span>
                  </div>
                  <ul className="text-xs text-gray-600 pl-5 mt-2 space-y-1 list-disc">
                    <li>Al menos 8 caracteres</li>
                    <li>Al menos una letra mayúscula</li>
                    <li>Al menos una letra minúscula</li>
                    <li>Al menos un número</li>
                    <li>Al menos un símbolo (!@#$%^&*)</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">Confirmar contraseña</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu nueva contraseña"
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors text-gray-800"
                  required
                />
              </div>
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-red-500 mt-1">Las contraseñas no coinciden</p>
              )}
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className={`pb-8 flex justify-center ${isDesktop ? 'px-8' : 'px-6'}`}>
        {success ? (
          <Button
            type="button"
            variant="default"
            onClick={onComplete}
            className="bg-viangblue hover:bg-viangblue-dark transition-colors"
          >
            Ir al inicio de sesión
          </Button>
        ) : (
          <LoadingButton
            type="submit"
            isLoading={isLoading}
            icon={Check}
            loadingText="Actualizando..."
            className="w-full bg-viangblue hover:bg-viangblue-dark transition-colors"
            disabled={
              !password || 
              !confirmPassword || 
              password !== confirmPassword || 
              passwordStrength.strength === 'weak'
            }
          >
            Restablecer contraseña
          </LoadingButton>
        )}
      </CardFooter>
    </form>
  );
};

export default NewPasswordForm;