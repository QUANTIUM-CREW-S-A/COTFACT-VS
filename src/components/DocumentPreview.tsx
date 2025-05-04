import React, { forwardRef } from "react";
import { useDocuments } from "@/context/document/document-context";
import { Document } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import DocumentHeader from "./document-preview/DocumentHeader";
import CompanyInfoSection from "./document-preview/CompanyInfoSection";
import CustomerInfoSection from "./document-preview/CustomerInfoSection";
import ValiditySection from "./document-preview/ValiditySection";
import ItemsTable from "./document-preview/ItemsTable";
import PaymentMethodsSection from "./document-preview/PaymentMethodsSection";
import TermsAndConditionsSection from "./document-preview/TermsAndConditionsSection";
import SignatureSection from "./document-preview/SignatureSection";

interface DocumentPreviewProps {
  document: Document;
}

const DocumentPreview = forwardRef<HTMLDivElement, DocumentPreviewProps>(
  ({ document }, ref) => {
    const { companyInfo, templatePreferences } = useDocuments();
    const isMobile = useIsMobile();
    
    const formattedDate = new Date(document.date).toLocaleDateString('es-PA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const getFontFamily = () => {
      switch (templatePreferences.fontFamily) {
        case "times": return "font-serif";
        case "georgia": return "font-serif";
        case "calibri": return "font-sans";
        default: return "font-sans"; // Arial or default
      }
    };

    const getThemeColor = () => {
      switch (templatePreferences.colorTheme) {
        case "teal": return "text-teal-700";
        case "purple": return "text-purple-700";
        case "red": return "text-red-700";
        case "orange": return "text-orange-700";
        default: return "text-viangblue"; // Blue or default
      }
    };

    // Use template terms and conditions if they exist, otherwise use document terms
    const termsToDisplay = templatePreferences.termsAndConditions?.length 
      ? templatePreferences.termsAndConditions 
      : document.termsAndConditions;

    return (
      <div className="bg-white shadow rounded-lg relative">
        <div 
          id="pdf-preview" 
          className={`pdf-preview ${getFontFamily()} max-w-[210mm] mx-auto p-6 overflow-visible relative`}
          ref={ref}
        >
          {/* Logo Watermark */}
          {companyInfo.logo && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <img 
                src={companyInfo.logo} 
                alt="Watermark" 
                className="w-2/3 opacity-[0.03] object-contain"
              />
            </div>
          )}

          {document.status !== "approved" && document.type === "quote" && templatePreferences.showWatermark && (
            <div className={`watermark ${getThemeColor()}`}>COTIZACIÓN</div>
          )}
          
          <DocumentHeader 
            document={document} 
            companyInfo={companyInfo}
            formattedDate={formattedDate}
            themeColor={getThemeColor()}
            templatePreferences={templatePreferences}
          />
          
          {!templatePreferences.useTriangleDesign && (
            <CompanyInfoSection companyInfo={companyInfo} />
          )}
          
          <CustomerInfoSection 
            customer={document.customer} 
            themeColor={getThemeColor()} 
          />
          
          {document.type === "quote" && (
            <ValiditySection 
              validDays={document.validDays} 
              themeColor={getThemeColor()} 
            />
          )}
          
          <ItemsTable 
            items={document.items} 
            themeColor={getThemeColor()} 
          />
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <PaymentMethodsSection 
              paymentMethods={document.paymentMethods} 
              themeColor={getThemeColor()} 
              companyInfo={companyInfo}
            />
            
            <div className="w-full md:w-1/2 flex flex-col items-end">
              <div className="w-40">
                <div className="flex justify-between border-b pb-1 text-sm">
                  <span className="font-bold">SUBTOTAL</span>
                  <span>${document.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b py-1 text-sm">
                  <span className="font-bold">ITBMS 7%</span>
                  <span>${document.tax.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between py-1 font-bold ${getThemeColor()} text-sm`}>
                  <span>TOTAL</span>
                  <span>${document.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <TermsAndConditionsSection 
            terms={termsToDisplay} 
            themeColor={getThemeColor()} 
          />
          
          {templatePreferences.showSignature && (
            <SignatureSection />
          )}
        </div>
        
        <style dangerouslySetInnerHTML={{ __html: `
          @page {
            size: A4;
            margin: 0;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
            }
            .pdf-preview {
              width: 210mm;
              height: auto;
              min-height: 297mm;
              padding: 15mm !important;
              margin: 0 !important;
              max-width: none !important;
              transform: scale(1) !important;
              font-size: 12px !important;
              overflow: visible !important;
            }
            
            table {
              page-break-inside: avoid;
              width: 100% !important;
            }
            
            tr, td, th {
              page-break-inside: avoid;
            }
          }
          
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            opacity: 0.1;
            font-weight: bold;
            z-index: 10;
            pointer-events: none;
          }
          
          @media (max-width: 768px) {
            .pdf-preview {
              padding: 8px;
              font-size: 12px !important;
            }
          }
          
          /* Ensure watermark prints correctly */
          .pdf-preview img.opacity-[0.03] {
            opacity: 0.03 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        `}} />
      </div>
    );
  }
);

DocumentPreview.displayName = "DocumentPreview";

export default DocumentPreview;
