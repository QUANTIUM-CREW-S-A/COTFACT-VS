import React, { useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useDocuments } from "@/context/document/document-context";
import DocumentHeader from "@/components/document-detail/DocumentHeader";
import DocumentActions from "@/components/document-detail/DocumentActions";
import DocumentContainer from "@/components/document-detail/DocumentContainer";

const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { documents, deleteDocument, approveQuote, convertToInvoice } = useDocuments();
  const documentRef = useRef<HTMLDivElement>(null);
  
  const document = documents.find(doc => doc.id === id);
  
  if (!document) {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Documento no encontrado</h1>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>
    );
  }

  const handleApprove = () => {
    approveQuote(document.id);
    navigate("/invoices");  // Navigate to invoices after approval since it auto-converts
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <DocumentHeader document={document} />
        
        <DocumentActions 
          document={document}
          documentRef={documentRef}
          onDelete={deleteDocument}
          onApprove={handleApprove}
          onConvert={convertToInvoice}
        />
      </div>
      
      <DocumentContainer 
        document={document}
        documentRef={documentRef}
      />
    </div>
  );
};

export default DocumentDetailPage;
