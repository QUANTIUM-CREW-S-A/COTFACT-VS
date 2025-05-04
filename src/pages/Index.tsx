/*
 * Página de inicio (dashboard de módulos principales).
 * - Muestra accesos rápidos a los módulos clave: Cotizaciones, Facturas, Clientes y Configuración.
 * - Permite navegar fácilmente entre las secciones principales del sistema.
 * - Incluye botón para ir al dashboard general.
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Receipt, Users, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const modules = [
    {
      title: "Cotizaciones",
      description: "Gestiona tus cotizaciones",
      icon: <FileText className="h-10 w-10 text-blue-500" />,
      path: "/"
    },
    {
      title: "Facturas",
      description: "Administra tus facturas",
      icon: <Receipt className="h-10 w-10 text-green-500" />,
      path: "/invoices"
    },
    {
      title: "Clientes",
      description: "Gestiona tu directorio de clientes",
      icon: <Users className="h-10 w-10 text-purple-500" />,
      path: "/customers"
    },
    {
      title: "Configuración",
      description: "Personaliza tu sistema",
      icon: <Settings className="h-10 w-10 text-gray-500" />,
      path: "/settings"
    },
  ];

  return (
    <div className="w-full px-4 py-6 mt-8 md:mt-0">
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          COTFACT-VS
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto px-2">
          Sistema de gestión de cotizaciones y facturas para Viangsolution
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-6xl mx-auto">
        {modules.map((module) => (
          <Card 
            key={module.title} 
            className="hover:shadow-lg transition-all cursor-pointer"
            onClick={() => navigate(module.path)}
          >
            <CardContent className="flex flex-col items-center text-center p-4 md:p-6">
              <div className="mb-2 md:mb-3">{module.icon}</div>
              <h2 className="text-xl font-semibold mb-1 md:mb-2">{module.title}</h2>
              <p className="text-sm text-gray-500">{module.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-6 md:mt-8 text-center">
        <Button 
          onClick={() => navigate("/dashboard")} 
          size={isMobile ? "default" : "lg"} 
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto"
        >
          Ir al Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Index;
