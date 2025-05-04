import { useState } from "react";
import { useDocuments } from "@/context/document/document-context";
import { Customer } from "@/types";
import { toast } from "sonner";

export function useCustomerManagement() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useDocuments();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  
  const [newCustomer, setNewCustomer] = useState<Omit<Customer, 'id'>>({
    name: "",
    company: "",
    location: "",
    phone: "",
    email: "",
    type: "business"
  });
  
  const resetNewCustomer = () => {
    setNewCustomer({
      name: "",
      company: "",
      location: "",
      phone: "",
      email: "",
      type: "business"
    });
  };
  
  const handleAddCustomer = () => {
    if (!newCustomer.name) {
      toast.error("El nombre del cliente es requerido");
      return;
    }
    
    addCustomer(newCustomer);
    resetNewCustomer();
    setIsAddDialogOpen(false);
  };
  
  const handleEditCustomer = () => {
    if (!currentCustomer || !currentCustomer.id) return;
    
    updateCustomer(currentCustomer.id, currentCustomer);
    setIsEditDialogOpen(false);
  };
  
  const handleDeleteCustomer = (id: string) => {
    if (confirm("¿Está seguro de que desea eliminar este cliente?")) {
      deleteCustomer(id);
    }
  };
  
  const openEditDialog = (customer: Customer) => {
    setCurrentCustomer(customer);
    setIsEditDialogOpen(true);
  };
  
  const filteredCustomers = customers.filter(customer => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchTermLower) ||
      customer.company.toLowerCase().includes(searchTermLower) ||
      customer.location.toLowerCase().includes(searchTermLower) ||
      customer.email?.toLowerCase().includes(searchTermLower) ||
      customer.phone.includes(searchTerm)
    );
  });

  return {
    customers: filteredCustomers,
    newCustomer,
    setNewCustomer,
    currentCustomer,
    setCurrentCustomer,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    searchTerm,
    setSearchTerm,
    handleAddCustomer,
    handleEditCustomer,
    handleDeleteCustomer,
    openEditDialog,
    resetNewCustomer
  };
}
