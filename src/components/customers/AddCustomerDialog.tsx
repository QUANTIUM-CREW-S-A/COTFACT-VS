import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomerForm, CustomerFormRef } from "./CustomerForm";
import { Customer } from "@/types";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface AddCustomerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newCustomer: Omit<Customer, 'id'>;
  setNewCustomer: (customer: Omit<Customer, 'id'>) => void;
  onAdd: () => void;
}

export const AddCustomerDialog: React.FC<AddCustomerDialogProps> = ({
  isOpen,
  onOpenChange,
  newCustomer,
  setNewCustomer,
  onAdd
}) => {
  const [isAdding, setIsAdding] = React.useState(false);
  const customerFormRef = useRef<CustomerFormRef>(null);
  
  // Validar y agregar cliente
  const handleAddCustomer = () => {
    // Si tenemos referencia al formulario, validar primero
    if (customerFormRef.current?.validateForm) {
      const isValid = customerFormRef.current.validateForm();
      
      if (!isValid) {
        toast.error("Por favor corrija los errores del formulario", {
          description: "Hay campos incompletos o con formato incorrecto"
        });
        return;
      }
      
      // Lógica de agregar cliente
      setIsAdding(true);
      
      try {
        onAdd();
        // Reset de los estados
        setTimeout(() => {
          setIsAdding(false);
        }, 500);
      } catch (error) {
        setIsAdding(false);
        toast.error("Error al agregar cliente");
      }
    } else {
      // Si no tenemos referencia, intentar agregar de todos modos
      onAdd();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!isAdding) {
        onOpenChange(open);
      }
    }}>
      <DialogContent className="sm:max-w-[800px] lg:max-w-[900px] w-[95%] p-0 gap-0 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader className="p-6 pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <PlusCircle className="h-5 w-5" />
            Agregar Nuevo Cliente
          </DialogTitle>
          <DialogDescription className="text-blue-600/70 dark:text-blue-400/70">
            Complete la información del cliente. Los campos con asterisco (*) son obligatorios.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <CustomerForm 
            customer={newCustomer} 
            setCustomer={setNewCustomer} 
            type="add" 
            ref={customerFormRef}
          />
        </div>
        
        <DialogFooter className="flex sm:flex-row gap-2 p-6 pt-4 border-t bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto" 
            onClick={() => onOpenChange(false)}
            disabled={isAdding}
          >
            Cancelar
          </Button>
          <Button 
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            onClick={handleAddCustomer}
            disabled={isAdding}
          >
            {isAdding ? (
              <motion.div 
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                transition={{ repeat: Infinity, duration: 0.8, repeatType: "reverse" }}
                className="flex items-center"
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Agregando...
              </motion.div>
            ) : (
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Cliente
              </motion.div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
