
import React from 'react';
import { PaymentMethod, CompanyInfo } from '@/types';
import { Banknote } from 'lucide-react';
import YappyPaymentMethod from './YappyPaymentMethod';

interface PaymentMethodsSectionProps {
  paymentMethods: PaymentMethod[];
  themeColor: string;
  companyInfo: CompanyInfo;
}

const PaymentMethodsSection: React.FC<PaymentMethodsSectionProps> = ({ 
  paymentMethods, 
  themeColor,
  companyInfo 
}) => {
  const hasPaymentMethods = paymentMethods && paymentMethods.length > 0;
  const yappyMethod = paymentMethods?.find(method => method.isYappy);
  
  return (
    <div className="w-full md:w-1/2">
      <h3 className={`font-bold border-b pb-1 mb-2 ${themeColor} text-sm`}>MÉTODOS DE PAGO:</h3>
      
      {!hasPaymentMethods ? (
        <p className="text-sm text-gray-500">No hay métodos de pago configurados.</p>
      ) : (
        <div className="space-y-3">
          {paymentMethods.filter(method => !method.isYappy).map((method, index) => (
            <div key={method.id || `payment-method-${index}`} className="text-sm">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                <p className="font-bold">{method.bank}</p>
              </div>
              <div className="ml-6">
                <p>Nombre: {method.accountHolder}</p>
                <p>Cuenta: {method.accountNumber}</p>
                <p>Tipo De Cuenta: {method.accountType}</p>
              </div>
            </div>
          ))}
          
          {/* Use YappyPaymentMethod component when there's a Yappy method or a phone number */}
          {yappyMethod ? (
            <YappyPaymentMethod phone={yappyMethod.yappyPhone || ""} logo={yappyMethod.yappyLogo} />
          ) : (
            companyInfo.phone && <YappyPaymentMethod phone={companyInfo.phone} />
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsSection;
