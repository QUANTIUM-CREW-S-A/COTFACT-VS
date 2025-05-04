import React, { useState, useRef } from 'react';
import { useDocuments } from "@/context/document/document-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image, Upload } from "lucide-react";
import { toast } from "sonner";

/*
 * Componente para subir y previsualizar el logo de la empresa.
 * - Permite ingresar una URL o subir una imagen desde el dispositivo.
 * - Actualiza el logo en la configuración de la empresa y muestra una vista previa.
 */

interface LogoUploadProps {
  initialLogo?: string;
  onLogoChange?: (logoUrl: string) => void;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ initialLogo, onLogoChange }) => {
  const { companyInfo, updateCompanyInfo } = useDocuments();
  const [logoUrl, setLogoUrl] = useState(initialLogo || companyInfo.logo);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleLogoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoUrl(e.target.value);
  };
  
  const handleLogoUpdate = () => {
    if (onLogoChange) {
      onLogoChange(logoUrl);
    } else {
      updateCompanyInfo({ logo: logoUrl });
    }
    toast.success("Logo actualizado con éxito");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setLogoUrl(result);
        if (onLogoChange) {
          onLogoChange(result);
        } else {
          updateCompanyInfo({ logo: result });
        }
        toast.success("Logo cargado con éxito");
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <Label htmlFor="logoUrl" className="flex items-center gap-1">
          <Image className="h-4 w-4" /> URL del Logo
        </Label>
        <Input
          id="logoUrl"
          placeholder="https://ejemplo.com/logo.png"
          value={logoUrl}
          onChange={handleLogoUrlChange}
          className="border-viangblue-light/30 focus-visible:ring-viangblue-light"
        />
        <p className="text-xs text-muted-foreground">
          Ingresa la URL de tu logo o carga un archivo desde tu dispositivo.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="bg-gray-100 p-3 rounded-md border flex items-center justify-center" style={{ width: '100px', height: '100px' }}>
          {logoUrl ? (
            <img src={logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
          ) : (
            <Image className="h-10 w-10 text-gray-400" />
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Button onClick={handleLogoUpdate} className="bg-viangblue-dark hover:bg-viangblue">
            <Upload className="mr-2 h-4 w-4" />
            Actualizar Logo
          </Button>
          
          <Button onClick={triggerFileInput} variant="outline" className="flex-1 md:flex-none">
            <Upload className="mr-2 h-4 w-4" />
            Subir desde dispositivo
          </Button>
          
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
};

export default LogoUpload;
