import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth";
import { useEmailVerification } from "@/context/auth/hooks/useEmailVerification";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { 
  AlertCircle, 
  CheckCircle2, 
  Mail, 
  RefreshCw 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const EmailVerificationSection: React.FC = () => {
  const { authState } = useAuth();
  const { 
    sendVerificationEmail, 
    checkEmailVerificationStatus, 
    isLoading, 
    verificationSent 
  } = useEmailVerification({ authState }); // Pasamos el authState como parámetro
  
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Verificar estado de verificación al cargar el componente
  useEffect(() => {
    const checkVerification = async () => {
      setCheckingStatus(true);
      try {
        const { verified, email } = await checkEmailVerificationStatus();
        setIsVerified(verified);
        if (email) {
          setUserEmail(email);
        }
      } catch (error) {
        console.error("Error checking verification status:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    if (authState.currentUser?.email) {
      setUserEmail(authState.currentUser.email);
      checkVerification();
    }
  }, [authState.currentUser?.email, checkEmailVerificationStatus]);

  const handleSendVerification = async () => {
    if (!userEmail) {
      toast.error("No hay una dirección de correo electrónico disponible");
      return;
    }
    
    await sendVerificationEmail(userEmail);
  };

  const handleRefreshStatus = async () => {
    setCheckingStatus(true);
    const { verified } = await checkEmailVerificationStatus();
    setIsVerified(verified);
    setCheckingStatus(false);

    if (verified) {
      toast.success("¡Tu correo electrónico está verificado!");
    }
  };

  if (!authState.currentUser) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-500" />
          Verificación de Correo Electrónico
        </CardTitle>
        <CardDescription>
          Verifica tu dirección de correo electrónico para aumentar la seguridad de tu cuenta
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {checkingStatus ? (
          <div className="flex items-center justify-center py-6">
            <RefreshCw className="h-6 w-6 text-muted-foreground animate-spin" />
          </div>
        ) : isVerified ? (
          <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>Correo electrónico verificado</AlertTitle>
            <AlertDescription>
              Tu dirección de correo {userEmail} ha sido verificada exitosamente.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Correo no verificado</AlertTitle>
              <AlertDescription>
                Tu dirección de correo {userEmail} aún no ha sido verificada. Esto puede limitar algunas funcionalidades y reduce la seguridad de tu cuenta.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Por favor, verifica tu dirección de correo electrónico haciendo clic en el enlace que te enviamos. 
                Si no encuentras el correo, puedes solicitar uno nuevo.
              </p>
              
              {verificationSent && (
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertTitle>Correo enviado</AlertTitle>
                  <AlertDescription>
                    Hemos enviado un correo de verificación a {userEmail}. 
                    Por favor revisa tu bandeja de entrada y sigue las instrucciones.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        {!isVerified && (
          <Button 
            onClick={handleSendVerification}
            disabled={isLoading || verificationSent}
            variant="default"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : verificationSent ? (
              "Correo enviado"
            ) : (
              "Enviar correo de verificación"
            )}
          </Button>
        )}
        
        <Button 
          onClick={handleRefreshStatus} 
          variant="outline"
          disabled={checkingStatus}
        >
          {checkingStatus ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Actualizando...
            </>
          ) : (
            "Actualizar estado"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmailVerificationSection;