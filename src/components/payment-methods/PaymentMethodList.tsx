
import React from "react";
import { PaymentMethod } from "@/types";
import { CreditCard } from "lucide-react";
import { AlertDialog } from "@/components/ui/alert-dialog";
import PaymentMethodItem from "./PaymentMethodItem";
import DeletePaymentMethodDialog from "./DeletePaymentMethodDialog";

interface PaymentMethodListProps {
  paymentMethods: PaymentMethod[];
  onDeleteMethod: (id: string) => void;
  methodToDelete: string | null;
  setMethodToDelete: (id: string | null) => void;
}

const PaymentMethodList: React.FC<PaymentMethodListProps> = ({
  paymentMethods,
  onDeleteMethod,
  methodToDelete,
  setMethodToDelete
}) => {
  const confirmDeleteMethod = (id: string) => {
    setMethodToDelete(id);
  };
  
  const handleDeleteMethod = () => {
    if (methodToDelete) {
      onDeleteMethod(methodToDelete);
    }
  };
  
  if (paymentMethods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground border rounded-md">
        <CreditCard className="h-12 w-12 mb-2 text-muted-foreground/60" />
        <p>No hay métodos de pago configurados</p>
        <p className="text-sm">Agrega un método de pago para mostrarlo en tus documentos</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {paymentMethods.map((method) => (
        <AlertDialog key={method.id || "method-" + Math.random().toString(36).substr(2, 9)}>
          <PaymentMethodItem 
            method={method} 
            onDeleteClick={confirmDeleteMethod} 
          />
          {methodToDelete === method.id && (
            <DeletePaymentMethodDialog onConfirm={handleDeleteMethod} />
          )}
        </AlertDialog>
      ))}
    </div>
  );
};

export default PaymentMethodList;
