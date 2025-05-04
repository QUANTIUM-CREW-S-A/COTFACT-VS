import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import DocumentList from "@/components/DocumentList";
import { Plus, FileCheck, Search, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDocuments } from "@/hooks/use-documents-context";
import { useLoading } from "@/context/loading/LoadingContext";

const InvoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { documents = [] } = useDocuments() || {};
  const { startLoading, stopLoading } = useLoading();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const sourceId = "invoices-page";
    startLoading("Cargando facturas", sourceId);

    const timer = setTimeout(() => {
      stopLoading(sourceId);
    }, 300);

    return () => {
      clearTimeout(timer);
      stopLoading(sourceId);
    };
  }, [startLoading, stopLoading]);

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

  // Calculo de estadísticas de facturas
  const invoices = documents.filter(doc => doc.type === "invoice");
  const invoicesCount = invoices.length;
  const totalRevenue = invoices.reduce((sum, doc) => sum + (doc.total || 0), 0);

  const formatCurrency = (value: number = 0) => {
    return new Intl.NumberFormat('es-PA', { 
      style: 'currency', 
      currency: 'PAB',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <main className="container mx-auto px-4 md:px-6 py-4 mt-14 md:mt-0 max-w-7xl">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6"
      >
        <div className="flex items-center">
          <FileCheck className="mr-2 h-5 w-5 text-purple-600" />
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Facturas
          </h1>
        </div>
        <Button 
          onClick={() => navigate("/create/invoice")} 
          className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
          size={isMobile ? "default" : "default"}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Factura
        </Button>
      </motion.div>
      
      {/* Tarjetas de estadísticas */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
      >
        <motion.div variants={itemVariants} whileHover="hover">
          <Card className="overflow-hidden border shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-md font-medium">Total Facturas</CardTitle>
                <div className="p-2 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <FileCheck size={18} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoicesCount}</div>
              <p className="text-xs text-muted-foreground">
                Documentos creados
              </p>
            </CardContent>
            <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-purple-600" />
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover="hover">
          <Card className="overflow-hidden border shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-md font-medium">Ingresos</CardTitle>
                <div className="p-2 rounded-full bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400">
                  <DollarSign size={18} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                Total facturado
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
              Filtrar facturas
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 pt-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por número o cliente..."
                className="w-full appearance-none bg-background pl-8 shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tarjeta de documentos */}
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
                <FileCheck size={18} className="text-purple-500" />
                <span>Listado de Facturas</span>
              </CardTitle>
              <div className="text-muted-foreground text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                Total: {invoicesCount}
              </div>
            </div>
            <CardDescription className="text-xs mt-1">
              Facturas ordenadas por fecha (más recientes primero)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <DocumentList type="invoice" searchTerm={searchTerm} />
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Espacio adicional en móviles */}
      <div className="pb-20 md:pb-0"></div>
    </main>
  );
};

export default InvoicesPage;
