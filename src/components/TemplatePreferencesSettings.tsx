import React, { useState, useEffect } from "react";
import { useDocuments } from "@/context/document/document-context";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { 
  Palette, 
  Type, 
  Layout, 
  Eye, 
  CheckCircle2, 
  ArrowLeftRight,
  Save,
  FileText
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useSettingsOperations } from "@/hooks/use-settings-operations";
import { useInitialData } from "@/hooks/use-initial-data";

// Componente para selección de color
const ColorOption = ({ value, label, currentValue, onSelect }) => {
  // Configuración de colores
  const colors = {
    blue: { bg: "bg-blue-600", border: "border-blue-600" },
    teal: { bg: "bg-teal-600", border: "border-teal-600" },
    purple: { bg: "bg-purple-600", border: "border-purple-600" },
    red: { bg: "bg-red-600", border: "border-red-600" },
    orange: { bg: "bg-orange-600", border: "border-orange-600" }
  };

  const isSelected = value === currentValue;
  
  return (
    <div 
      className={`flex flex-col items-center gap-1.5 cursor-pointer transition-all ${isSelected ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}
      onClick={() => onSelect(value)}
    >
      <div className={`h-8 w-8 rounded-full ${colors[value].bg} flex items-center justify-center ${isSelected ? 'ring-2 ring-offset-2' : ''}`}>
        {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
};

// Componente principal
const TemplatePreferencesSettings = () => {
  const { templatePreferences, setTemplatePreferences } = useDocuments();
  const { loadTemplatePreferences } = useInitialData();
  const { updateTemplatePreferences } = useSettingsOperations(
    null,
    null,
    templatePreferences,
    setTemplatePreferences
  );

  // Estado local para almacenar cambios sin guardar
  const [localPreferences, setLocalPreferences] = useState(templatePreferences);
  
  // Estado para indicar si hay cambios sin guardar
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Estado para mostrar loader durante el guardado
  const [isSaving, setIsSaving] = useState(false);

  // Cargar datos de plantilla al iniciar el componente 
  useEffect(() => {
    // Cargar preferencias de plantilla bajo demanda (solo cuando se necesitan)
    const loadData = async () => {
      await loadTemplatePreferences();
    };
    
    loadData();
  }, [loadTemplatePreferences]);
  
  // Actualizar el estado local cuando cambian las preferencias globales
  useEffect(() => {
    setLocalPreferences(templatePreferences);
    // No considerar esto como un cambio sin guardar ya que viene del estado global
    setHasUnsavedChanges(false);
  }, [templatePreferences]);
  
  // Función para manejar los cambios en las preferencias locales
  const handlePreferenceChange = (updates) => {
    setLocalPreferences(prev => ({
      ...prev,
      ...updates
    }));
    setHasUnsavedChanges(true);
  };
  
  // Función para guardar los cambios en el servidor
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Actualizamos las preferencias globales
      await updateTemplatePreferences(localPreferences);
      setHasUnsavedChanges(false);
      toast.success("Cambios guardados exitosamente");
    } catch (error) {
      toast.error("Error al guardar los cambios");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="mb-6">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          <h3 className="text-lg font-medium">Preferencias de Plantilla</h3>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Personaliza el aspecto y el diseño de tus documentos
        </p>
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-10">
          {/* SECCIÓN DE ESTILO */}
          <div>
            <h3 className="text-md font-semibold mb-4 flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Estilo
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Tema de color */}
              <div>
                <h4 className="font-medium text-sm mb-3">Tema de Color</h4>
                <div className="flex justify-between items-center">
                  <ColorOption 
                    value="blue" 
                    label="Azul" 
                    currentValue={localPreferences.colorTheme || "blue"} 
                    onSelect={(value) => handlePreferenceChange({ colorTheme: value })} 
                  />
                  <ColorOption 
                    value="teal" 
                    label="Verde" 
                    currentValue={localPreferences.colorTheme || "blue"} 
                    onSelect={(value) => handlePreferenceChange({ colorTheme: value })} 
                  />
                  <ColorOption 
                    value="purple" 
                    label="Morado" 
                    currentValue={localPreferences.colorTheme || "blue"} 
                    onSelect={(value) => handlePreferenceChange({ colorTheme: value })} 
                  />
                  <ColorOption 
                    value="red" 
                    label="Rojo" 
                    currentValue={localPreferences.colorTheme || "blue"} 
                    onSelect={(value) => handlePreferenceChange({ colorTheme: value })} 
                  />
                  <ColorOption 
                    value="orange" 
                    label="Naranja" 
                    currentValue={localPreferences.colorTheme || "blue"} 
                    onSelect={(value) => handlePreferenceChange({ colorTheme: value })} 
                  />
                </div>
              </div>
              
              {/* Tipografía */}
              <div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center">
                    <Type className="h-4 w-4 mr-2" />
                    Tipografía
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Selecciona la fuente para tus documentos
                  </p>
                  
                  <Select 
                    value={localPreferences.fontFamily} 
                    onValueChange={(value) => handlePreferenceChange({ fontFamily: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona una fuente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="arial">Arial</SelectItem>
                      <SelectItem value="calibri">Calibri</SelectItem>
                      <SelectItem value="times">Times New Roman</SelectItem>
                      <SelectItem value="georgia">Georgia</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className={`mt-3 p-3 rounded border ${
                    localPreferences.fontFamily === "times" || localPreferences.fontFamily === "georgia" 
                      ? "font-serif" : "font-sans"
                  }`}>
                    <span className="text-xs">Ejemplo de texto con {
                      localPreferences.fontFamily === "arial" ? "Arial" : 
                      localPreferences.fontFamily === "calibri" ? "Calibri" :
                      localPreferences.fontFamily === "times" ? "Times New Roman" :
                      localPreferences.fontFamily === "georgia" ? "Georgia" : "Arial"
                    }</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* SECCIÓN DE DISEÑO */}
          <div>
            <h3 className="text-md font-semibold mb-4 flex items-center">
              <Layout className="h-5 w-5 mr-2" />
              Diseño
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                {/* Diseño de encabezado */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center">
                    <Layout className="h-4 w-4 mr-2" />
                    Diseño de Encabezado
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Elige cómo se verá el encabezado de tus documentos
                  </p>
                  
                  <Select 
                    value={localPreferences.headerLayout} 
                    onValueChange={(value) => handlePreferenceChange({ headerLayout: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un diseño" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Predeterminado</SelectItem>
                      <SelectItem value="centered">Centrado</SelectItem>
                      <SelectItem value="minimal">Minimalista</SelectItem>
                      <SelectItem value="modern">Moderno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Diseño de triángulo */}
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <Label htmlFor="triangleDesign" className="text-sm font-medium flex items-center">
                      <ArrowLeftRight className="h-4 w-4 mr-2" />
                      Diseño Moderno con Triángulos
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Aplica un diseño moderno con triángulos en el encabezado
                    </p>
                  </div>
                  
                  <Switch 
                    id="triangleDesign"
                    checked={localPreferences.useTriangleDesign}
                    onCheckedChange={(checked) => handlePreferenceChange({ useTriangleDesign: checked })}
                  />
                </div>
              </div>
              
              {/* Descripción visual del diseño seleccionado */}
              <div className="bg-gray-50 rounded-md p-4 border">
                <h4 className="text-sm font-medium mb-3">Diseño seleccionado:</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>
                    Tipo de encabezado: <span className="font-medium">{
                      localPreferences.headerLayout === "default" ? "Predeterminado" :
                      localPreferences.headerLayout === "centered" ? "Centrado" :
                      localPreferences.headerLayout === "minimal" ? "Minimalista" :
                      localPreferences.headerLayout === "modern" ? "Moderno" : "Predeterminado"
                    }</span>
                  </li>
                  <li>
                    Diseño con triángulos: <span className="font-medium">{localPreferences.useTriangleDesign ? "Activado" : "Desactivado"}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* SECCIÓN DE ELEMENTOS */}
          <div>
            <h3 className="text-md font-semibold mb-4 flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Elementos
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Logo y marca */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Logo y Marca</h4>
                
                <div className="flex items-center justify-between py-1">
                  <Label htmlFor="showLogo" className="flex-1">Mostrar Logo</Label>
                  <Switch 
                    id="showLogo" 
                    checked={localPreferences.showLogo}
                    onCheckedChange={(checked) => handlePreferenceChange({ showLogo: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between py-1">
                  <Label htmlFor="showCompanyName" className="flex-1">Mostrar Nombre de Empresa</Label>
                  <Switch 
                    id="showCompanyName" 
                    checked={localPreferences.showCompanyName}
                    onCheckedChange={(checked) => handlePreferenceChange({ showCompanyName: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between py-1">
                  <Label htmlFor="showWatermark" className="flex-1">Mostrar Marca de Agua</Label>
                  <Switch 
                    id="showWatermark" 
                    checked={localPreferences.showWatermark}
                    onCheckedChange={(checked) => handlePreferenceChange({ showWatermark: checked })}
                  />
                </div>
              </div>
              
              {/* Contenido */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Contenido</h4>
                
                <div className="flex items-center justify-between py-1">
                  <Label htmlFor="showFullDocumentNumber" className="flex-1">Número Completo de Documento</Label>
                  <Switch 
                    id="showFullDocumentNumber" 
                    checked={localPreferences.showFullDocumentNumber}
                    onCheckedChange={(checked) => handlePreferenceChange({ showFullDocumentNumber: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between py-1">
                  <Label htmlFor="showSignature" className="flex-1">Sección de Firma</Label>
                  <Switch 
                    id="showSignature" 
                    checked={localPreferences.showSignature}
                    onCheckedChange={(checked) => handlePreferenceChange({ showSignature: checked })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <div className="p-4 border-t flex justify-end">
        <Button 
          variant="default" 
          size="default" 
          className="flex gap-2 px-6"
          onClick={handleSaveChanges}
          disabled={!hasUnsavedChanges || isSaving}
        >
          {isSaving ? (
            <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
          ) : (
            <Save className="h-4 w-4" />
          )}
          Guardar Cambios
        </Button>
      </div>
    </Card>
  );
};

export default TemplatePreferencesSettings;
