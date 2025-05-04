// src/pages/ResetPasswordPage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Logo from "@/components/Logo";
import NewPasswordForm from "@/components/login/NewPasswordForm";
import { toast } from "sonner";
import { usePasswordReset } from "@/context/auth/hooks/usePasswordReset";

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const { updatePassword, isLoading } = usePasswordReset();
  
  // Verificar que la URL contiene un token válido de restablecimiento
  useEffect(() => {
    const hash = window.location.hash;
    const type = new URLSearchParams(hash.substring(1)).get('type');
    
    if (type !== 'recovery') {
      setIsValid(false);
      toast.error("Enlace de recuperación inválido o expirado");
    } else {
      setIsValid(true);
    }
  }, []);

  const handlePasswordUpdate = async (password: string) => {
    try {
      const success = await updatePassword(password);
      if (!success) {
        throw new Error("No se pudo actualizar la contraseña");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al actualizar la contraseña";
      toast.error(message);
      throw error;
    }
  };

  const handleComplete = () => {
    navigate("/login");
  };

  if (isValid === null) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 rounded-2xl overflow-hidden bg-white/90 backdrop-blur-sm">
          <div className="h-1.5 bg-gradient-to-r from-purple-500 to-purple-700"></div>
          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
            <p className="text-gray-500">Verificando enlace de recuperación...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (isValid === false) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 rounded-2xl overflow-hidden bg-white/90 backdrop-blur-sm">
          <div className="h-1.5 bg-gradient-to-r from-purple-500 to-purple-700"></div>
          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800 mb-4">
              Enlace inválido o expirado
            </CardTitle>
            <p className="text-gray-600 mb-6">
              El enlace de recuperación que estás utilizando no es válido o ha expirado.
            </p>
            <button 
              onClick={() => navigate("/login")}
              className="bg-viangblue hover:bg-viangblue-dark text-white py-2 px-4 rounded"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 rounded-2xl overflow-hidden bg-white/90 backdrop-blur-sm">
        <div className="h-1.5 bg-gradient-to-r from-purple-500 to-purple-700"></div>
        <CardHeader className="space-y-4 text-center pt-8">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800 tracking-tight">
            Restablecer contraseña
          </CardTitle>
          <CardDescription className="text-gray-600 px-4 sm:px-8 text-base">
            Crea una nueva contraseña segura para tu cuenta
          </CardDescription>
        </CardHeader>
        
        <NewPasswordForm 
          onSubmit={handlePasswordUpdate}
          onComplete={handleComplete}
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
};

export default ResetPasswordPage;