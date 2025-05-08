// src/pages/LoginPage.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth";
import { 
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Logo from "@/components/Logo";
import LoginForm from "@/components/login/LoginForm";
import PasswordResetForm from "@/components/login/PasswordResetForm";
import ErrorMessage from "@/components/login/ErrorMessage";
import { toast } from "sonner";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { usePasswordReset } from "@/context/auth/hooks/usePasswordReset";
import { motion } from "framer-motion";
import { useTheme } from "@/context/theme/ThemeProvider";
import { cn } from "@/lib/utils";

// Obtener la URL de Supabase del entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const navigate = useNavigate();
  const { login, authState } = useAuth();
  const { requestPasswordReset, isLoading: isResettingPassword } = usePasswordReset();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (authState.isAuthenticated) {
      if (authState.passwordChangeRequired) {
        // Si se requiere cambio de contraseña, redirigir a la página correspondiente
        navigate("/password-change");
      } else {
        // Si la autenticación es exitosa y no requiere cambio de contraseña, ir al dashboard
        navigate("/dashboard");
      }
    }
  }, [authState.isAuthenticated, authState.passwordChangeRequired, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Login normal
      const form = e.target as HTMLFormElement;
      const usernameInput = form.querySelector("#username") as HTMLInputElement;
      const passwordInput = form.querySelector("#password") as HTMLInputElement;
      const username = usernameInput.value;
      const password = passwordInput.value;
      
      console.log("Iniciando sesión...", username);
      const success = await login(username, password);
      
      if (success) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error durante la autenticación:", error);
      toast.error("Error durante la autenticación. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordResetSubmit = async (email: string) => {
    try {
      const success = await requestPasswordReset(email);
      return success;
    } catch (error) {
      console.error("Error al solicitar restablecimiento:", error);
      return false;
    }
  };

  const getPageTitle = () => {
    if (showPasswordReset) return 'Recuperar Contraseña';
    return 'Bienvenido de vuelta';
  };

  const getPageDescription = () => {
    if (showPasswordReset) return 'Ingresa tu correo electrónico para recibir un enlace de recuperación';
    return 'Accede a tu cuenta para gestionar tus documentos y clientes';
  };

  const fadeIn = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={cn(
      "min-h-screen w-full flex flex-col md:flex-row overflow-hidden",
      isDarkMode ? "bg-gray-900" : ""
    )}>
      {/* Panel izquierdo decorativo (solo visible en desktop) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 z-0"></div>
        <div className="absolute inset-0 z-0">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="a" x1="50%" x2="50%" y1="0%" y2="100%">
                <stop stopColor="#FFF" stopOpacity=".25" offset="0%"/>
                <stop stopColor="#FFF" stopOpacity=".1" offset="100%"/>
              </linearGradient>
            </defs>
            <path fill="url(#a)" d="M800 0H0v800h800z" fillOpacity=".05"/>
            <path d="M400 400c55.228 0 100-44.772 100-100s-44.772-100-100-100-100 44.772-100 100 44.772 100 100 100zm0 60c-136.975 0-248 111.025-248 248 0 0 50.054-60 248-60 187.456 0 248 60 248 60 0-136.975-111.025-248-248-248z" fill="white" fillOpacity=".05"/>
            <circle cx="200" cy="600" r="180" fill="white" fillOpacity=".05"/>
            <circle cx="600" cy="200" r="240" fill="white" fillOpacity=".05"/>
            <circle cx="100" cy="100" r="70" fill="white" fillOpacity=".05"/>
            <circle cx="700" cy="700" r="140" fill="white" fillOpacity=".05"/>
          </svg>
        </div>
        <motion.div 
          className="relative z-10 flex flex-col h-full justify-center items-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.8 }}
        >
          <Logo size="enormous" />
        </motion.div>
      </div>
      
      {/* Panel derecho - Formulario de login */}
      <div className={cn(
        "w-full md:w-1/2 flex items-center justify-center px-4 py-6 transition-colors duration-300",
        isDarkMode 
          ? "bg-gray-900" 
          : "bg-gray-50"
      )}>
        <motion.div 
          className="w-full max-w-md"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className={cn(
            "shadow-xl border-0 rounded-2xl overflow-hidden transition-colors duration-300",
            isDarkMode 
              ? "bg-gray-800 shadow-gray-900/40" 
              : "bg-white"
          )}>
            <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
            <CardHeader className="space-y-3 pt-6 pb-4">
              <CardTitle className={cn(
                "text-2xl font-bold tracking-tight text-center transition-colors duration-300",
                isDarkMode 
                  ? "text-white" 
                  : "text-gray-800"
              )}>
                {getPageTitle()}
              </CardTitle>
              <CardDescription className={cn(
                "text-center transition-colors duration-300",
                isDarkMode 
                  ? "text-gray-300" 
                  : "text-gray-600"
              )}>
                {getPageDescription()}
              </CardDescription>
            </CardHeader>
            
            {authState.error && (
              <div className="px-6 -mt-2 mb-2">
                <ErrorMessage message={authState.error} />
              </div>
            )}
            
            <div className="px-6">
              {showPasswordReset ? (
                <PasswordResetForm
                  onSubmit={handlePasswordResetSubmit}
                  onBack={() => setShowPasswordReset(false)}
                  isLoading={isResettingPassword}
                />
              ) : (
                <LoginForm 
                  onSubmit={handleLoginSubmit} 
                  onForgotPassword={() => setShowPasswordReset(true)}
                  isLoading={isLoading} 
                />
              )}
            </div>
          </Card>
          
          <p className={cn(
            "text-center text-sm mt-8 transition-colors duration-300",
            isDarkMode 
              ? "text-gray-400" 
              : "text-gray-600"
          )}>
            © {new Date().getFullYear()} Quantium Crew S.A. Todos los derechos reservados.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;