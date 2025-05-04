
import React from 'react';
import { CompanyInfo } from '@/types';

interface CompanyInfoSectionProps {
  companyInfo: CompanyInfo;
}

const CompanyInfoSection: React.FC<CompanyInfoSectionProps> = ({ companyInfo }) => {
  return (
    <div className="flex flex-col gap-1 mb-6 text-sm">
      <div className="flex flex-wrap">
        <div className="w-20 font-bold">R.U.C:</div>
        <div>{companyInfo.ruc}</div>
        <div className="ml-2 font-bold">DV:</div>
        <div className="ml-1">{companyInfo.dv}</div>
      </div>
      <div className="flex">
        <div className="w-20 font-bold">Nombre:</div>
        <div>{companyInfo.contactName}</div>
      </div>
      <div className="flex">
        <div className="w-20 font-bold">Teléfono:</div>
        <div>{companyInfo.phone}</div>
      </div>
      <div className="flex">
        <div className="w-20 font-bold">Correo:</div>
        <div>{companyInfo.email}</div>
      </div>
      <div className="flex">
        <div className="w-20 font-bold">Dirección:</div>
        <div>{companyInfo.address}</div>
      </div>
    </div>
  );
};

export default CompanyInfoSection;
