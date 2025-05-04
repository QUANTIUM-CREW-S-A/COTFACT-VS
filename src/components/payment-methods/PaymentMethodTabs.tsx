
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Banknote, Smartphone } from "lucide-react";
import PaymentMethodForm from "./PaymentMethodForm";
import YappyPaymentMethodForm from "./YappyPaymentMethodForm";
import { PaymentMethod } from "@/types";

interface PaymentMethodTabsProps {
  onAddMethod: (method: Omit<PaymentMethod, "id">) => void;
  onAddYappyMethod: (yappyPhone: string, yappyLogo: string) => void;
}

const PaymentMethodTabs: React.FC<PaymentMethodTabsProps> = ({
  onAddMethod,
  onAddYappyMethod
}) => {
  return (
    <Tabs defaultValue="bank">
      <TabsList className="grid grid-cols-2">
        <TabsTrigger value="bank" className="flex items-center gap-2">
          <Banknote className="h-4 w-4" />
          <span>Cuenta Bancaria</span>
        </TabsTrigger>
        <TabsTrigger value="yappy" className="flex items-center gap-2">
          <Smartphone className="h-4 w-4" />
          <span>Yappy</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="bank">
        <PaymentMethodForm onAddMethod={onAddMethod} />
      </TabsContent>
      
      <TabsContent value="yappy">
        <YappyPaymentMethodForm onAddYappyMethod={onAddYappyMethod} />
      </TabsContent>
    </Tabs>
  );
};

export default PaymentMethodTabs;
