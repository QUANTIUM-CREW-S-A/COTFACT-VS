
import React from "react";
import { Card } from "@/components/ui/card";
import DocumentPreview from "@/components/DocumentPreview";
import { Document } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface DocumentContainerProps {
  document: Document;
  documentRef: React.RefObject<HTMLDivElement>;
}

const DocumentContainer: React.FC<DocumentContainerProps> = ({ document, documentRef }) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className="rounded-md shadow-lg overflow-hidden">
      <div className={`${isMobile ? 'p-2' : 'p-4 md:p-8'} bg-white`}>
        <DocumentPreview document={document} ref={documentRef} />
      </div>
      
      {/* Add styles for PDF export and responsive viewing */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* PDF export specific styles */
        .pdf-exporting {
          width: 8.5in !important;
          min-height: 11in !important;
          padding: 0.5in !important;
          margin: 0 !important;
          font-size: 12pt !important;
          line-height: 1.4 !important;
          box-sizing: border-box !important;
          background-color: white !important;
          box-shadow: none !important;
          overflow: hidden !important;
          position: absolute !important;
          left: -9999px !important;
          top: 0 !important;
        }

        .pdf-exporting table {
          width: 100% !important;
          table-layout: fixed !important;
          font-size: 10pt !important;
        }

        .pdf-exporting img {
          max-height: 1.5in !important;
        }
        
        .pdf-exporting .watermark {
          opacity: 0.08 !important;
          font-size: 60pt !important;
        }
        
        /* Preview mode for mobile */
        .letter-preview-container {
          margin: 1rem auto;
          max-width: 100%;
          overflow: hidden;
          background: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          position: relative;
        }
        
        /* Letter size preview with proper aspect ratio */
        .letter-preview {
          width: 100%;
          padding-top: 129.4%; /* 11/8.5 = 1.294 -> maintains letter size aspect ratio */
          position: relative;
          border: 1px solid #e5e7eb;
        }
        
        .letter-preview-content {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: auto;
          padding: 0.5in;
          transform-origin: top left;
          font-size: 12pt;
          line-height: 1.4;
        }
        
        /* Improved mobile styles */
        @media (max-width: 767px) {
          .letter-preview-content {
            padding: 0.25in;
            font-size: 10pt;
          }
          
          .letter-preview-content table {
            font-size: 9pt;
          }
          
          .letter-preview-content h1, 
          .letter-preview-content h2 {
            font-size: 1.1rem;
          }
          
          .letter-preview-content .document-header {
            flex-direction: column !important;
          }
        }
        
        @media (min-width: 768px) {
          .letter-preview-container {
            max-width: 8.5in;
          }
        }
        
        /* Improved table responsiveness */
        @media (max-width: 767px) {
          table.items-table {
            font-size: 0.7rem;
          }
          
          table.items-table th,
          table.items-table td {
            padding: 0.3rem !important;
          }
        }
      `}} />
    </Card>
  );
};

export default DocumentContainer;
