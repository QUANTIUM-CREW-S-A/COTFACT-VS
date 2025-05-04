
import React from "react";
import { PaymentMethod } from "@/types";
import PaymentMethodList from "./PaymentMethodList";

interface BankPaymentMethodSectionProps {
  bankPaymentMethods: PaymentMethod[];
  onDeleteMethod: (id: string) => void;
  methodToDelete: string | null;
  setMethodToDelete: (id: string | null) => void;
}

const BankPaymentMethodSection: React.FC<BankPaymentMethodSectionProps> = ({
  bankPaymentMethods,
  onDeleteMethod,
  methodToDelete,
  setMethodToDelete
}) => {
  return (
    <PaymentMethodList 
      paymentMethods={bankPaymentMethods}
      onDeleteMethod={onDeleteMethod}
      methodToDelete={methodToDelete}
      setMethodToDelete={setMethodToDelete}
    />
  );
};

export default BankPaymentMethodSection;
