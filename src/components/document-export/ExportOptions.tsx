import React from "react";
import { FileIcon, FileText, FileSpreadsheet, FileJson, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ExportOptionsProps {
  onExportToPDF: () => void;
  onExportToCSV: () => void;
  onExportToJSON?: () => void;
  exporting: boolean;
  hasDocuments: boolean;
  className?: string;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({
  onExportToPDF,
  onExportToCSV,
  onExportToJSON,
  exporting,
  hasDocuments,
  className,
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn(`grid grid-cols-1 ${isMobile ? 'gap-3' : 'md:grid-cols-3 gap-4'}`, className)}>
      <ExportCard 
        title="PDF"
        description="Formato compatible con impresión"
        icon={<FileIcon className="h-10 w-10 text-primary mb-2" />}
        buttonText={exporting ? "Exportando..." : "Descargar PDF"}
        buttonAction={onExportToPDF}
        disabled={exporting || !hasDocuments}
        colorScheme="primary"
        isMobile={isMobile}
      />
      
      <ExportCard 
        title="CSV / Excel"
        description="Para hojas de cálculo"
        icon={<FileSpreadsheet className="h-10 w-10 text-green-600 mb-2" />}
        buttonText={exporting ? "Exportando..." : "Descargar CSV"}
        buttonAction={onExportToCSV}
        disabled={exporting || !hasDocuments}
        colorScheme="green"
        isMobile={isMobile}
      />

      {onExportToJSON && (
        <ExportCard 
          title="JSON"
          description="Para integración con sistemas"
          icon={<FileJson className="h-10 w-10 text-amber-600 mb-2" />}
          buttonText={exporting ? "Exportando..." : "Descargar JSON"}
          buttonAction={onExportToJSON}
          disabled={exporting || !hasDocuments}
          colorScheme="amber"
          isMobile={isMobile}
        />
      )}
    </div>
  );
};

interface ExportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  buttonAction: () => void;
  disabled: boolean;
  colorScheme: "primary" | "green" | "amber";
  isMobile: boolean;
}

const ExportCard: React.FC<ExportCardProps> = ({
  title,
  description,
  icon,
  buttonText,
  buttonAction,
  disabled,
  colorScheme,
  isMobile
}) => {
  const colorStyles = {
    primary: {
      gradient: "bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/20 dark:to-primary/5",
      border: "border-primary/20 dark:border-primary/30",
      button: "bg-primary hover:bg-primary/90 text-primary-foreground",
      icon: "text-primary"
    },
    green: {
      gradient: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20",
      border: "border-green-200 dark:border-green-800/60",
      button: "bg-green-600 hover:bg-green-700 text-white",
      icon: "text-green-600"
    },
    amber: {
      gradient: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20",
      border: "border-amber-200 dark:border-amber-800/60",
      button: "bg-amber-600 hover:bg-amber-700 text-white",
      icon: "text-amber-600"
    }
  };

  return (
    <Card className={`${colorStyles[colorScheme].gradient} border ${colorStyles[colorScheme].border} hover:shadow transition-all`}>
      <CardContent className={`${isMobile ? 'p-4 flex items-center' : 'pt-6'}`}>
        <div className={`${isMobile ? 'flex items-center w-full' : 'flex flex-col items-center text-center'}`}>
          {isMobile ? (
            <div className="flex-shrink-0 mr-4">
              {icon}
            </div>
          ) : (
            icon
          )}
          
          <div className={`${isMobile ? 'flex-grow' : ''}`}>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className={`text-sm text-muted-foreground ${isMobile ? 'mb-0' : 'mb-4'}`}>
              {description}
            </p>
          </div>
          
          <Button 
            onClick={buttonAction} 
            disabled={disabled}
            className={`${isMobile ? 'ml-2 flex-shrink-0' : 'w-full mt-3'} ${colorStyles[colorScheme].button}`}
            size={isMobile ? "sm" : "default"}
          >
            {exporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isMobile ? "" : "Exportando..."}
              </>
            ) : (
              <>
                <Download className={`${isMobile ? 'h-4 w-4' : 'mr-2 h-4 w-4'}`} />
                {isMobile ? "" : buttonText}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportOptions;
