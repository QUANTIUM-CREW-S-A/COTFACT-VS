
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FileCheck,
  FileEdit,
  FilePlus2,
  FileX2,
  MoreVertical,
  ArrowLeft,
  Printer,
  Download,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { exportDocumentAsPDF, toggleLetterPreview } from "@/utils/pdfExport";
import { Document } from "@/types";
import { toast } from "sonner";

interface DocumentActionsProps {
  document: Document;
  documentRef: React.RefObject<HTMLDivElement>;
  onDelete: (id: string) => void;
  onApprove: () => void;
  onConvert: (id: string) => void;
}

const DocumentActions: React.FC<DocumentActionsProps> = ({
  document,
  documentRef,
  onDelete,
  onApprove,
  onConvert,
}) => {
  const navigate = useNavigate();
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  
  const handleGoBack = () => {
    navigate(-1);
  };

  const handleDelete = () => {
    onDelete(document.id);
    navigate(`/${document.type === "quote" ? "quotes" : "invoices"}`);
    toast.success(`${document.type === "quote" ? "Cotización" : "Factura"} eliminada`);
  };

  const handleExportPDF = async () => {
    await exportDocumentAsPDF(document, documentRef);
  };
  
  const handleTogglePreview = () => {
    const isPreviewMode = toggleLetterPreview(documentRef);
    toast.info(isPreviewMode 
      ? "Vista previa de impresión activada" 
      : "Vista normal restaurada"
    );
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleGoBack}
        className="hidden sm:flex"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleTogglePreview} 
        className="hidden sm:flex"
      >
        <Eye className="mr-2 h-4 w-4" />
        Vista previa
      </Button>
      
      <Button 
        size="sm"
        onClick={handleExportPDF}
        className="hidden sm:flex"
      >
        <Download className="mr-2 h-4 w-4" />
        Exportar PDF
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleGoBack} className="sm:hidden">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleTogglePreview} className="sm:hidden">
            <Eye className="mr-2 h-4 w-4" />
            Vista previa
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleExportPDF} className="sm:hidden">
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="sm:hidden" />
          
          {document.type === "quote" && document.status !== "approved" && (
            <DropdownMenuItem onClick={onApprove}>
              <FileCheck className="mr-2 h-4 w-4" />
              Aprobar y convertir
            </DropdownMenuItem>
          )}
          
          {document.type === "quote" && (
            <DropdownMenuItem onClick={() => onConvert(document.id)}>
              <FilePlus2 className="mr-2 h-4 w-4" />
              Convertir a factura
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={() => navigate(`/edit/${document.id}`)}>
            <FileEdit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setOpenDeleteConfirm(true)}
            className="text-destructive focus:text-destructive"
          >
            <FileX2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <AlertDialog open={openDeleteConfirm} onOpenChange={setOpenDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              {document.type === "quote" ? " la cotización " : " la factura "}
              <span className="font-semibold">{document.documentNumber}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DocumentActions;
