
import React from "react";
import { useParams } from "react-router-dom";
import DocumentForm from "@/components/DocumentForm";
import { useIsMobile } from "@/hooks/use-mobile";

const CreateDocumentPage: React.FC = () => {
  const { type, id } = useParams<{ type?: string; id?: string }>();
  const isMobile = useIsMobile();
  
  const documentType = type === "invoice" ? "invoice" : "quote";
  
  return (
    <div className={`${isMobile ? "px-0 pb-20 mt-16" : "container mx-auto py-6"}`}>
      <DocumentForm type={documentType} editId={id} />
    </div>
  );
};

export default CreateDocumentPage;
