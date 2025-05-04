
import React from 'react';
import { Customer } from '@/types';
import { User, Building } from 'lucide-react';

interface CustomerInfoSectionProps {
  customer: Customer;
  themeColor: string;
}

const CustomerInfoSection: React.FC<CustomerInfoSectionProps> = ({ customer, themeColor }) => {
  return (
    <div className="border-t border-b py-4 mb-6">
      <div className="flex items-center mb-2">
        <div className={`flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 ${themeColor} mr-2`}>
          {customer.type === "person" ? 
            <User className="h-4 w-4" /> : 
            <Building className="h-4 w-4" />
          }
        </div>
        <div className="font-bold text-base">
          {customer.type === "person" ? "Persona Natural" : "Empresa"}
        </div>
      </div>
      
      <div className="flex flex-col gap-1 text-sm">
        <div className="flex flex-wrap">
          <div className="w-28 font-bold">
            {customer.type === "person" ? "Nombre:" : "Contacto:"}
          </div>
          <div>{customer.name}</div>
        </div>
        <div className="flex flex-wrap">
          <div className="w-28 font-bold">
            {customer.type === "person" ? "Ocupación:" : "Empresa:"}
          </div>
          <div>{customer.company}</div>
        </div>
        <div className="flex flex-wrap">
          <div className="w-28 font-bold">Ubicación:</div>
          <div>{customer.location}</div>
        </div>
        <div className="flex flex-wrap">
          <div className="w-28 font-bold">Teléfono:</div>
          <div>{customer.phone}</div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoSection;
