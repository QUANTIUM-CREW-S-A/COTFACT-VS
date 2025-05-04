
import React from 'react';
import { Smartphone } from 'lucide-react';

interface YappyPaymentMethodProps {
  phone: string;
  logo?: string;
}

const YappyPaymentMethod: React.FC<YappyPaymentMethodProps> = ({ phone, logo }) => {
  return (
    <div className="text-sm mt-2 border-t pt-2">
      <div className="flex items-center gap-2">
        {logo ? (
          <img src={logo} alt="Yappy Logo" className="h-5 w-5 object-contain" />
        ) : (
          <Smartphone className="h-4 w-4" />
        )}
        <p className="font-bold">Yappy</p>
      </div>
      <div className="ml-6">
        <span>{phone}</span>
      </div>
    </div>
  );
};

export default YappyPaymentMethod;
