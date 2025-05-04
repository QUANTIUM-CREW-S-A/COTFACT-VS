
import React from "react";
import { PaymentMethod } from "@/types";
import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface YappyPaymentMethodSectionProps {
  yappyMethod?: PaymentMethod;
  onDeleteMethod: (id: string) => void;
}

const YappyPaymentMethodSection: React.FC<YappyPaymentMethodSectionProps> = ({
  yappyMethod,
  onDeleteMethod
}) => {
  if (!yappyMethod) {
    return null;
  }

  return (
    <div className="p-4 border rounded-md relative">
      <div className="flex items-center gap-2 mb-3">
        {yappyMethod.yappyLogo ? (
          <img src={yappyMethod.yappyLogo} alt="Yappy Logo" className="h-6 w-6 object-contain" />
        ) : (
          <Smartphone className="h-5 w-5" />
        )}
        <h3 className="font-bold">Método de Pago Yappy</h3>
      </div>
      <div className="grid gap-2">
        <p>Teléfono: {yappyMethod.yappyPhone}</p>
        <div className="flex justify-end">
          <Button
            variant="ghost"
            className="text-red-500 hover:text-red-700 text-sm"
            onClick={() => onDeleteMethod(yappyMethod.id || "")}
          >
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default YappyPaymentMethodSection;
