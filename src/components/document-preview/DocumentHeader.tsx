
import React from 'react';
import { Document, CompanyInfo, TemplatePreferences } from '@/types';

interface DocumentHeaderProps {
  document: Document;
  companyInfo: CompanyInfo;
  formattedDate: string;
  themeColor: string;
  templatePreferences: TemplatePreferences;
}

const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  document,
  companyInfo,
  formattedDate,
  themeColor,
  templatePreferences
}) => {
  const TriangleDesignHeader = () => (
    <div className="relative h-32 mb-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-600"></div>
      <div className="absolute top-0 left-0 h-full w-1/2">
        <div className="absolute top-0 left-0 border-t-[80px] border-l-[200px] border-t-blue-400 border-l-transparent"></div>
        <div className="absolute bottom-0 left-0 w-36 h-32">
          <div className="absolute bottom-0 left-0 w-full h-full bg-blue-400 transform -skew-x-[30deg] origin-bottom-right"></div>
        </div>
      </div>
      <div className="absolute top-0 right-0 pt-4 pr-6 text-white text-right">
        <h1 className="text-3xl font-bold mb-1">
          {document.type === "quote" ? "COTIZACIÓN" : "FACTURA"}
        </h1>
        <p>{document.documentNumber}</p>
        <p>Panamá, {formattedDate}</p>
      </div>
    </div>
  );

  if (templatePreferences.useTriangleDesign) {
    return <TriangleDesignHeader />;
  }
  
  switch (templatePreferences.headerLayout) {
    case "centered":
      return (
        <div className="flex flex-col items-center text-center mb-8">
          <img 
            src={companyInfo.logo} 
            alt={companyInfo.name} 
            className="h-16 w-auto mb-2"
          />
          <h1 className="text-2xl font-bold mt-4">
            {document.type === "quote" ? "COTIZACIÓN" : "FACTURA"}
          </h1>
          <p>Panamá, {formattedDate}</p>
        </div>
      );
    case "minimal":
      return (
        <div className="mb-8">
          <div className={`text-center ${themeColor} border-b-2 pb-2 mb-4`}>
            <img 
              src={companyInfo.logo} 
              alt={companyInfo.name} 
              className="h-12 w-auto mx-auto mb-2"
            />
          </div>
          <div className="flex justify-between">
            <p>Panamá, {formattedDate}</p>
            <h1 className="text-xl font-bold">
              {document.type === "quote" ? "COTIZACIÓN" : "FACTURA"}
            </h1>
          </div>
        </div>
      );
    case "modern":
      return (
        <div className={`${themeColor} bg-gray-50 p-4 rounded-lg mb-8`}>
          <div className="flex justify-between items-center">
            <img 
              src={companyInfo.logo} 
              alt={companyInfo.name} 
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold">
                {document.type === "quote" ? "COTIZACIÓN" : "FACTURA"}
              </h1>
              <p className="text-sm">{document.documentNumber}</p>
              <p className="text-sm">{formattedDate}</p>
            </div>
          </div>
        </div>
      );
    default: // default layout
      return (
        <div className="flex justify-between mb-8">
          <div className="flex items-center gap-3">
            <img 
              src={companyInfo.logo} 
              alt={companyInfo.name} 
              className="h-16 w-auto"
            />
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold mb-4">
              {document.type === "quote" ? "COTIZACIÓN" : "FACTURA"}
            </h1>
            <p>Panamá, {formattedDate}</p>
          </div>
        </div>
      );
  }
};

export default DocumentHeader;
