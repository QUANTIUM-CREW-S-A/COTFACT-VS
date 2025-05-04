
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { PaymentMethod } from "@/types";
import { toast } from "sonner";

interface PaymentMethodFormProps {
  onAddMethod: (method: Omit<PaymentMethod, "id">) => void;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({ onAddMethod }) => {
  const [newMethod, setNewMethod] = useState({
    bank: "",
    accountHolder: "",
    accountNumber: "",
    accountType: ""
  });
  
  const handleAddMethod = () => {
    // Simple validation
    if (!newMethod.bank || !newMethod.accountNumber) {
      toast.error("Por favor complete al menos el banco y el número de cuenta");
      return;
    }
    
    onAddMethod(newMethod);
    
    // Reset form
    setNewMethod({
      bank: "",
      accountHolder: "",
      accountNumber: "",
      accountType: ""
    });
  };
  
  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-medium mb-4">Agregar Nuevo Método de Pago</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bank">Banco</Label>
          <Input 
            id="bank" 
            value={newMethod.bank}
            onChange={(e) => setNewMethod({...newMethod, bank: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountHolder">Titular de la Cuenta</Label>
          <Input 
            id="accountHolder" 
            value={newMethod.accountHolder}
            onChange={(e) => setNewMethod({...newMethod, accountHolder: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountNumber">Número de Cuenta</Label>
          <Input 
            id="accountNumber" 
            value={newMethod.accountNumber}
            onChange={(e) => setNewMethod({...newMethod, accountNumber: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountType">Tipo de Cuenta</Label>
          <Input 
            id="accountType" 
            value={newMethod.accountType}
            onChange={(e) => setNewMethod({...newMethod, accountType: e.target.value})}
          />
        </div>
      </div>
      <Button 
        onClick={handleAddMethod}
        className="mt-4 w-full"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Agregar Método de Pago
      </Button>
    </div>
  );
};

export default PaymentMethodForm;
