import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Loader2, Save } from "lucide-react";
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

interface EditCustomerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  setCustomer: (customer: Customer) => void;
  onSave: () => void;
}

export const EditCustomerDialog: React.FC<EditCustomerDialogProps> = ({
  isOpen,
  onOpenChange,
  customer,
  setCustomer,
  onSave
}) => {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const customerFormRef = useRef<CustomerFormRef>(null);
  
  if (!customer) return null;
  
  // Validar y guardar cliente
  const handleSaveCustomer = () => {
    // Si tenemos referencia al formulario, validar primero
    if (customerFormRef.current?.validateForm) {
      const isValid = customerFormRef.current.validateForm();
      
      if (!isValid) {
        toast.error("Por favor corrija los errores del formulario", {
          description: "Hay campos incompletos o con formato incorrecto"
        });
        return;
      }
      
      // Lógica de guardar cliente
      setIsUpdating(true);
      
      try {
        onSave();
        // Reset de los estados
        setTimeout(() => {
          setIsUpdating(false);
        }, 500);
      } catch (error) {
        setIsUpdating(false);
        toast.error("Error al actualizar cliente");
      }
    } else {
      // Si no tenemos referencia, intentar guardar de todos modos
      onSave();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!isUpdating) {
        onOpenChange(open);
      }
    }}>
      <DialogContent className="sm:max-w-[800px] lg:max-w-[900px] w-[95%] p-0 gap-0 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader className="p-6 pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Pencil className="h-5 w-5" />
            Editar Cliente
          </DialogTitle>
          <DialogDescription className="text-blue-600/70 dark:text-blue-400/70">
            Actualice la información del cliente. Los campos con asterisco (*) son obligatorios.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <CustomerForm 
            customer={customer} 
            setCustomer={setCustomer} 
            type="edit" 
            ref={customerFormRef}
          />
        </div>
        
        <DialogFooter className="flex sm:flex-row gap-2 p-6 pt-4 border-t bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto" 
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Cancelar
          </Button>
          <Button 
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            onClick={handleSaveCustomer}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <motion.div 
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                transition={{ repeat: Infinity, duration: 0.8, repeatType: "reverse" }}
                className="flex items-center"
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </motion.div>
            ) : (
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </motion.div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
