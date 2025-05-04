import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, FileCheck, LayoutDashboard, Users2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { authState } = useAuth();
  
  const isActive = (path: string) => {
    // Comprobamos si la ruta actual coincide con la proporcionada o comienza con ella (rutas anidadas)
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(`${path}/`));
  };

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border md:hidden">
      <div className="grid h-full grid-cols-5 mx-auto">
        <Link
          to="/dashboard"
          className={cn(
            "inline-flex flex-col items-center justify-center px-5",
            isActive("/dashboard") 
              ? "text-blue-600 dark:text-blue-400" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <LayoutDashboard 
            className={cn(
              "w-5 h-5 mb-1",
              isActive("/dashboard") ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
            )}
          />
          <span className="text-xs">Inicio</span>
        </Link>
        
        <Link
          to="/quotes"
          className={cn(
            "inline-flex flex-col items-center justify-center px-5",
            isActive("/quotes") 
              ? "text-blue-600 dark:text-blue-400" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <FileText 
            className={cn(
              "w-5 h-5 mb-1",
              isActive("/quotes") ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
            )}
          />
          <span className="text-xs">Cotizaciones</span>
        </Link>
        
        <Link
          to="/export"
          className={cn(
            "inline-flex flex-col items-center justify-center px-5",
            isActive("/export") 
              ? "text-blue-600 dark:text-blue-400" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Download 
            className={cn(
              "w-5 h-5 mb-1",
              isActive("/export") ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
            )}
          />
          <span className="text-xs">Exportar</span>
        </Link>
        
        <Link
          to="/invoices"
          className={cn(
            "inline-flex flex-col items-center justify-center px-5",
            isActive("/invoices") 
              ? "text-blue-600 dark:text-blue-400" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <FileCheck 
            className={cn(
              "w-5 h-5 mb-1",
              isActive("/invoices") ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
            )}
          />
          <span className="text-xs">Facturas</span>
        </Link>
        
        <Link
          to="/customers"
          className={cn(
            "inline-flex flex-col items-center justify-center px-5",
            isActive("/customers") 
              ? "text-blue-600 dark:text-blue-400" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Users2 
            className={cn(
              "w-5 h-5 mb-1",
              isActive("/customers") ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
            )}
          />
          <span className="text-xs">Clientes</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileBottomNav;
