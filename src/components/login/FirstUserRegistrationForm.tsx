import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Mail, UserPlus, UserCircle, AlertCircle } from "lucide-react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { useWindowSize } from "@/hooks/use-window-size";
import LoadingButton from "./LoadingButton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FirstUserRegistrationFormProps {
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const FirstUserRegistrationForm: React.FC<FirstUserRegistrationFormProps> = ({ 
  onSubmit, 
  isLoading 
}) => {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nombre, setNombre] = useState("Admin");
  const [apellido, setApellido] = useState("User");
  const [error, setError] = useState<string | null>(null);
  const { width } = useWindowSize();
  const isDesktop = width >= 768;

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones locales
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    
    setError(null);
    onSubmit(e);
  };

  return (
    <form onSubmit={handleLocalSubmit}>
      <CardContent className="space-y-4 pt-4 px-4 sm:px-8">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-gray-700">Nombre</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserCircle className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="nombre"
                name="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors text-gray-800"
                required
                autoFocus
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="apellido" className="text-gray-700">Apellido</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserCircle className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="apellido"
                name="apellido"
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Tu apellido"
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors text-gray-800"
                required
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700">Correo electrónico</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@ejemplo.com"
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors text-gray-800"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Recomendamos usar admin@example.com para el primer usuario</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700">Contraseña</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Crea tu contraseña"
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors text-gray-800"
              required
              minLength={6}
              autoComplete="new-password"
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-gray-700">Confirmar contraseña</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors text-gray-800"
              required
              autoComplete="new-password"
            />
          </div>
          {password && confirmPassword && password !== confirmPassword && (
            <p className="text-sm text-red-500 mt-1">Las contraseñas no coinciden</p>
          )}
        </div>
        
        <Alert className="bg-blue-50 border-blue-200 text-blue-800">
          <p className="text-xs">Este será el usuario con rol de administrador del sistema. Guarda bien estas credenciales.</p>
        </Alert>
      </CardContent>
      
      <CardFooter className={`pb-8 flex flex-col ${isDesktop ? 'px-8' : 'px-6'}`}>
        <LoadingButton
          type="submit"
          isLoading={isLoading}
          icon={UserPlus}
          loadingText="Creando usuario administrador..."
          className={`w-full bg-viangblue hover:bg-viangblue-dark transition-colors ${isDesktop ? 'py-6 text-base' : 'py-5'}`}
          disabled={password !== confirmPassword || password.length < 6}
        >
          Crear Usuario Administrador
        </LoadingButton>
      </CardFooter>
    </form>
  );
};

export default FirstUserRegistrationForm;