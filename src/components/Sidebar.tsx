import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { useWindowSize } from '@/hooks/use-window-size';
import MobileBottomNav from './MobileBottomNav';
import DesktopSidebar from './DesktopSidebar';

/*
 * Componente Sidebar (barra lateral de navegación).
 * - Muestra la navegación principal de la app, adaptándose a escritorio y móvil.
 * - Controla el acceso según autenticación y permite cerrar sesión.
 */
const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authState, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  
  const { width } = useWindowSize();
  const isMobile = width < 768;
  
  useEffect(() => {
    // Verificar autenticación al montar el componente
    if (!authState?.isAuthenticated && location.pathname !== '/login') {
      console.log("Sidebar: Usuario no autenticado, redirigiendo a login");
      navigate('/login');
    }
  }, [authState?.isAuthenticated, navigate, location.pathname]);

  useEffect(() => {
    setOpenMobileMenu(false);
  }, [location.pathname]);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };
  
  // Función para navegar a la página de exportación
  const handleExport = () => {
    navigate('/export');
  };

  // Si el usuario no está autenticado, no renderizamos el sidebar
  if (!authState?.isAuthenticated) {
    return null;
  }

  if (isMobile) {
    return (
      <>
        <MobileBottomNav />
      </>
    );
  }

  return (
    <>
      <DesktopSidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        onLogout={handleLogout}
        onExport={handleExport}
      />
    </>
  );
};

export default Sidebar;
