
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/auth";
import TwoFactorActiveStatus from "./TwoFactorActiveStatus";
import QRCodeSetupStep from "./QRCodeSetupStep";
import VerificationStep from "./VerificationStep";

const TwoFactorSecuritySection: React.FC = () => {
  const { authState, generate2FASecret, enable2FA, disable2FA } = useAuth();
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [twoFactorURL, setTwoFactorURL] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [setupStep, setSetupStep] = useState<"initial" | "qrcode" | "verify">("initial");
  const [error, setError] = useState<string | null>(null);
  
  // Calculate the effective switch state based on whether 2FA is enabled OR setup is in progress
  const switchEnabled = authState.currentUser?.twoFactorEnabled || showTwoFactorSetup;

  const handleInitiateTwoFactorSetup = () => {
    try {
      // Generate a new 2FA secret
      const { secret, url } = generate2FASecret(authState.currentUser?.id || "");
      setTwoFactorSecret(secret);
      setTwoFactorURL(url);
      setSetupStep("qrcode");
      setShowTwoFactorSetup(true);
      setError(null);
    } catch (err) {
      console.error("Error generating 2FA secret:", err);
      setError("Error al generar el código QR. Por favor, intenta de nuevo.");
    }
  };

  const handleVerifyTwoFactor = () => {
    if (!authState.currentUser?.id) {
      setError("No hay usuario autenticado");
      return;
    }
    
    if (verificationCode.length !== 6) {
      setError("El código debe tener 6 dígitos");
      return;
    }

    const success = enable2FA(authState.currentUser.id, verificationCode);
    
    if (success) {
      setShowTwoFactorSetup(false);
      setSetupStep("initial");
      setVerificationCode("");
      setError(null);
    } else {
      setError("Código inválido. Por favor, intenta de nuevo.");
    }
  };

  const handleDisableTwoFactor = () => {
    if (!authState.currentUser?.id) {
      setError("No hay usuario autenticado");
      return;
    }
    
    const success = disable2FA(authState.currentUser.id);
    if (success) {
      setShowTwoFactorSetup(false);
      setSetupStep("initial");
    }
  };

  const handleCancelSetup = () => {
    setShowTwoFactorSetup(false);
    setSetupStep("initial");
    setVerificationCode("");
    setError(null);
  };

  // Handle verification code change
  const handleVerificationCodeChange = (value: string) => {
    setVerificationCode(value);
    if (error && value.length > 0) {
      setError(null); // Clear error when user starts typing a new code
    }
  };

  // Fixed the switch toggle function to properly handle 2FA state and setup visibility
  const handleSwitchToggle = (checked: boolean) => {
    // If toggling off, we need to either disable 2FA or cancel setup
    if (!checked) {
      if (authState.currentUser?.twoFactorEnabled) {
        // Disable actual 2FA if it's enabled
        handleDisableTwoFactor();
      } else {
        // Just cancel setup if we're in the middle of it
        handleCancelSetup();
      }
    } 
    // If toggling on and 2FA is not already enabled or in setup
    else if (checked && !switchEnabled) {
      handleInitiateTwoFactorSetup();
    }
  };

  // Error message display for general errors
  const renderErrorMessage = () => {
    if (!error || showTwoFactorSetup) return null;
    
    return (
      <div className="rounded-md bg-red-50 p-3 mt-2">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-500" />
            <Label className="text-base font-medium">Autenticación de Dos Factores (2FA)</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Añade una capa adicional de seguridad a tu cuenta con códigos temporales.
          </p>
        </div>
        <Switch
          checked={switchEnabled}
          onCheckedChange={handleSwitchToggle}
        />
      </div>

      {renderErrorMessage()}

      {authState.currentUser?.twoFactorEnabled && (
        <TwoFactorActiveStatus onDisable={handleDisableTwoFactor} />
      )}

      {showTwoFactorSetup && setupStep === "qrcode" && (
        <QRCodeSetupStep
          twoFactorSecret={twoFactorSecret}
          twoFactorURL={twoFactorURL}
          onCancel={handleCancelSetup}
          onContinue={() => setSetupStep("verify")}
        />
      )}
      
      {showTwoFactorSetup && setupStep === "verify" && (
        <VerificationStep
          verificationCode={verificationCode}
          onCodeChange={handleVerificationCodeChange}
          onVerify={handleVerifyTwoFactor}
          onCancel={handleCancelSetup}
          error={error}
        />
      )}
    </div>
  );
};

export default TwoFactorSecuritySection;
