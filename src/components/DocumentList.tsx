import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDocuments } from "@/hooks/use-documents-context";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileDocumentList from "./document-list/MobileDocumentList";
import DesktopDocumentList from "./document-list/DesktopDocumentList";

/*
 * Lista de documentos (cotizaciones o facturas).
 * - Filtra y muestra los documentos según el tipo (cotización o factura).
 * - Adapta la visualización para móvil y escritorio.
 * - Permite eliminar, aprobar o convertir documentos según el contexto.
 */

interface DocumentListProps {
  type: "quote" | "invoice";
}

const DocumentList: React.FC<DocumentListProps> = ({ type }) => {
  const { documents, deleteDocument, approveQuote, convertToInvoice } = useDocuments();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Memoizar el filtrado de documentos para mejorar el rendimiento
  const filteredDocuments = useMemo(() => {
    return documents
      .filter(doc => doc.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [documents, type]);

  const handleDeleteDocument = async (id: string) => {
    await deleteDocument(id);
  };

  const handleApproveQuote = async (id: string) => {
    await approveQuote(id);
    navigate("/invoices");
  };

  const handleConvertToInvoice = async (id: string) => {
    await convertToInvoice(id);
    navigate("/invoices");
  };

  return (
    <div className="w-full">
      {isMobile ? (
        <MobileDocumentList 
          documents={filteredDocuments} 
          type={type} 
          onDelete={handleDeleteDocument}
          onApprove={type === "quote" ? handleApproveQuote : undefined}
          onConvert={type === "quote" ? handleConvertToInvoice : undefined}
        />
      ) : (
        <DesktopDocumentList 
          documents={filteredDocuments} 
          type={type} 
          onDelete={handleDeleteDocument}
          onApprove={type === "quote" ? handleApproveQuote : undefined}
          onConvert={type === "quote" ? handleConvertToInvoice : undefined}
        />
      )}
    </div>
  );
};

export default DocumentList;
