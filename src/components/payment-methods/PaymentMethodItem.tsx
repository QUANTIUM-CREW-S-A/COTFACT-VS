
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { PaymentMethod } from "@/types";
import {
  AlertDialog,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

interface PaymentMethodItemProps {
  method: PaymentMethod;
  onDeleteClick: (id: string) => void;
}

const PaymentMethodItem: React.FC<PaymentMethodItemProps> = ({
  method,
  onDeleteClick
}) => {
  return (
    <div 
      className="p-4 border rounded-md relative"
    >
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 text-red-500 hover:text-red-700 hover:bg-red-100"
            onClick={() => onDeleteClick(method.id || "")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
      </AlertDialog>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold">Banco</p>
          <p>{method.bank}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold">Titular</p>
          <p>{method.accountHolder}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold">Número de Cuenta</p>
          <p>{method.accountNumber}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold">Tipo de Cuenta</p>
          <p>{method.accountType}</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodItem;
