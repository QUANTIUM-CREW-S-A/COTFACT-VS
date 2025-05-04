import React, { useState } from "react";
import { useAuth } from "@/context/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Shield, LockIcon, History, Key, Mail } from "lucide-react";
import TwoFactorSecuritySection from "./security/TwoFactorSecuritySection";
import PasswordChangeSection from "./security/PasswordChangeSection";
import ActivityLogViewer from "./security/ActivityLogViewer";
import AccountLockingSection from "./security/AccountLockingSection";
import EmailVerificationSection from "./security/EmailVerificationSection";
import { Separator } from "@/components/ui/separator";

const SecuritySettings: React.FC = () => {
  const { authState } = useAuth();
  const [activeTab, setActiveTab] = useState("account");

  // Ensure we have a user before rendering
  if (!authState.currentUser) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>No hay usuario autenticado. Por favor, inicia sesión.</p>
        </CardContent>
      </Card>
    );
  }

  const isAdmin = authState.currentUser.role === 'admin' || authState.currentUser.role === 'root';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          Seguridad de la Cuenta
        </CardTitle>
        <CardDescription>
          Configura opciones de seguridad para proteger tu cuenta y monitorea la actividad
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <span>Credenciales</span>
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>Verificación</span>
            </TabsTrigger>
            <TabsTrigger value="protection" className="flex items-center gap-2">
              <LockIcon className="h-4 w-4" />
              <span>Protección</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>Actividad</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="space-y-4">
            <PasswordChangeSection />
            <Separator className="my-6" />
            <TwoFactorSecuritySection />
          </TabsContent>
          
          <TabsContent value="verification" className="space-y-4">
            <EmailVerificationSection />
          </TabsContent>
          
          <TabsContent value="protection" className="space-y-4">
            <AccountLockingSection />
          </TabsContent>
          
          <TabsContent value="activity" className="space-y-4">
            <ActivityLogViewer />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings;
