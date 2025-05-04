import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FileText, FileCheck, Settings, 
  LayoutDashboard, LogOut, Users2, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Logo from './Logo';
import { useAuth } from '@/context/auth';

interface MobileSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onExport: () => void;
  onLogout: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ 
  open, 
  setOpen, 
  onExport, 
  onLogout 
}) => {
  const location = useLocation();
  const { authState } = useAuth();
  
  const isActive = (path: string) => {
    // Comprobamos si la ruta actual coincide con la proporcionada o comienza con ella (rutas anidadas)
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(`${path}/`));
  };

  return (
    <div className="fixed top-0 left-0 z-50 p-3">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="bg-background/90 backdrop-blur shadow-sm rounded-full h-10 w-10">
            <Menu size={18} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px] max-w-[85vw]">
          <div className="h-full flex flex-col bg-background">
            <div className="flex items-center p-4 border-b border-border">
              <div className="w-full flex justify-center">
                <Logo variant="original" size="large" animated={true} aria="COTFACT-VS Logo" />
              </div>
            </div>
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{authState.currentUser?.fullName}</span>
                  <span className="text-xs text-muted-foreground">{authState.currentUser?.role}</span>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-auto py-4 px-2">
              <nav className="flex flex-col gap-1">
                <Link to="/dashboard" className="w-full" onClick={() => setOpen(false)}>
                  <Button 
                    variant={isActive("/dashboard") ? "default" : "ghost"} 
                    className={`w-full justify-start ${isActive("/dashboard") ? 'bg-primary/10 text-primary dark:bg-primary/20' : ''}`}
                    size="lg"
                  >
                    <LayoutDashboard size={18} className="mr-2" />
                    Inicio
                  </Button>
                </Link>
                <Link to="/quotes" className="w-full" onClick={() => setOpen(false)}>
                  <Button 
                    variant={isActive("/quotes") ? "default" : "ghost"} 
                    className={`w-full justify-start ${isActive("/quotes") ? 'bg-primary/10 text-primary dark:bg-primary/20' : ''}`}
                    size="lg"
                  >
                    <FileText size={18} className="mr-2" />
                    Cotizaciones
                  </Button>
                </Link>
                <Link to="/invoices" className="w-full" onClick={() => setOpen(false)}>
                  <Button 
                    variant={isActive("/invoices") ? "default" : "ghost"} 
                    className={`w-full justify-start ${isActive("/invoices") ? 'bg-primary/10 text-primary dark:bg-primary/20' : ''}`}
                    size="lg"
                  >
                    <FileCheck size={18} className="mr-2" />
                    Facturas
                  </Button>
                </Link>
                <Link to="/customers" className="w-full" onClick={() => setOpen(false)}>
                  <Button 
                    variant={isActive("/customers") ? "default" : "ghost"} 
                    className={`w-full justify-start ${isActive("/customers") ? 'bg-primary/10 text-primary dark:bg-primary/20' : ''}`}
                    size="lg"
                  >
                    <Users2 size={18} className="mr-2" />
                    Clientes
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => {
                    onExport();
                    setOpen(false);
                  }}
                  size="lg"
                >
                  <Download size={18} className="mr-2" />
                  Exportar Documentos
                </Button>
              </nav>
            </div>
            <div className="p-4 border-t border-border">
              <Button 
                variant="ghost" 
                className="text-destructive w-full justify-start dark:hover:text-destructive-foreground"
                onClick={onLogout}
                size="lg"
              >
                <LogOut size={18} className="mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileSidebar;
