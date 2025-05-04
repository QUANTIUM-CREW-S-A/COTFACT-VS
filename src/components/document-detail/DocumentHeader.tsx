
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Document } from "@/types";

interface DocumentHeaderProps {
  document: Document;
}

const DocumentHeader: React.FC<DocumentHeaderProps> = ({ document }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>
      <h1 className="text-2xl font-bold">
        {document.type === "quote" ? "Cotización" : "Factura"}: {document.documentNumber}
      </h1>
    </div>
  );
};

export default DocumentHeader;
