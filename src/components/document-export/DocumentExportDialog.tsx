import React, { useState } from "react";
import { useDocuments } from "@/context/document/document-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Download, FileText, FileSpreadsheet, FileJson, FileOutput } from "lucide-react";
import { toast } from "sonner";
import { exportToPDF, exportToCSV, exportDocumentsAsPDF } from "@/utils/documentExport";
import { useIsMobile } from "@/hooks/use-mobile";
import ExportFilters from "./ExportFilters";
import ExportOptions from "./ExportOptions";
import FilterSummary from "./FilterSummary";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface DocumentExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExportStart?: () => void;
  onExportComplete?: () => void;
}

const DocumentExportDialog: React.FC<DocumentExportDialogProps> = ({ 
  open, 
  onOpenChange,
  onExportStart,
  onExportComplete
}) => {
  const { documents } = useDocuments();
  const [documentType, setDocumentType] = useState<"all" | "quote" | "invoice">("all");
  const [documentStatus, setDocumentStatus] = useState<"all" | "approved" | "pending" | "draft">("all");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("filters");
  const isMobile = useIsMobile();

  // Filter documents based on selected criteria
  const filteredDocuments = documents.filter((doc) => {
    // Filter by document type
    if (documentType !== "all" && doc.type !== documentType) {
      return false;
    }

    // Filter by document status
    if (documentStatus !== "all" && doc.status !== documentStatus) {
      return false;
    }

    // Filter by date range if set
    if (dateRange.from || dateRange.to) {
      const docDate = new Date(doc.date);
      
      if (dateRange.from && docDate < dateRange.from) {
        return false;
      }
      
      if (dateRange.to) {
        const endDate = new Date(dateRange.to);
        endDate.setHours(23, 59, 59, 999);
        if (docDate > endDate) {
          return false;
        }
      }
    }

    return true;
  });

  // Common export handling function
  const handleExport = async (exportFunction: Function, formatName: string) => {
    if (onExportStart) onExportStart();
    setExporting(true);
    
    try {
      await exportFunction(filteredDocuments);
      toast.success(`${filteredDocuments.length} documentos exportados a ${formatName} exitosamente`);
      onOpenChange(false);
    } catch (error) {
      console.error(`Error al exportar a ${formatName}:`, error);
      toast.error(`Error al exportar a ${formatName}`);
    } finally {
      setExporting(false);
      if (onExportComplete) onExportComplete();
    }
  };

  // Export document designs as PDF
  const handleExportDocumentDesigns = () => {
    // Confirm with the user if they're exporting a lot of documents
    if (filteredDocuments.length > 10) {
      const proceed = window.confirm(
        `Estás a punto de exportar ${filteredDocuments.length} documentos completos. Este proceso puede tardar varios minutos. ¿Deseas continuar?`
      );
      if (!proceed) return;
    }
    
    handleExport(exportDocumentsAsPDF, "PDF (documentos completos)");
  };

  // Export to PDF
  const handleExportToPDF = () => handleExport(exportToPDF, "PDF");

  // Export to CSV
  const handleExportToCSV = () => handleExport(exportToCSV, "CSV");

  // Export to JSON
  const handleExportToJSON = () => {
    handleExport((docs) => {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(docs, null, 2)
      )}`;
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = "documentos_exportados.json";
      link.click();
    }, "JSON");
  };

  // Function to reset all filters
  const resetFilters = () => {
    setDocumentType("all");
    setDocumentStatus("all");
    setDateRange({ from: undefined, to: undefined });
  };

  // Check if any filters are active
  const hasActiveFilters = documentType !== "all" || documentStatus !== "all" || Boolean(dateRange.from) || Boolean(dateRange.to);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!exporting) {
        onOpenChange(isOpen);
      }
    }}>
      <DialogContent className={`${isMobile ? 'max-w-[95vw] p-4 rounded-lg' : 'max-w-2xl'} overflow-hidden`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 mb-1">
            <Download className="h-5 w-5 text-primary" />
            <span className="text-foreground">
              Exportar Documentos
            </span>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Filtra y exporta tus documentos en diferentes formatos
          </DialogDescription>
        </DialogHeader>
        
        <Tabs 
          defaultValue="filters" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className={`w-full ${isMobile ? 'mt-2' : 'mt-3'}`}
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="filters" className="text-sm">
              Filtros
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-5 px-1">
                  {documentType !== "all" && documentStatus !== "all" ? "2" : "1"}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-sm">
              Vista previa
            </TabsTrigger>
            <TabsTrigger value="export" className="text-sm">
              Exportar
            </TabsTrigger>
          </TabsList>

          <div className={`space-y-4 ${isMobile ? 'max-h-[60vh] overflow-y-auto pr-1' : ''}`}>
            <TabsContent value="filters" className="m-0">
              <ExportFilters 
                documentType={documentType}
                setDocumentType={setDocumentType}
                documentStatus={documentStatus}
                setDocumentStatus={setDocumentStatus}
                dateRange={dateRange}
                setDateRange={setDateRange}
                resetFilters={resetFilters}
              />
              
              <FilterSummary 
                filteredCount={filteredDocuments.length}
                hasActiveFilters={hasActiveFilters}
                onResetFilters={resetFilters}
                isMobile={isMobile}
                className="mt-4"
              />
              
              <div className="flex justify-end mt-4">
                <Button 
                  variant="default" 
                  onClick={() => setActiveTab("preview")}
                  disabled={filteredDocuments.length === 0}
                >
                  Continuar
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="m-0">
              <div className="border rounded-md p-3 min-h-[150px] bg-muted/30">
                {filteredDocuments.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Vista previa de documentos ({filteredDocuments.length})</h4>
                    <div className="max-h-[200px] overflow-y-auto pr-1">
                      {filteredDocuments.slice(0, 5).map((doc, index) => (
                        <div key={index} className="text-xs bg-background p-2 rounded-md mb-2 border flex justify-between">
                          <div>
                            <span className="font-medium">{doc.title || doc.documentNumber || doc.id}</span>
                            <span className="text-muted-foreground ml-2">{new Date(doc.date).toLocaleDateString()}</span>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                            doc.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                            doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 
                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                          }`}>
                            {doc.status === 'approved' ? 'Aprobado' : 
                             doc.status === 'pending' ? 'Pendiente' : 'Borrador'}
                          </span>
                        </div>
                      ))}
                      {filteredDocuments.length > 5 && (
                        <div className="text-xs text-center text-muted-foreground mt-2">
                          Y {filteredDocuments.length - 5} más...
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
                    <p>No hay documentos que coincidan con los filtros seleccionados</p>
                    <Button 
                      variant="link" 
                      size="sm"
                      onClick={resetFilters}
                      className="mt-2"
                    >
                      Restablecer filtros
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("filters")}
                >
                  Volver
                </Button>
                <Button 
                  variant="default" 
                  onClick={() => setActiveTab("export")}
                  disabled={filteredDocuments.length === 0}
                >
                  Continuar
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="export" className="m-0">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Selecciona el formato de exportación</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleExportDocumentDesigns}
                    disabled={exporting || filteredDocuments.length === 0}
                    className="flex flex-col items-center justify-center h-24 hover:bg-accent hover:text-accent-foreground transition-all"
                  >
                    <FileOutput className="h-8 w-8 mb-2 text-blue-600" />
                    <span className="font-medium">Documentos Completos</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleExportToPDF}
                    disabled={exporting || filteredDocuments.length === 0}
                    className="flex flex-col items-center justify-center h-24 hover:bg-accent hover:text-accent-foreground transition-all"
                  >
                    <FileText className="h-8 w-8 mb-2 text-primary" />
                    <span className="font-medium">PDF</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleExportToCSV}
                    disabled={exporting || filteredDocuments.length === 0}
                    className="flex flex-col items-center justify-center h-24 hover:bg-accent hover:text-accent-foreground transition-all"
                  >
                    <FileSpreadsheet className="h-8 w-8 mb-2 text-green-600" />
                    <span className="font-medium">CSV / Excel</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleExportToJSON}
                    disabled={exporting || filteredDocuments.length === 0}
                    className="flex flex-col items-center justify-center h-24 hover:bg-accent hover:text-accent-foreground transition-all"
                  >
                    <FileJson className="h-8 w-8 mb-2 text-amber-600" />
                    <span className="font-medium">JSON</span>
                  </Button>
                </div>
                
                <ExportOptions 
                  onExportToPDF={handleExportToPDF}
                  onExportToCSV={handleExportToCSV}
                  onExportToJSON={handleExportToJSON}
                  onExportDocumentDesigns={handleExportDocumentDesigns}
                  exporting={exporting}
                  hasDocuments={filteredDocuments.length > 0}
                  className="mt-4"
                />
              </div>
              
              <div className="flex justify-between mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("preview")}
                >
                  Volver
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentExportDialog;
