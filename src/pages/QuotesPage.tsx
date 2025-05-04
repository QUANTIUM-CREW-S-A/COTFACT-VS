import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import DocumentList from "@/components/DocumentList";
import { Plus, FileText, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDocuments } from "@/hooks/use-documents-context";

const QuotesPage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { documents = [] } = useDocuments() || {};
  const [searchTerm, setSearchTerm] = useState("");
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

  return (
    <main className="container mx-auto px-4 md:px-6 py-4 mt-14 md:mt-0 max-w-7xl">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6"
      >
        <div className="flex items-center">
          <FileText className="mr-2 h-6 w-6 text-blue-600" />
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Cotizaciones
          </h1>
        </div>
        <Button 
          onClick={() => navigate("/create/quote")} 
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          size={isMobile ? "default" : "default"}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Cotización
        </Button>
      </motion.div>
      
      {/* Búsqueda y filtros */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mb-4"
      >
        <Card className="border shadow-sm">
          <CardHeader className="pb-0 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Filtrar cotizaciones
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
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        className="rounded-md"
      >
        <Card className="border shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-md font-medium flex items-center gap-2">
                <FileText size={18} className="text-blue-500" />
                <span>Listado de Cotizaciones</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <DocumentList type="quote" searchTerm={searchTerm} />
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Espacio adicional en móviles */}
      <div className="pb-20 md:pb-0"></div>
    </main>
  );
};

export default QuotesPage;
