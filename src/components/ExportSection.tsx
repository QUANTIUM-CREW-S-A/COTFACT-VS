import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Download, ChevronRight, FileText, FileJson, FileSpreadsheet } from "lucide-react";
import DocumentExportDialog from "@/components/document-export/DocumentExportDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ExportSectionProps {
  className?: string;
  compact?: boolean;
  onExportComplete?: () => void;
}

/**
 * Sección para exportar documentos.
 * - Muestra un botón para abrir el diálogo de exportación.
 * - Adapta el diseño para móvil y escritorio.
 * - Ofrece vista compacta para integración en otros componentes
 */
const ExportSection: React.FC<ExportSectionProps> = ({ 
  className = "", 
  compact = false,
  onExportComplete 
}) => {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const isMobile = useIsMobile();
  
  const handleExport = () => {
    setShowExportDialog(true);
  };

  const handleExportComplete = () => {
    setIsExporting(false);
    if (onExportComplete) {
      onExportComplete();
    }
  };
  
  if (compact) {
    return (
      <div className={`${className}`}>
        <Button 
          variant="outline" 
          onClick={handleExport}
          className="w-full flex items-center justify-between group transition-all"
          disabled={isExporting}
        >
          <span className="flex items-center">
            <Download className="mr-2 h-4 w-4 text-primary" />
            Exportar
          </span>
          <ChevronRight className="h-4 w-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
        </Button>
        
        <DocumentExportDialog 
          open={showExportDialog} 
          onOpenChange={setShowExportDialog}
          onExportComplete={handleExportComplete}
          onExportStart={() => setIsExporting(true)}
        />
      </div>
    );
  }
  
  return (
    <div className={`${className} ${isMobile ? "mt-4" : "mb-4"}`}>
      <Card className="overflow-hidden border-border">
        <div className="p-4 pb-0">
          <h3 className="text-lg font-medium mb-1">Exportar documentos</h3>
          <p className="text-muted-foreground text-sm mb-3">
            Exporta tus cotizaciones y facturas en diferentes formatos
          </p>
        </div>
        
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2 mb-3">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
                      <FileText className="h-4 w-4" />
                      <span>PDF</span>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>Exportar en formato PDF</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>Excel</span>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>Exportar en formato Excel</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
                      <FileJson className="h-4 w-4" />
                      <span>JSON</span>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>Exportar en formato JSON</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <Button 
            onClick={handleExport}
            className="w-full bg-primary hover:bg-primary/90 text-white"
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exportando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exportar documentos
              </>
            )}
          </Button>
        </div>
      </Card>
      
      <DocumentExportDialog 
        open={showExportDialog} 
        onOpenChange={setShowExportDialog}
        onExportComplete={handleExportComplete}
        onExportStart={() => setIsExporting(true)} 
      />
    </div>
  );
};

export default ExportSection;
