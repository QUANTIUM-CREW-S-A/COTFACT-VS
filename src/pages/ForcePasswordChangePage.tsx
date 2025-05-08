// src/pages/ForcePasswordChangePage.tsx

import React from "react";
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
import { useAuth } from "@/context/auth";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/context/theme/ThemeProvider";
import { Shield } from "lucide-react";

const ForcePasswordChangePage: React.FC = () => {
  const navigate = useNavigate();
  const { authState, setAuthState } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const { isDarkMode } = useTheme();
  
  // Redirigir si el usuario no necesita cambiar su contraseña
  React.useEffect(() => {
    if (!authState.isAuthenticated || !authState.passwordChangeRequired) {
      navigate("/login");
    }
  }, [authState.isAuthenticated, authState.passwordChangeRequired, navigate]);

  const handlePasswordUpdate = async (password: string) => {
    try {
      setIsLoading(true);
      
      // Actualizar la contraseña en Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      // Marcar en el perfil que la contraseña ya ha sido cambiada
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          password_changed: true,
          ultima_modificacion: new Date().toISOString(),
          modificado_por: authState.currentUser?.id
        })
        .eq('id', authState.currentUser?.id);
      
      if (profileError) {
        console.error("Error al actualizar perfil:", profileError);
        throw profileError;
      }
        
      // Actualizar estado de autenticación
      setAuthState(prev => ({
        ...prev,
        passwordChangeRequired: false,
        currentUser: {
          ...prev.currentUser!,
          mustChangePassword: false,
          password_changed: true
        }
      }));
      
      toast.success("Contraseña actualizada exitosamente");
      
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al actualizar la contraseña";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    navigate("/dashboard");
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center ${
      isDarkMode 
        ? "bg-gradient-to-br from-gray-900 to-gray-950" 
        : "bg-gradient-to-br from-blue-50 to-indigo-100"
    } p-4 transition-colors duration-300`}>
      <Card className={`w-full max-w-md shadow-2xl border-0 rounded-2xl overflow-hidden ${
        isDarkMode 
          ? "bg-gray-800/90 backdrop-blur-sm border-gray-700" 
          : "bg-white/90 backdrop-blur-sm"
      } transition-colors duration-300`}>
        <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <CardHeader className="space-y-3 text-center pt-6">
          <div className="flex justify-center mb-3">
            <Logo />
          </div>
          <div className="flex justify-center mb-1">
            <Shield className={`h-10 w-10 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
          </div>
          <CardTitle className={`text-2xl font-bold ${
            isDarkMode ? "text-white" : "text-gray-800"
          } tracking-tight transition-colors duration-300`}>
            Cambio de contraseña requerido
          </CardTitle>
          <CardDescription className={`${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          } px-4 sm:px-6 text-base transition-colors duration-300`}>
            Por seguridad, necesitas cambiar la contraseña predeterminada antes de continuar
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

export default ForcePasswordChangePage;