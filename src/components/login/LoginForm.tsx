import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/theme/ThemeProvider";

interface LoginFormProps {
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
  isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, onForgotPassword, isLoading }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formFocused, setFormFocused] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const { isDarkMode } = useTheme();

  const inputVariants = {
    focused: { scale: 1.02, boxShadow: "0 0 0 2px rgba(79, 70, 229, 0.2)" },
    unfocused: { scale: 1, boxShadow: "none" }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <CardContent className="space-y-6 pt-4">
        <div className="space-y-3">
          <Label 
            htmlFor="username" 
            className={cn(
              "text-sm font-medium transition-colors duration-200",
              formFocused === "username" 
                ? "text-blue-600" 
                : isDarkMode ? "text-gray-200" : "text-gray-700"
            )}
          >
            Usuario o Correo Electrónico
          </Label>
          <motion.div 
            className="relative"
            variants={inputVariants}
            animate={formFocused === "username" ? "focused" : "unfocused"}
            transition={{ duration: 0.2 }}
          >
            <div className={cn(
              "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors",
              formFocused === "username" ? "text-blue-600" : "text-gray-400"
            )}>
              <User className="h-5 w-5" />
            </div>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario o correo electrónico"
              className={cn(
                "pl-10 py-3 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-blue-500 transition-all",
                formFocused === "username" 
                  ? "border-blue-400 bg-white dark:bg-gray-700" 
                  : isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white" 
                    : "bg-gray-50 border-gray-200 text-gray-800"
              )}
              required
              autoFocus
              onFocus={() => setFormFocused("username")}
              onBlur={() => setFormFocused(null)}
            />
          </motion.div>
        </div>
        
        <div className="space-y-3">
          <Label 
            htmlFor="password" 
            className={cn(
              "text-sm font-medium transition-colors duration-200",
              formFocused === "password" 
                ? "text-blue-600"
                : isDarkMode ? "text-gray-200" : "text-gray-700"
            )}
          >
            Contraseña
          </Label>
          <motion.div 
            className="relative"
            variants={inputVariants}
            animate={formFocused === "password" ? "focused" : "unfocused"}
            transition={{ duration: 0.2 }}
          >
            <div className={cn(
              "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors",
              formFocused === "password" ? "text-blue-600" : "text-gray-400"
            )}>
              <Lock className="h-5 w-5" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              className={cn(
                "pl-10 py-3 pr-10 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-blue-500 transition-all",
                formFocused === "password" 
                  ? "border-blue-400 bg-white dark:bg-gray-700" 
                  : isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white" 
                    : "bg-gray-50 border-gray-200 text-gray-800"
              )}
              required
              onFocus={() => setFormFocused("password")}
              onBlur={() => setFormFocused(null)}
            />
            <button
              type="button"
              className={cn(
                "absolute inset-y-0 right-0 pr-3 flex items-center transition-colors",
                formFocused === "password" ? "text-blue-600" : "text-gray-400"
              )}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </motion.div>
          
          <div className="text-right">
            <Button 
              type="button" 
              variant="link" 
              className={cn(
                "text-sm p-0 h-auto font-normal transition-colors",
                isDarkMode
                  ? "text-blue-400 hover:text-blue-300"
                  : "text-blue-600 hover:text-blue-800"
              )}
              onClick={(e) => {
                e.preventDefault();
                onForgotPassword();
              }}
            >
              ¿Olvidaste tu contraseña?
            </Button>
          </div>
        </div>

        {/* Recordar usuario con Switch en vez de checkbox */}
        <div className="flex items-center justify-between">
          <Label 
            htmlFor="remember" 
            className={cn(
              "text-sm cursor-pointer",
              isDarkMode ? "text-gray-300" : "text-gray-700"
            )}
          >
            Recordar mis datos
          </Label>
          <Switch
            id="remember"
            checked={rememberMe}
            onCheckedChange={setRememberMe}
            className={cn(
              isDarkMode 
                ? "data-[state=checked]:bg-blue-500" 
                : "data-[state=checked]:bg-blue-600"
            )}
          />
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col pb-4">
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full text-white shadow-lg transition-all py-3",
            isDarkMode
              ? "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-900/20"
              : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200",
            isLoading ? "opacity-80" : ""
          )}
        >
          <motion.div 
            className="flex items-center justify-center"
            initial={{ opacity: 1 }}
            animate={{ 
              opacity: isLoading ? [1, 0.8, 1] : 1,
              scale: isLoading ? [1, 0.98, 1] : 1
            }}
            transition={{ 
              duration: 1.5, 
              repeat: isLoading ? Infinity : 0,
              repeatType: "loop" 
            }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando sesión...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-5 w-5" />
                Iniciar Sesión
              </>
            )}
          </motion.div>
        </Button>
      </CardFooter>
    </form>
  );
};

export default LoginForm;
