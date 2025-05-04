import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SecuritySettings from "@/components/SecuritySettings";
import UsersManagement from "@/components/users/UsersManagement";
import ThemeSettings from "@/components/settings/ThemeSettings";
import UnifiedTemplateSettings from "@/components/UnifiedTemplateSettings";
import ConnectionDiagnostic from "@/components/ConnectionDiagnostic";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Drawer, 
  DrawerContent, 
  DrawerTrigger,
  DrawerClose
} from "@/components/ui/drawer";
import { 
  FileText, 
  Shield, 
  ChevronDown,
  X,
  Users,
  Palette,
  Wifi,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";

const SettingsPage: React.FC = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const isAdmin = authState.currentUser?.role === 'admin';
  
  // Obtener pestaña activa del hash de la URL si está presente
  const getInitialTab = () => {
    const hash = location.hash.replace('#', '');
    if (hash && ['template', 'security', 'users', 'appearance', 'diagnostic'].includes(hash)) {
      return hash;
    }
    return "template";
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Simulamos una carga para las animaciones
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);
  
  // Actualizar el hash cuando cambia la tab
  useEffect(() => {
    if (activeTab) {
      navigate(`/settings#${activeTab}`, { replace: true });
    }
  }, [activeTab, navigate]);
  
  const tabIcons = {
    template: <FileText className="h-4 w-4" />,
    security: <Shield className="h-4 w-4" />,
    users: <Users className="h-4 w-4" />,
    appearance: <Palette className="h-4 w-4" />,
    diagnostic: <Wifi className="h-4 w-4" />
  };
  
  const tabLabels = {
    template: "Plantilla",
    security: "Seguridad",
    users: "Usuarios",
    appearance: "Apariencia",
    diagnostic: "Diagnóstico"
  };

  const tabColors = {
    template: "text-blue-600",
    security: "text-amber-600",
    users: "text-purple-600",
    appearance: "text-green-600",
    diagnostic: "text-cyan-600"
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setDrawerOpen(false);
  };

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  // Mobile drawer tab selector
  const renderMobileTabSelector = () => {
    return (
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-between py-6 mb-4 shadow-sm border rounded-lg"
          >
            <div className="flex items-center gap-2">
              {tabIcons[activeTab as keyof typeof tabIcons]}
              <span>{tabLabels[activeTab as keyof typeof tabLabels]}</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[70vh]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Secciones de Configuración</h3>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
            <div className="space-y-2">
              {Object.entries(tabLabels).map(([key, label]) => {
                // Ocultar la pestaña de usuarios si no es admin
                if (key === 'users' && !isAdmin) return null;
                
                return (
                  <Button 
                    key={key}
                    variant={activeTab === key ? "default" : "ghost"}
                    className={`w-full justify-start py-6 text-base ${
                      activeTab === key 
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                        : ''
                    }`}
                    onClick={() => handleTabChange(key)}
                  >
                    <div className="flex items-center gap-3">
                      {tabIcons[key as keyof typeof tabIcons]}
                      <span>{label}</span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  };
  
  return (
    <main className="container mx-auto px-4 md:px-6 py-4 mt-14 md:mt-0 max-w-7xl">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6"
      >
        <div className="flex items-center">
          <Settings className="mr-2 h-5 w-5 text-blue-600" />
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Configuración
          </h1>
        </div>
      </motion.div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        className="space-y-6"
      >
        <Card className="border shadow-md">
          <CardContent className="pt-6 px-4 sm:px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {isMobile ? (
                renderMobileTabSelector()
              ) : (
                <TabsList className="mb-6 w-full grid grid-cols-3 md:grid-cols-5 bg-muted/60">
                  <TabsTrigger value="template" className="flex gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    <FileText className={`h-4 w-4 ${activeTab === 'template' ? 'text-blue-600' : ''}`} />
                    <span>Plantilla</span>
                  </TabsTrigger>
                  <TabsTrigger value="appearance" className="flex gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    <Palette className={`h-4 w-4 ${activeTab === 'appearance' ? 'text-green-600' : ''}`} />
                    <span>Apariencia</span>
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    <Shield className={`h-4 w-4 ${activeTab === 'security' ? 'text-amber-600' : ''}`} />
                    <span>Seguridad</span>
                  </TabsTrigger>
                  {(authState.currentUser?.role === 'admin' || authState.currentUser?.role === 'root') && (
                    <TabsTrigger value="users" className="flex gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <Users className={`h-4 w-4 ${activeTab === 'users' ? 'text-purple-600' : ''}`} />
                      <span>Usuarios</span>
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="diagnostic" className="flex gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    <Wifi className={`h-4 w-4 ${activeTab === 'diagnostic' ? 'text-cyan-600' : ''}`} />
                    <span>Diagnóstico</span>
                  </TabsTrigger>
                </TabsList>
              )}
              
              {/* Componentes de pestaña con animaciones */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5 }}
              >
                <TabsContent value="template" className="pt-2">
                  <div className="mb-4 flex items-center">
                    <FileText className={`mr-2 h-5 w-5 ${tabColors.template}`} />
                    <h2 className="text-xl font-semibold">Configuración de Plantilla</h2>
                  </div>
                  <UnifiedTemplateSettings />
                </TabsContent>
                
                <TabsContent value="appearance" className="pt-2">
                  <div className="mb-4 flex items-center">
                    <Palette className={`mr-2 h-5 w-5 ${tabColors.appearance}`} />
                    <h2 className="text-xl font-semibold">Configuración de Apariencia</h2>
                  </div>
                  <ThemeSettings />
                </TabsContent>

                <TabsContent value="security" className="pt-2">
                  <div className="mb-4 flex items-center">
                    <Shield className={`mr-2 h-5 w-5 ${tabColors.security}`} />
                    <h2 className="text-xl font-semibold">Configuración de Seguridad</h2>
                  </div>
                  <SecuritySettings />
                </TabsContent>

                <TabsContent value="users" className="pt-2">
                  <div className="mb-4 flex items-center">
                    <Users className={`mr-2 h-5 w-5 ${tabColors.users}`} />
                    <h2 className="text-xl font-semibold">Gestión de Usuarios</h2>
                  </div>
                  {authState.currentUser?.role === 'root' || authState.currentUser?.role === 'admin' ? (
                    <UsersManagement />
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium">Acceso restringido</h3>
                        <p className="text-gray-500 mt-2">
                          Solo los administradores y usuarios root pueden gestionar usuarios.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="diagnostic" className="pt-2">
                  <div className="mb-4 flex items-center">
                    <Wifi className={`mr-2 h-5 w-5 ${tabColors.diagnostic}`} />
                    <h2 className="text-xl font-semibold">Diagnóstico de Conexión</h2>
                  </div>
                  <ConnectionDiagnostic />
                </TabsContent>
              </motion.div>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Espacio adicional en la parte inferior para dispositivos móviles */}
      <div className="pb-20 md:pb-0"></div>
    </main>
  );
};

export default SettingsPage;
