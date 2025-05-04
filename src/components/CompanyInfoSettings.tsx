import React, { useState } from "react";
import { useDocuments } from "@/context/document/document-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building2, User, Phone, Mail, MapPin, Save, RefreshCcw, AlertCircle, CheckCircle } from "lucide-react";
import LogoUpload from "@/components/LogoUpload";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Definición de la interfaz para la información de la empresa
interface CompanyInfoProps {
  companyInfo: {
    name?: string;
    contactName?: string;
    ruc?: string;
    dv?: string;
    phone?: string;
    email?: string;
    address?: string;
    logo?: string;
  };
}

// Componente de Vista Previa de la información de empresa
const CompanyPreview: React.FC<CompanyInfoProps> = ({ companyInfo }) => {
  return (
    <div className="bg-white rounded-lg p-4 border shadow-sm">
      <div className="space-y-4">
        {/* Logo y nombre */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
            {companyInfo.logo ? (
              <img 
                src={companyInfo.logo} 
                alt={companyInfo.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-base font-semibold line-clamp-1">{companyInfo.name || "Nombre de la empresa"}</h3>
            <p className="text-xs text-gray-500">RUC: {companyInfo.ruc || "00000000"}-{companyInfo.dv || "0"}</p>
          </div>
        </div>

        {/* Detalles de contacto */}
        <div className="text-sm space-y-2 border-t pt-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span>{companyInfo.contactName || "Nombre de contacto"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <span>{companyInfo.phone || "Teléfono"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="break-all">{companyInfo.email || "email@ejemplo.com"}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
            <span className="text-xs line-clamp-3">{companyInfo.address || "Dirección de la empresa"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Validador de campos
const validateField = (name: string, value: string): string | null => {
  switch (name) {
    case "email":
      return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length > 0
        ? "Correo electrónico inválido"
        : null;
    case "phone":
      return !/^[0-9\s()+-]{6,15}$/.test(value) && value.length > 0
        ? "Número de teléfono inválido"
        : null;
    case "ruc":
      return !/^[0-9-]{5,15}$/.test(value) && value.length > 0
        ? "RUC inválido (solo números y guiones)"
        : null;
    case "dv":
      return !/^[0-9]{1,2}$/.test(value) && value.length > 0
        ? "DV inválido (1-2 dígitos)"
        : null;
    default:
      return null;
  }
};

/*
 * Configuración de la información de la empresa.
 * - Permite editar y validar los datos de la empresa que aparecerán en los documentos.
 * - Incluye vista previa en tiempo real y carga de logo.
 * - Valida campos clave como email, teléfono, RUC y DV.
 */
// Componente principal
const CompanyInfoSettings: React.FC = () => {
  const { companyInfo, updateCompanyInfo } = useDocuments();
  const [activeTab, setActiveTab] = useState("general");
  const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Manejar cambios en los inputs con validación
  const handleInputChange = (name: string, value: string) => {
    updateCompanyInfo({ [name]: value });
    
    // Validar y actualizar errores
    const error = validateField(name, value);
    setValidationErrors((prev) => ({ ...prev, [name]: error }));
  };
  
  // Verificar si hay errores activos
  const hasErrors = Object.values(validationErrors).some((error) => error !== null);
  
  // Manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar todos los campos importantes
    const fields = ["name", "email", "phone", "ruc", "dv"];
    const errors: Record<string, string | null> = {};
    
    fields.forEach(field => {
      const value = companyInfo[field as keyof typeof companyInfo] as string;
      errors[field] = validateField(field, value);
    });
    
    setValidationErrors(errors);
    
    // Verificar si hay errores
    if (Object.values(errors).some(error => error !== null)) {
      toast.error("Por favor corrige los errores en el formulario");
      return;
    }
    
    // Simular guardado
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Información de la empresa guardada correctamente");
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Información de la Empresa
        </CardTitle>
        <CardDescription>
          Configura la información que aparecerá en tus documentos
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de configuraciones */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Información General</span>
                </TabsTrigger>
                <TabsTrigger value="contact" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="hidden sm:inline">Contacto</span>
                </TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleSubmit}>
                {/* Pestaña de Información General */}
                <TabsContent value="general" className="space-y-6 pt-4">
                  <div className="space-y-4">
                    <div className="flex justify-center mb-4">
                      <LogoUpload 
                        initialLogo={companyInfo.logo} 
                        onLogoChange={(logoUrl) => updateCompanyInfo({ logo: logoUrl })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Nombre de la Empresa
                        </Label>
                        {companyInfo.name?.length === 0 && (
                          <span className="text-xs text-orange-500">Campo requerido</span>
                        )}
                      </div>
                      <Input 
                        id="name" 
                        value={companyInfo.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Ingrese el nombre de su empresa"
                        className={
                          companyInfo.name?.length === 0 ? "border-orange-300 focus-visible:ring-orange-300" : ""
                        }
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="ruc" className="text-sm font-medium">
                            R.U.C.
                          </Label>
                          {validationErrors.ruc && (
                            <span className="text-xs text-red-500">{validationErrors.ruc}</span>
                          )}
                        </div>
                        <Input 
                          id="ruc" 
                          value={companyInfo.ruc}
                          onChange={(e) => handleInputChange("ruc", e.target.value)}
                          placeholder="Ej. 12345678"
                          className={
                            validationErrors.ruc ? "border-red-300 focus-visible:ring-red-300" : ""
                          }
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="dv" className="text-sm font-medium">
                            DV
                          </Label>
                          {validationErrors.dv && (
                            <span className="text-xs text-red-500">{validationErrors.dv}</span>
                          )}
                        </div>
                        <Input 
                          id="dv" 
                          value={companyInfo.dv}
                          onChange={(e) => handleInputChange("dv", e.target.value)}
                          placeholder="Ej. 5"
                          className={
                            validationErrors.dv ? "border-red-300 focus-visible:ring-red-300" : ""
                          }
                          maxLength={2}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="address" className="text-sm font-medium">
                          Dirección
                        </Label>
                      </div>
                      <Input 
                        id="address" 
                        value={companyInfo.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Dirección completa de la empresa"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                {/* Pestaña de Contacto */}
                <TabsContent value="contact" className="space-y-6 pt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Nombre de Contacto</Label>
                      <Input 
                        id="contactName" 
                        value={companyInfo.contactName}
                        onChange={(e) => handleInputChange("contactName", e.target.value)}
                        placeholder="Nombre de la persona de contacto"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="phone" className="text-sm font-medium">
                          Teléfono
                        </Label>
                        {validationErrors.phone && (
                          <span className="text-xs text-red-500">{validationErrors.phone}</span>
                        )}
                      </div>
                      <Input 
                        id="phone" 
                        value={companyInfo.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="Ej. +507 6123-4567"
                        className={
                          validationErrors.phone ? "border-red-300 focus-visible:ring-red-300" : ""
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Correo Electrónico
                        </Label>
                        {validationErrors.email && (
                          <span className="text-xs text-red-500">{validationErrors.email}</span>
                        )}
                      </div>
                      <Input 
                        id="email" 
                        type="email"
                        value={companyInfo.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="email@ejemplo.com"
                        className={
                          validationErrors.email ? "border-red-300 focus-visible:ring-red-300" : ""
                        }
                      />
                    </div>
                  </div>
                </TabsContent>
              </form>
            </Tabs>
            
            <div className="mt-6">
              <Separator className="mb-6" />
              
              <div className="flex items-center justify-between">
                {hasErrors && (
                  <div className="flex items-center text-red-500 text-xs gap-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>Por favor corrige los errores antes de guardar</span>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="gap-2"
                          onClick={() => {
                            updateCompanyInfo({
                              name: "",
                              contactName: "",
                              ruc: "",
                              dv: "",
                              phone: "",
                              email: "",
                              address: "",
                              logo: ""
                            });
                            setValidationErrors({});
                            toast.info("Información reiniciada");
                          }}
                        >
                          <RefreshCcw className="h-4 w-4" />
                          <span className="hidden sm:inline">Reiniciar</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Reiniciar toda la información</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <Button 
                    type="submit" 
                    className="gap-2"
                    onClick={handleSubmit}
                    disabled={isSubmitting || hasErrors}
                  >
                    {isSubmitting ? (
                      <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>Guardar Cambios</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Panel de vista previa */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Vista Previa</h3>
              <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Previsualización
              </span>
            </div>
            <CompanyPreview companyInfo={companyInfo} />
            <p className="text-xs text-muted-foreground text-center mt-2">
              Así aparecerá tu información en documentos
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyInfoSettings;
