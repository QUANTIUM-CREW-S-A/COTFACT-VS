
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Eye, Edit, Trash2, ThumbsUp, FileCheck, Download
} from "lucide-react";
import { Document } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { toast } from "sonner";

interface ListActionsProps {
  document: Document;
  type: "quote" | "invoice";
  onDelete: (id: string) => void;
  onApprove?: (id: string) => void;
  onConvert?: (id: string) => void;
  isMobile?: boolean;
}

const ListActions: React.FC<ListActionsProps> = ({ 
  document, 
  type, 
  onDelete, 
  onApprove, 
  onConvert,
  isMobile = false 
}) => {
  const navigate = useNavigate();

  const handleDownloadPDF = (doc: Document) => {
    // Redirect to document detail page which has the proper rendering for PDF
    navigate(`/document/${doc.id}`);
    // Show message to the user
    toast.info("Abra el documento para descargarlo como PDF con el formato correcto");
  };

  if (isMobile) {
    return (
      <div className="grid grid-cols-5 border-t">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-10 rounded-none border-r"
          onClick={() => navigate(`/document/${document.id}`)}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-10 rounded-none border-r"
          onClick={() => navigate(`/edit/${document.id}`)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-10 rounded-none border-r"
          onClick={() => handleDownloadPDF(document)}
        >
          <Download className="h-4 w-4" />
        </Button>
        {type === "quote" && document.status === "pending" && onApprove && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-10 rounded-none border-r"
            onClick={() => onApprove(document.id)}
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
        )}
        {type === "quote" && document.status === "approved" && onConvert && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-10 rounded-none border-r"
            onClick={() => onConvert(document.id)}
          >
            <FileCheck className="h-4 w-4" />
          </Button>
        )}
        {(type !== "quote" || (document.status !== "pending" && document.status !== "approved")) && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-10 rounded-none border-r invisible"
          >
            <div className="h-4 w-4" />
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="sm"
          className="h-10 rounded-none text-red-600" 
          onClick={() => onDelete(document.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate(`/document/${document.id}`)}>
          <Eye className="mr-2 h-4 w-4" />
          Ver
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(`/edit/${document.id}`)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownloadPDF(document)}>
          <Download className="mr-2 h-4 w-4" />
          Descargar PDF
        </DropdownMenuItem>
        {type === "quote" && document.status === "pending" && onApprove && (
          <DropdownMenuItem onClick={() => onApprove(document.id)}>
            <ThumbsUp className="mr-2 h-4 w-4" />
            Aprobar
          </DropdownMenuItem>
        )}
        {type === "quote" && document.status === "approved" && onConvert && (
          <DropdownMenuItem onClick={() => onConvert(document.id)}>
            <FileCheck className="mr-2 h-4 w-4" />
            Convertir a Factura
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          className="text-red-600" 
          onClick={() => onDelete(document.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ListActions;
