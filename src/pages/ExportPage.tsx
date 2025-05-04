import React, { useState, useEffect } from "react";
import { useDocuments } from "@/context/document/document-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Download, FileIcon, FileText, Settings, Table,
  BarChart, FileSpreadsheet, FileCheck, Calendar,
  ChevronRight, ChevronDown, Filter, CalendarIcon, 
  RefreshCw, ArrowDown, Save, Users, Building2, Eye,
  PenSquare, Printer, FileJson, Mail, BookOpen
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Customer, Document } from "@/types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Define los tipos de pestañas disponibles
type ExportTab = "basic" | "advanced" | "batch" | "reports";

// Componente para mostrar un formato de exportación
interface FormatOptionProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

// Componente para mostrar opciones de formato
const FormatOption = ({ icon, name, description, selected, onClick }: FormatOptionProps) => (
  <div 
    className={`
      border rounded-lg p-4 cursor-pointer transition-all
      ${selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}
    `}
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-md ${selected ? 'bg-primary/10' : 'bg-secondary/20'}`}>
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-foreground">{name}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  </div>
);

// Componente para los filtros de exportación
const ExportFilters = ({ 
  dateRange, 
  onDateRangeChange, 
  documentTypes, 
  onDocumentTypeChange,
  customers,
  selectedCustomer,
  onCustomerChange,
  onApplyFilters
}: { 
  dateRange: { from: Date | undefined; to: Date | undefined }; 
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void; 
  documentTypes: string[];
  onDocumentTypeChange: (types: string[]) => void;
  customers: Customer[];
  selectedCustomer: string | undefined;
  onCustomerChange: (customerId: string | undefined) => void;
  onApplyFilters: () => void;
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-primary" />
          Rango de Fechas
        </h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal w-full sm:w-[240px]"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "P", { locale: es })} -{" "}
                      {format(dateRange.to, "P", { locale: es })}
                    </>
                  ) : (
                    format(dateRange.from, "P", { locale: es })
                  )
                ) : (
                  <span>Seleccionar fechas</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range) => onDateRangeChange(range || { from: undefined, to: undefined })}
                numberOfMonths={2}
                locale={es}
              />
            </PopoverContent>
          </Popover>
          {dateRange.from && dateRange.to && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onDateRangeChange({ from: undefined, to: undefined })}
              className="sm:h-10"
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-primary" />
          Tipo de Documento
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={documentTypes.includes("quote") ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (documentTypes.includes("quote")) {
                onDocumentTypeChange(documentTypes.filter(type => type !== "quote"));
              } else {
                onDocumentTypeChange([...documentTypes, "quote"]);
              }
            }}
            className={documentTypes.includes("quote") ? "bg-primary/20 hover:bg-primary/30 text-primary" : ""}
          >
            Cotizaciones
          </Button>
          <Button
            variant={documentTypes.includes("invoice") ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (documentTypes.includes("invoice")) {
                onDocumentTypeChange(documentTypes.filter(type => type !== "invoice"));
              } else {
                onDocumentTypeChange([...documentTypes, "invoice"]);
              }
            }}
            className={documentTypes.includes("invoice") ? "bg-primary/20 hover:bg-primary/30 text-primary" : ""}
          >
            Facturas
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
          <Users className="h-4 w-4 text-primary" />
          Cliente
        </h3>
        <div className="flex gap-2">
          <Select value={selectedCustomer} onValueChange={onCustomerChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos los clientes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los clientes</SelectItem>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-2">
        <Button onClick={onApplyFilters} className="w-full">
          <Filter className="mr-2 h-4 w-4" />
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
};

// Componente resumen de filtros aplicados
const FilterSummary = ({ 
  dateRange, 
  documentTypes, 
  selectedCustomer, 
  customers 
}: { 
  dateRange: { from: Date | undefined; to: Date | undefined }; 
  documentTypes: string[];
  selectedCustomer: string | undefined;
  customers: Customer[];
}) => {
  const hasFilters = (dateRange.from && dateRange.to) || documentTypes.length > 0 || selectedCustomer;
  
  if (!hasFilters) return null;
  
  // Traducciones para los tipos de documentos
  const typeLabels: { [key: string]: string } = {
    quote: "Cotizaciones",
    invoice: "Facturas"
  };
  
  // Encontrar el nombre del cliente seleccionado
  const customerName = selectedCustomer ? 
    customers.find(c => c.id === selectedCustomer)?.name || "Cliente desconocido" : 
    undefined;
  
  return (
    <div className="bg-muted/50 p-3 rounded-md">
      <div className="flex items-center gap-2 text-sm">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-medium">Filtros aplicados:</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {dateRange.from && dateRange.to && (
          <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-xs">
            <CalendarIcon className="mr-1 h-3 w-3" />
            {format(dateRange.from, "P", { locale: es })} a {format(dateRange.to, "P", { locale: es })}
          </Badge>
        )}
        
        {documentTypes.map((type) => (
          <Badge key={type} variant="outline" className="bg-primary/5 border-primary/20 text-primary text-xs">
            <FileText className="mr-1 h-3 w-3" />
            {typeLabels[type] || type}
          </Badge>
        ))}
        
        {customerName && (
          <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-xs">
            <Users className="mr-1 h-3 w-3" />
            {customerName}
          </Badge>
        )}
      </div>
    </div>
  );
};

// Página principal de exportación
const ExportPage = () => {
  // Set document title with useEffect instead of using Helmet
  useEffect(() => {
    document.title = "Exportar Documentos | COTFACT-VS";
  }, []);
  
  const { documents, customers } = useDocuments();
  const [activeTab, setActiveTab] = useState<ExportTab>("basic");
  const [selectedFormat, setSelectedFormat] = useState<string>("pdf");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("standard");
  const [includeCompanyHeader, setIncludeCompanyHeader] = useState<boolean>(true);
  const [includeDetails, setIncludeDetails] = useState<boolean>(true);
  const [includeTotals, setIncludeTotals] = useState<boolean>(true);
  const [includeCustomerInfo, setIncludeCustomerInfo] = useState<boolean>(true);
  const [includeFooter, setIncludeFooter] = useState<boolean>(true);
  const [watermarkText, setWatermarkText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [documentTypes, setDocumentTypes] = useState<string[]>(["quote", "invoice"]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | undefined>(undefined);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [reportType, setReportType] = useState<string>("summary");
  const [reportPeriod, setReportPeriod] = useState<string>("monthly");
  const [selectedDataFields, setSelectedDataFields] = useState<string[]>([
    "customer", "date", "total", "status"
  ]);

  // Al montar el componente, inicializar los documentos filtrados
  useEffect(() => {
    setFilteredDocuments(documents);
  }, [documents]);

  // Filtrar los documentos según los criterios
  const applyFilters = () => {
    let filtered = [...documents];
    
    // Filtrar por tipo de documento
    if (documentTypes.length > 0) {
      filtered = filtered.filter(doc => documentTypes.includes(doc.type));
    }
    
    // Filtrar por rango de fechas
    if (dateRange.from && dateRange.to) {
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999); // Incluir todo el día final
      
      filtered = filtered.filter(doc => {
        const docDate = new Date(doc.date);
        return docDate >= fromDate && docDate <= toDate;
      });
    }
    
    // Filtrar por cliente
    if (selectedCustomer) {
      filtered = filtered.filter(doc => doc.customer.id === selectedCustomer);
    }
    
    setFilteredDocuments(filtered);
    toast.success(`Se encontraron ${filtered.length} documentos con los filtros aplicados`);
  };

  // Generar la exportación
  const handleExport = async () => {
    if (filteredDocuments.length === 0) {
      toast.error("No hay documentos para exportar");
      return;
    }

    setIsExporting(true);

    try {
      let successMessage = "";
      
      // Simulación de exportación (en una implementación real, aquí iría la lógica real)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      switch (activeTab) {
        case "basic":
          successMessage = `Documentos exportados en formato ${selectedFormat.toUpperCase()} correctamente`;
          break;
        case "advanced":
          successMessage = `Exportación avanzada completada con la plantilla ${selectedTemplate}`;
          break;
        case "batch":
          successMessage = `${selectedDocuments.length} documentos exportados en lote correctamente`;
          break;
        case "reports":
          successMessage = `Reporte ${reportType} generado correctamente`;
          break;
        default:
          successMessage = "Exportación completada correctamente";
      }
      
      toast.success(successMessage);
    } catch (error) {
      console.error("Error durante la exportación:", error);
      toast.error("Error al exportar los documentos");
    } finally {
      setIsExporting(false);
    }
  };

  // Toggle de selección de documentos para exportación por lotes
  const toggleDocumentSelection = (docId: string) => {
    if (selectedDocuments.includes(docId)) {
      setSelectedDocuments(selectedDocuments.filter(id => id !== docId));
    } else {
      setSelectedDocuments([...selectedDocuments, docId]);
    }
  };

  // Seleccionar/deseleccionar todos los documentos
  const toggleSelectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map(doc => doc.id));
    }
  };

  // Toggle de campos de datos para reportes
  const toggleDataField = (field: string) => {
    if (selectedDataFields.includes(field)) {
      setSelectedDataFields(selectedDataFields.filter(f => f !== field));
    } else {
      setSelectedDataFields([...selectedDataFields, field]);
    }
  };

  return (
    <>
      <div className="container mx-auto pb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
              <Download className="h-6 w-6 text-primary" />
              Exportación de Documentos
            </h1>
            <p className="text-muted-foreground mt-1">
              Exporta tus cotizaciones y facturas en diferentes formatos
            </p>
          </div>
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as ExportTab)} 
          className="mt-2"
        >
          <TabsList className="grid grid-cols-4 w-full md:w-[600px]">
            <TabsTrigger value="basic" className="flex items-center gap-1.5">
              <Download className="h-4 w-4" />
              <span>Básico</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-1.5">
              <Settings className="h-4 w-4" />
              <span>Avanzado</span>
            </TabsTrigger>
            <TabsTrigger value="batch" className="flex items-center gap-1.5">
              <FileCheck className="h-4 w-4" />
              <span>Por lotes</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-1.5">
              <BarChart className="h-4 w-4" />
              <span>Reportes</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Panel de filtros - visible en todas las pestañas */}
            <div>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    Filtros
                  </CardTitle>
                  <CardDescription>
                    Filtra los documentos que deseas exportar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ExportFilters 
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    documentTypes={documentTypes}
                    onDocumentTypeChange={setDocumentTypes}
                    customers={customers}
                    selectedCustomer={selectedCustomer}
                    onCustomerChange={setSelectedCustomer}
                    onApplyFilters={applyFilters}
                  />
                </CardContent>
              </Card>
              
              {/* Panel de documentos encontrados */}
              <Card className="mt-5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Documentos
                  </CardTitle>
                  <CardDescription>
                    {filteredDocuments.length} documentos encontrados
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-[200px] overflow-y-auto">
                  <ul className="space-y-2">
                    {filteredDocuments.slice(0, 5).map(doc => (
                      <li key={doc.id} className="text-sm flex justify-between border-b pb-2">
                        <span className="font-medium">{doc.number}</span>
                        <span className="text-muted-foreground">{format(new Date(doc.date), "P", { locale: es })}</span>
                      </li>
                    ))}
                    {filteredDocuments.length > 5 && (
                      <li className="text-xs text-center text-muted-foreground pt-1">
                        Y {filteredDocuments.length - 5} documentos más...
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            {/* Panel de configuración específico para cada pestaña */}
            <div className="md:col-span-2">
              <FilterSummary 
                dateRange={dateRange}
                documentTypes={documentTypes}
                selectedCustomer={selectedCustomer}
                customers={customers}
              />
              
              <TabsContent value="basic" className="mt-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Exportación Básica</CardTitle>
                    <CardDescription>
                      Exporta tus documentos en formatos estándar
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Formato de Exportación</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <FormatOption
                          icon={<FileText className="h-5 w-5 text-blue-500" />}
                          name="PDF"
                          description="Formato de documento portable"
                          selected={selectedFormat === "pdf"}
                          onClick={() => setSelectedFormat("pdf")}
                        />
                        <FormatOption
                          icon={<FileSpreadsheet className="h-5 w-5 text-green-500" />}
                          name="Excel"
                          description="Hoja de cálculo editable"
                          selected={selectedFormat === "excel"}
                          onClick={() => setSelectedFormat("excel")}
                        />
                        <FormatOption
                          icon={<Printer className="h-5 w-5 text-gray-500" />}
                          name="Impresión"
                          description="Versión para impresión directa"
                          selected={selectedFormat === "print"}
                          onClick={() => setSelectedFormat("print")}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Opciones Adicionales</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="includeCompanyHeader" 
                            checked={includeCompanyHeader} 
                            onCheckedChange={(checked) => setIncludeCompanyHeader(!!checked)}
                          />
                          <Label htmlFor="includeCompanyHeader">Incluir encabezado de empresa</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="includeDetails" 
                            checked={includeDetails} 
                            onCheckedChange={(checked) => setIncludeDetails(!!checked)}
                          />
                          <Label htmlFor="includeDetails">Incluir detalles de líneas</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="includeTotals" 
                            checked={includeTotals} 
                            onCheckedChange={(checked) => setIncludeTotals(!!checked)}
                          />
                          <Label htmlFor="includeTotals">Incluir totales</Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleExport} 
                      disabled={isExporting} 
                      className="w-full"
                    >
                      {isExporting ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Exportando...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Exportar {filteredDocuments.length} documentos
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="advanced" className="mt-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Exportación Avanzada</CardTitle>
                    <CardDescription>
                      Personaliza la exportación con opciones avanzadas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Diseño de Plantilla</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Card className={`cursor-pointer border-2 transition-all ${selectedTemplate === 'standard' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                          onClick={() => setSelectedTemplate('standard')}>
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-md">
                              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h4 className="font-medium">Estándar</h4>
                              <p className="text-xs text-muted-foreground">Diseño formal con todos los detalles</p>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className={`cursor-pointer border-2 transition-all ${selectedTemplate === 'compact' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                          onClick={() => setSelectedTemplate('compact')}>
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-md">
                              <Table className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <h4 className="font-medium">Formato Compacto</h4>
                              <p className="text-xs text-muted-foreground">Versión resumida y eficiente</p>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className={`cursor-pointer border-2 transition-all ${selectedTemplate === 'detailed' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                          onClick={() => setSelectedTemplate('detailed')}>
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-md">
                              <BookOpen className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                              <h4 className="font-medium">Detallado</h4>
                              <p className="text-xs text-muted-foreground">Con información extendida</p>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className={`cursor-pointer border-2 transition-all ${selectedTemplate === 'modern' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                          onClick={() => setSelectedTemplate('modern')}>
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-md">
                              <PenSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-medium">Moderno</h4>
                              <p className="text-xs text-muted-foreground">Diseño contemporáneo y estilizado</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Opciones Avanzadas</h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="watermarkText">Texto de Marca de Agua</Label>
                            <Input 
                              id="watermarkText"
                              placeholder="Ej: CONFIDENCIAL"
                              value={watermarkText}
                              onChange={(e) => setWatermarkText(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label>Incluir Información</Label>
                            <div className="space-y-2 mt-1">
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id="includeCustomerInfo" 
                                  checked={includeCustomerInfo} 
                                  onCheckedChange={(checked) => setIncludeCustomerInfo(!!checked)}
                                />
                                <Label htmlFor="includeCustomerInfo" className="text-sm">Información del cliente</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id="includeFooter" 
                                  checked={includeFooter} 
                                  onCheckedChange={(checked) => setIncludeFooter(!!checked)}
                                />
                                <Label htmlFor="includeFooter" className="text-sm">Pie de página con términos</Label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-auto"
                      onClick={() => {
                        toast.info("Vista previa generada. Abriendo en una nueva ventana...");
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Vista Previa
                    </Button>
                    <Button 
                      onClick={handleExport} 
                      disabled={isExporting} 
                      className="w-full sm:w-auto sm:flex-1"
                    >
                      {isExporting ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Exportando...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Exportar con Configuración Avanzada
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="batch" className="mt-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Exportación por Lotes</CardTitle>
                    <CardDescription>
                      Selecciona múltiples documentos para exportar juntos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="p-4 bg-muted/50 flex items-center justify-between">
                      <div className="flex items-center">
                        <Checkbox 
                          id="select-all" 
                          checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0} 
                          onCheckedChange={toggleSelectAll}
                        />
                        <Label htmlFor="select-all" className="ml-2">
                          Seleccionar todos ({filteredDocuments.length})
                        </Label>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedDocuments.length} seleccionados
                      </div>
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto">
                      <table className="w-full">
                        <thead className="sticky top-0 bg-background">
                          <tr className="border-b">
                            <th className="w-[40px] p-3"></th>
                            <th className="text-left p-3 text-sm font-medium">Número</th>
                            <th className="text-left p-3 text-sm font-medium">Tipo</th>
                            <th className="text-left p-3 text-sm font-medium">Cliente</th>
                            <th className="text-left p-3 text-sm font-medium">Fecha</th>
                            <th className="text-right p-3 text-sm font-medium">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDocuments.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-4 text-center text-muted-foreground text-sm">
                                No hay documentos que coincidan con los filtros aplicados
                              </td>
                            </tr>
                          ) : (
                            filteredDocuments.map((doc) => (
                              <tr 
                                key={doc.id} 
                                className={`border-b hover:bg-muted/30 cursor-pointer ${
                                  selectedDocuments.includes(doc.id) ? 'bg-primary/5' : ''
                                }`}
                                onClick={() => toggleDocumentSelection(doc.id)}
                              >
                                <td className="p-3">
                                  <Checkbox 
                                    checked={selectedDocuments.includes(doc.id)}
                                    onCheckedChange={() => toggleDocumentSelection(doc.id)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </td>
                                <td className="p-3 text-sm">{doc.number}</td>
                                <td className="p-3 text-sm">
                                  {doc.type === 'quote' ? 'Cotización' : 'Factura'}
                                </td>
                                <td className="p-3 text-sm">{doc.customer.name}</td>
                                <td className="p-3 text-sm">
                                  {format(new Date(doc.date), 'dd/MM/yyyy')}
                                </td>
                                <td className="p-3 text-sm text-right">
                                  ${doc.total.toFixed(2)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between mt-4">
                    <div className="flex items-center">
                      <Label className="mr-2 text-sm">Formato:</Label>
                      <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Formato" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="zip">ZIP (comprimido)</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleExport} 
                      disabled={isExporting || selectedDocuments.length === 0} 
                    >
                      {isExporting ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Exportando lote...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Exportar {selectedDocuments.length} documentos
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="reports" className="mt-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Generación de Reportes</CardTitle>
                    <CardDescription>
                      Crea reportes analíticos basados en tus documentos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium mb-3">Tipo de Reporte</h3>
                      <RadioGroup value={reportType} onValueChange={setReportType} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <RadioGroupItem value="summary" id="report-summary" className="peer sr-only" />
                          <Label
                            htmlFor="report-summary"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <BarChart className="mb-2 h-6 w-6" />
                            <div className="text-center">
                              <div className="font-medium">Resumen</div>
                              <div className="text-xs text-muted-foreground">
                                Visión general de documentos y montos
                              </div>
                            </div>
                          </Label>
                        </div>
                        
                        <div>
                          <RadioGroupItem value="detailed" id="report-detailed" className="peer sr-only" />
                          <Label
                            htmlFor="report-detailed"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <Table className="mb-2 h-6 w-6" />
                            <div className="text-center">
                              <div className="font-medium">Detallado</div>
                              <div className="text-xs text-muted-foreground">
                                Análisis completo con detalles
                              </div>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-3">Periodo de Reporte</h3>
                      <Select value={reportPeriod} onValueChange={setReportPeriod}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar periodo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Diario</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensual</SelectItem>
                          <SelectItem value="quarterly">Trimestral</SelectItem>
                          <SelectItem value="yearly">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Datos a Incluir</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="field-customer" 
                            checked={selectedDataFields.includes('customer')} 
                            onCheckedChange={() => toggleDataField('customer')}
                          />
                          <Label htmlFor="field-customer" className="text-sm">Información de cliente</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="field-date" 
                            checked={selectedDataFields.includes('date')} 
                            onCheckedChange={() => toggleDataField('date')}
                          />
                          <Label htmlFor="field-date" className="text-sm">Fechas</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="field-total" 
                            checked={selectedDataFields.includes('total')} 
                            onCheckedChange={() => toggleDataField('total')}
                          />
                          <Label htmlFor="field-total" className="text-sm">Totales</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="field-status" 
                            checked={selectedDataFields.includes('status')} 
                            onCheckedChange={() => toggleDataField('status')}
                          />
                          <Label htmlFor="field-status" className="text-sm">Estado</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="field-items" 
                            checked={selectedDataFields.includes('items')} 
                            onCheckedChange={() => toggleDataField('items')}
                          />
                          <Label htmlFor="field-items" className="text-sm">Líneas de items</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="field-taxes" 
                            checked={selectedDataFields.includes('taxes')} 
                            onCheckedChange={() => toggleDataField('taxes')}
                          />
                          <Label htmlFor="field-taxes" className="text-sm">Impuestos</Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row gap-3">
                    <Select defaultValue="pdf" className="w-full sm:w-[150px]">
                      <SelectTrigger>
                        <SelectValue placeholder="Formato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      onClick={handleExport} 
                      disabled={isExporting} 
                      className="w-full sm:flex-1"
                    >
                      {isExporting ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Generando reporte...
                        </>
                      ) : (
                        <>
                          <BarChart className="mr-2 h-4 w-4" />
                          Generar Reporte
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Tarjeta de envío por correo */}
                <Card className="mt-5">
                  <CardHeader>
                    <CardTitle className="text-base">Enviar por Correo</CardTitle>
                    <CardDescription>
                      Envía el reporte generado directamente por correo electrónico
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input id="email" type="email" placeholder="ejemplo@correo.com" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="schedule" />
                        <Label htmlFor="schedule">Programar envío periódico</Label>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar Reporte por Correo
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </>
  );
};

export default ExportPage;