import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Send, AlertCircle, CheckCircle } from "lucide-react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/theme/ThemeProvider";

interface PasswordResetFormProps {
  onSubmit: (email: string) => Promise<boolean>;
  onBack: () => void;
  isLoading: boolean;
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ 
  onSubmit, 
  onBack, 
  isLoading 
}) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [formFocused, setFormFocused] = useState<boolean>(false);
  const { isDarkMode } = useTheme();

  const inputVariants = {
    focused: { scale: 1.02, boxShadow: "0 0 0 2px rgba(79, 70, 229, 0.2)" },
    unfocused: { scale: 1, boxShadow: "none" }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Por favor, ingresa tu correo electrónico");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido");
      return;
    }

    try {
      const result = await onSubmit(email);
      if (result) {
        setSuccess(true);
      } else {
        setError("No pudimos procesar tu solicitud. Por favor, intenta de nuevo.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ha ocurrido un error al enviar el correo");
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CardContent className="space-y-4 pt-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="destructive" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {success ? (
          <motion.div
            className={cn(
              "border p-6 rounded-lg",
              isDarkMode 
                ? "bg-green-900/30 border-green-800 text-green-300" 
                : "bg-green-50 border-green-200 text-green-700"
            )}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className={cn(
                "p-3 rounded-full",
                isDarkMode ? "bg-green-800/50" : "bg-green-100"
              )}>
                <CheckCircle className={cn(
                  "h-8 w-8",
                  isDarkMode ? "text-green-400" : "text-green-600"
                )} />
              </div>
              <h3 className={cn(
                "font-medium text-lg",
                isDarkMode ? "text-green-300" : "text-green-800"
              )}>
                Correo enviado
              </h3>
              <p className={cn(
                "text-sm",
                isDarkMode ? "text-green-300/90" : "text-green-700"
              )}>
                Hemos enviado un enlace de recuperación a tu dirección de correo electrónico.
                Por favor, revisa tu bandeja de entrada (y carpeta de spam) y sigue las instrucciones.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label 
                htmlFor="email" 
                className={cn(
                  "text-sm font-medium transition-colors duration-200",
                  formFocused 
                    ? "text-blue-600" 
                    : isDarkMode ? "text-gray-200" : "text-gray-700"
                )}
              >
                Correo electrónico
              </Label>
              <motion.div 
                className="relative"
                variants={inputVariants}
                animate={formFocused ? "focused" : "unfocused"}
                transition={{ duration: 0.2 }}
              >
                <div className={cn(
                  "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors",
                  formFocused ? "text-blue-600" : "text-gray-400"
                )}>
                  <Mail className="h-5 w-5" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@ejemplo.com"
                  className={cn(
                    "pl-10 py-6 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-blue-500 transition-all",
                    formFocused 
                      ? "border-blue-400 bg-white dark:bg-gray-700"
                      : isDarkMode
                        ? "bg-gray-800 border-gray-700 text-white" 
                        : "bg-gray-50 border-gray-200 text-gray-800"
                  )}
                  autoFocus
                  onFocus={() => setFormFocused(true)}
                  onBlur={() => setFormFocused(false)}
                />
              </motion.div>
            </div>
            
            <div className={cn(
              "text-sm p-4 rounded-lg border",
              isDarkMode
                ? "bg-blue-900/20 border-blue-800/50 text-gray-300"
                : "bg-blue-50 border-blue-100 text-gray-600"
            )}>
              <p className="flex items-start gap-2">
                <span className={isDarkMode ? "text-blue-400 mt-0.5" : "text-blue-500 mt-0.5"}>
                  <Mail className="h-4 w-4" />
                </span>
                <span>Te enviaremos un enlace para restablecer tu contraseña. Si no encuentras el correo, revisa tu carpeta de spam.</span>
              </p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pb-8 flex justify-between pt-4">
        {success ? (
          <Button
            type="button"
            variant="default"
            onClick={onBack}
            className={cn(
              "mx-auto",
              isDarkMode
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            )}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio de sesión
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className={isDarkMode ? "text-gray-300" : "text-gray-600"}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              {isLoading ? (
                <motion.div 
                  className="flex items-center"
                  initial={{ opacity: 1 }}
                  animate={{ 
                    opacity: [1, 0.7, 1],
                    scale: [1, 0.98, 1]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    repeatType: "loop" 
                  }}
                >
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </motion.div>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar correo
                </>
              )}
            </Button>
          </>
        )}
      </CardFooter>
    </motion.form>
  );
};

export default PasswordResetForm;