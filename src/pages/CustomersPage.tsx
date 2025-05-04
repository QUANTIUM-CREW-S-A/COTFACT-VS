import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCustomerManagement } from "@/hooks/use-customer-management";
import { CustomerSearch } from "@/components/customers/CustomerSearch";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { CustomerCard } from "@/components/customers/CustomerCard";
import { EditCustomerDialog } from "@/components/customers/EditCustomerDialog";
import { AddCustomerDialog } from "@/components/customers/AddCustomerDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users2, User, Building2, PhoneCall, Search } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

const CustomersPage: React.FC = () => {
  const isMobile = useIsMobile();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Simulamos una carga para las animaciones
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };
  
  const {
    customers,
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
  } = useCustomerManagement();

  // Estadísticas de clientes
  const totalCustomers = customers.length;
  const businessCustomers = customers.filter(c => c.type === 'business').length;
  const individualCustomers = customers.filter(c => c.type === 'individual').length;

  return (
    <main className="container mx-auto px-4 md:px-6 py-4 mt-14 md:mt-0 max-w-7xl">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6"
      >
        <div className="flex items-center">
          <Users2 className="mr-2 h-5 w-5 text-blue-600" />
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Clientes
          </h1>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)} 
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          size={isMobile ? "default" : "default"}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Cliente
        </Button>
      </motion.div>
      
      {/* Tarjetas de estadísticas */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"
      >
        <motion.div variants={itemVariants} whileHover="hover">
          <Card className="overflow-hidden border shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-md font-medium">Total Clientes</CardTitle>
                <div className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Users2 size={18} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                Clientes registrados
              </p>
            </CardContent>
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-blue-600" />
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover="hover">
          <Card className="overflow-hidden border shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-md font-medium">Empresas</CardTitle>
                <div className="p-2 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <Building2 size={18} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{businessCustomers}</div>
              <p className="text-xs text-muted-foreground">
                Clientes comerciales
              </p>
            </CardContent>
            <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-purple-600" />
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover="hover">
          <Card className="overflow-hidden border shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-md font-medium">Individuales</CardTitle>
                <div className="p-2 rounded-full bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400">
                  <User size={18} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{individualCustomers}</div>
              <p className="text-xs text-muted-foreground">
                Clientes personales
              </p>
            </CardContent>
            <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-cyan-600" />
          </Card>
        </motion.div>
      </motion.div>
      
      {/* Búsqueda y filtros */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mb-4"
      >
        <Card className="border shadow-sm">
          <CardHeader className="pb-0 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Buscar clientes
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 pt-2">
            <CustomerSearch 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
            />
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Desktop view */}
      {!isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="rounded-md"
        >
          <Card className="border shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-md font-medium flex items-center gap-2">
                  <Users2 size={18} className="text-blue-500" />
                  <span>Listado de Clientes</span>
                </CardTitle>
                <div className="text-muted-foreground text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                  Total: {totalCustomers}
                </div>
              </div>
              <CardDescription className="text-xs mt-1">
                Administra tus clientes, edita o elimina según necesites
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <CustomerTable 
                customers={customers}
                onEdit={openEditDialog}
                onDelete={handleDeleteCustomer}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      {/* Mobile view */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-4"
        >
          {customers.length > 0 ? (
            <div className="space-y-3">
              {customers.map(customer => (
                <CustomerCard 
                  key={customer.id}
                  customer={customer}
                  onEdit={openEditDialog}
                  onDelete={handleDeleteCustomer}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <Users2 className="h-10 w-10 text-gray-400" />
                  <h3 className="font-medium text-lg">
                    {searchTerm 
                      ? "No se encontraron clientes que coincidan con la búsqueda." 
                      : "No hay clientes registrados."}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm 
                      ? "Intenta con otros términos de búsqueda." 
                      : "Agrega tu primer cliente para comenzar."}
                  </p>
                  {!searchTerm && (
                    <Button 
                      onClick={() => setIsAddDialogOpen(true)} 
                      className="mt-2"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Agregar Cliente
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
      
      <AddCustomerDialog 
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        newCustomer={newCustomer}
        setNewCustomer={setNewCustomer}
        onAdd={handleAddCustomer}
      />
      
      <EditCustomerDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        customer={currentCustomer}
        setCustomer={setCurrentCustomer}
        onSave={handleEditCustomer}
      />
      
      {/* Espacio adicional en móviles */}
      <div className="pb-20 md:pb-0"></div>
    </main>
  );
};

export default CustomersPage;
