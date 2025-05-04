import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Building2, 
  Palette, 
  CreditCard, 
  FileTerminal, 
  FileText
} from "lucide-react";
import { useDocuments } from '@/context/document/document-context';
import { useSettingsOperations } from '@/hooks/use-settings-operations';
import { Document } from '@/types';
import { Separator } from '@/components/ui/separator';

// Importar los componentes individuales que ahora serán parte de las secciones
import TemplatePreferencesSettings from "./TemplatePreferencesSettings";
import CompanyInfoSettings from "./CompanyInfoSettings";
import PaymentMethodsSettings from "./payment-methods/PaymentMethodsSettings";
import TermsAndConditionsSettings from "./TermsAndConditionsSettings";

/**
 * Componente unificado que integra todas las configuraciones de plantilla en una sola vista vertical
 */
const UnifiedTemplateSettings: React.FC = () => {
  const { companyInfo, setCompanyInfo, templatePreferences, setTemplatePreferences, documents } = useDocuments();
  
  // Obtener las funciones de operaciones de configuración
  const { updateCompanyInfo, updateTemplatePreferences } = useSettingsOperations(
    companyInfo,
    setCompanyInfo,
    templatePreferences,
    setTemplatePreferences
  );
  
  // Documento para la vista previa
  const previewDocument: Document | null = documents.length > 0 ? documents[0] : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold mb-2">Configuración de Plantilla</h1>
        <p className="text-sm text-gray-500 mb-6">
          Personaliza la apariencia y el contenido de tus documentos
        </p>
      </div>

      {/* Sección de diseño */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Diseño y Estilo</h2>
        </div>
        <p className="text-sm text-gray-600">
          Personaliza los colores, la tipografía y el diseño general de tus documentos
        </p>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <TemplatePreferencesSettings />
          </CardContent>
        </Card>
      </div>

      <Separator className="my-10" />

      {/* Sección de empresa */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Información de Empresa</h2>
        </div>
        <p className="text-sm text-gray-600">
          Configura los datos de tu empresa que aparecerán en tus documentos
        </p>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <CompanyInfoSettings />
          </CardContent>
        </Card>
      </div>

      <Separator className="my-10" />

      {/* Sección de pagos */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Métodos de Pago</h2>
        </div>
        <p className="text-sm text-gray-600">
          Gestiona los métodos de pago disponibles para tus documentos
        </p>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <PaymentMethodsSettings />
          </CardContent>
        </Card>
      </div>

      <Separator className="my-10" />

      {/* Sección de términos y condiciones */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileTerminal className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Términos y Condiciones</h2>
        </div>
        <p className="text-sm text-gray-600">
          Configura los términos y condiciones que se mostrarán en tus documentos
        </p>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <TermsAndConditionsSettings />
          </CardContent>
        </Card>
      </div>

      {/* Vista previa (opcional) */}
      <Separator className="my-10" />
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Vista Previa</h2>
        </div>
        <p className="text-sm text-gray-600">
          Así se verán tus documentos con la configuración actual
        </p>
        <Card>
          <CardContent className="p-6">
            <div className="bg-gray-50 p-4 rounded border text-center">
              <div className="h-60 flex items-center justify-center border rounded bg-white">
                <p className="text-gray-400">Vista previa del documento con todas tus configuraciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>Todos los cambios se guardan automáticamente cuando modificas cualquier configuración.</p>
      </div>
      
      {/* Espacio adicional en la parte inferior para dispositivos móviles */}
      <div className="pb-20 md:pb-0"></div>
    </div>
  );
};

export default UnifiedTemplateSettings;