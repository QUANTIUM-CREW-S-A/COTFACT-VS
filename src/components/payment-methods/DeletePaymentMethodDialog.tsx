
import React from "react";
import {
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface DeletePaymentMethodDialogProps {
  onConfirm: () => void;
}

const DeletePaymentMethodDialog: React.FC<DeletePaymentMethodDialogProps> = ({ 
  onConfirm 
}) => {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>¿Eliminar método de pago?</AlertDialogTitle>
        <AlertDialogDescription>
          Esta acción eliminará el método de pago de todos los documentos y no se puede deshacer.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>
          Eliminar
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};

export default DeletePaymentMethodDialog;
