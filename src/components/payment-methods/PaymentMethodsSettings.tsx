import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BankPaymentMethodSection from "./BankPaymentMethodSection";
import YappyPaymentMethodSection from "./YappyPaymentMethodSection";
import PaymentMethodTabs from "./PaymentMethodTabs";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { Loader2 } from "lucide-react";

const PaymentMethodsSettings: React.FC = () => {
  // Referencia para evitar múltiples renderizados
  const componentMounted = useRef(false);
  
  const {
    paymentMethods,
    methodToDelete,
    setMethodToDelete,
    handleAddMethod,
    handleAddYappyMethod,
    handleDeleteMethod,
    isLoading
  } = usePaymentMethods();
  
  // Evitamos renderizados innecesarios
  useEffect(() => {
    componentMounted.current = true;
    return () => {
      componentMounted.current = false;
    };
  }, []);
  
  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0">
        <CardTitle>Métodos de Pago</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-6">
            <BankPaymentMethodSection
              bankPaymentMethods={paymentMethods.filter(method => !method.isYappy)}
              onDeleteMethod={handleDeleteMethod}
              methodToDelete={methodToDelete}
              setMethodToDelete={setMethodToDelete}
            />
            
            <YappyPaymentMethodSection 
              yappyMethod={paymentMethods.find(method => method.isYappy)}
              onDeleteMethod={handleDeleteMethod}
            />
            
            <PaymentMethodTabs
              onAddMethod={handleAddMethod}
              onAddYappyMethod={handleAddYappyMethod}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentMethodsSettings;
