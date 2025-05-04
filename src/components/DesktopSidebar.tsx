import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, HomeIcon, FileTextIcon, PanelRightIcon, Users, LifeBuoy, HelpCircle, Download, LogOut, Settings } from 'lucide-react';
import Logo from './Logo';
import SidebarNavItem from './SidebarNavItem';

interface DesktopSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onExport?: () => void;
  onLogout?: () => void;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ 
  collapsed, 
  setCollapsed,
  onExport,
  onLogout
}) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(`${path}/`));
  };

  // Animation variants for the sidebar - reducidos para un diseño más compacto
  const sidebarVariants = {
    expanded: { width: 260, transition: { duration: 0.25, ease: "easeInOut" } },
    collapsed: { width: 70, transition: { duration: 0.25, ease: "easeInOut" } }
  };

  // Animation variants for staggered children
  const childrenVariants = {
    initial: { opacity: 0, x: -8 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -8 }
  };

  // Animation variants for nav items container
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.05,
      }
    }
  };

  return (
    <motion.aside
      className="hidden lg:flex flex-col h-screen bg-background border-r border-border shadow-sm overflow-hidden z-20"
      initial="expanded"
      animate={collapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
    >
      {/* Header with logo and collapse button - altura optimizada */}
      <div className="flex items-center justify-between py-1.5 px-3 border-b border-border">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              key="logo"
              className="overflow-hidden w-[170px]"
            >
              <Link to="/" className="flex items-center">
                <Logo variant="original" size="small" animated={false} aria="COTFACT-VS Logo" />
              </Link>
            </motion.div>
          )}
          {collapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              key="icon-logo"
              className="overflow-hidden flex justify-center w-full"
            >
              <Link to="/" className="flex items-center justify-center">
                <img 
                  src="/lovable-uploads/cotfact-icon.png" 
                  alt="COTFACT-VS Icon" 
                  className="h-8 w-8 object-contain"
                />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-full hover:bg-accent hover:text-accent-foreground"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </motion.button>
      </div>

      {/* Main navigation - gap reducido para un look más compacto */}
      <motion.div 
        className="flex flex-col gap-0.5 flex-1 overflow-y-auto p-2 pt-3"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {/* Sección principal de navegación */}
        <div className="space-y-1 mb-4">
          <motion.div variants={childrenVariants}>
            <SidebarNavItem 
              to="/dashboard" 
              icon={<HomeIcon size={20} />} 
              label="Inicio" 
              isActive={isActive('/dashboard')} 
              collapsed={collapsed} 
            />
          </motion.div>
          
          <motion.div variants={childrenVariants}>
            <SidebarNavItem 
              to="/quotes" 
              icon={<PanelRightIcon size={20} />} 
              label="Cotizaciones" 
              isActive={isActive('/quotes')} 
              collapsed={collapsed} 
            />
          </motion.div>
          
          <motion.div variants={childrenVariants}>
            <SidebarNavItem 
              to="/invoices" 
              icon={<FileTextIcon size={20} />} 
              label="Facturas" 
              isActive={isActive('/invoices')} 
              collapsed={collapsed} 
            />
          </motion.div>
          
          <motion.div variants={childrenVariants}>
            <SidebarNavItem 
              to="/customers" 
              icon={<Users size={20} />} 
              label="Clientes" 
              isActive={isActive('/customers')} 
              collapsed={collapsed} 
            />
          </motion.div>
        </div>
        
        {/* Sección de acciones y herramientas */}
        <div className="space-y-1 mb-4">
          <div className={!collapsed ? "pl-3 mb-2" : "mb-2"}>
            <p className="text-xs uppercase text-muted-foreground font-medium">
              {!collapsed && "Herramientas"}
            </p>
          </div>
          
          <motion.div variants={childrenVariants}>
            <SidebarNavItem 
              to="/settings" 
              icon={<Settings size={20} />} 
              label="Configuración" 
              isActive={isActive('/settings')} 
              collapsed={collapsed} 
            />
          </motion.div>
          
          <motion.div variants={childrenVariants}>
            <SidebarNavItem 
              to="/export"
              icon={<Download size={20} />} 
              label="Exportar Documentos" 
              isActive={isActive('/export')} 
              collapsed={collapsed}
              badge="New"
            />
          </motion.div>
        </div>
      </motion.div>
      
      {/* Footer with help and support - padding reducido */}
      <motion.div 
        className="border-t border-border mt-auto p-2"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <div className="space-y-1 mb-2">
          <motion.div variants={childrenVariants}>
            <SidebarNavItem 
              icon={<LifeBuoy size={20} />} 
              label="Ayuda y Soporte" 
              collapsed={collapsed} 
              onClick={() => window.open('https://cotfact.app/help', '_blank')}
            />
          </motion.div>
          
          <motion.div variants={childrenVariants}>
            <SidebarNavItem 
              icon={<HelpCircle size={20} />} 
              label="Tutoriales" 
              collapsed={collapsed} 
              onClick={() => window.open('https://cotfact.app/tutorials', '_blank')}
            />
          </motion.div>
        </div>
        
        {/* Separador antes del botón de logout */}
        <div className="pt-2">
          <motion.div variants={childrenVariants}>
            <SidebarNavItem 
              icon={<LogOut size={20} />} 
              label="Cerrar Sesión" 
              collapsed={collapsed} 
              onClick={onLogout}
            />
          </motion.div>
        </div>
      </motion.div>
    </motion.aside>
  );
};

export default DesktopSidebar;
