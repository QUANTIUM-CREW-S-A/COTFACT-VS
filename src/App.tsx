/*
 * Componente principal de la aplicación React.
 * - Define la estructura de rutas y navegación usando React Router.
 * - Aplica los contextos globales de tema, documentos y autenticación.
 * - Incluye protección de rutas para requerir autenticación.
 * - Renderiza la barra lateral, notificaciones y el instalador PWA.
 */
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Suspense, lazy } from 'react';
import { Toaster } from "sonner";

// Import only the necessary components for the initial render
import LoadingScreen from "./components/LoadingScreen";
import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";
import InstallPWA from "./components/InstallPWA";
import GlobalLoadingScreen from "./components/GlobalLoadingScreen";
import EmergencyRecovery from "./components/EmergencyRecovery";
import LoadingDiagnostics from "./components/LoadingDiagnostics";
import { useIsMobile } from "./hooks/use-mobile";
import { useAuth } from "./context/auth";
import { DocumentProvider } from "./context/document/DocumentContext";
import { ThemeProvider } from "./context/theme/ThemeProvider";
import { LoadingProvider, useLoading } from "./context/loading/LoadingContext";
import { useState, useEffect } from "react";

// Lazy load all pages to reduce initial bundle size
const LoginPage = lazy(() => import("./pages/LoginPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ForcePasswordChangePage = lazy(() => import("./pages/ForcePasswordChangePage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const QuotesPage = lazy(() => import("./pages/QuotesPage"));
const InvoicesPage = lazy(() => import("./pages/InvoicesPage"));
const DocumentDetailPage = lazy(() => import("./pages/DocumentDetailPage"));
const CreateDocumentPage = lazy(() => import("./pages/CreateDocumentPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const CustomersPage = lazy(() => import("./pages/CustomersPage"));
const ExportPage = lazy(() => import("./pages/ExportPage"));

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { authState } = useAuth();
  const { loadingState, startLoading, stopLoading } = useLoading(); // Accedemos a loadingState correctamente

  useEffect(() => {
    // This effect now primarily manages global loading indicators based on authState.isLoading
    if (authState.isLoading) {
      startLoading("Verificando autenticación", "auth-check");
    } else {
      stopLoading("auth-check");
    }
    // Ensure to clean up this specific loading task when the component unmounts or dependencies change
    return () => {
      stopLoading("auth-check");
    };
  }, [authState.isLoading, startLoading, stopLoading]);

  // While authState is loading, show a loading screen or nothing to prevent premature redirects
  if (authState.isLoading) {
    // Optionally, return a dedicated loading component here, e.g., <LoadingScreen />
    // For now, returning null to prevent rendering children or redirecting prematurely.
    // The GlobalLoadingScreen should be active due to the startLoading call above.
    return null; 
  }

  // If not loading and not authenticated, then redirect to login
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated and password change is required, redirect to password change page
  // This check should ideally be inside the protected area or handled by specific page logic
  // if it's not a global requirement for all protected routes after this point.
  if (authState.passwordChangeRequired) {
    // Check if already on the password-change page to prevent redirect loop
    if (window.location.pathname !== "/password-change") {
      return <Navigate to="/password-change" replace />;
    }
  }

  return <>{children}</>;
};

// Loading fallback component for lazy-loaded routes
const PageLoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <LoadingScreen fullScreen withProgress={false} />
  </div>
);

function App() {
  const isMobile = useIsMobile();
  const { authState } = useAuth(); // authState is used for conditional rendering of login/dashboard
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <ThemeProvider>
      <LoadingProvider>
        <GlobalLoadingScreen />
        <DocumentProvider>
          <Router>
            {/* Componentes de emergencia y diagnóstico */}
            <EmergencyRecovery />
            <LoadingDiagnostics />
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
              {/* Rendereamos el Sidebar en todas las páginas protegidas */}
              {authState.isAuthenticated && !authState.isLoading && (
                <Sidebar />
              )}
              
              <div className="flex flex-col flex-1 w-full overflow-hidden">
                {/* Rendereamos TopNavbar en todas las páginas protegidas */}
                {authState.isAuthenticated && !authState.isLoading && (
                  <TopNavbar 
                    mobileNavOpen={mobileNavOpen} 
                    setMobileNavOpen={setMobileNavOpen} 
                  />
                )}
                
                {/* Contenedor principal para las páginas */}
                <main className="flex-1 overflow-auto">
                  <Suspense fallback={<PageLoadingFallback />}>
                    <Routes>
                      <Route path="/login" element={
                        // If auth is still loading, LoginPage might flash, consider authState.isLoading here too
                        // However, usually, you want to show LoginPage or redirect immediately based on isAuthenticated
                        authState.isAuthenticated && !authState.isLoading ? 
                          <Navigate to="/dashboard" replace /> : 
                          <LoginPage />
                      } />
                      
                      <Route path="/password-change" element={
                        // This route should be protected, or handle authState.isLoading
                        // If auth is loading, ForcePasswordChangePage might render prematurely or user is redirected to login
                        authState.isLoading ? null : // Wait if auth is loading
                        !authState.isAuthenticated ? 
                          <Navigate to="/login" replace /> :
                          !authState.passwordChangeRequired ?
                            <Navigate to="/dashboard" replace /> :
                            <ForcePasswordChangePage />
                      } />
                      
                      {/* Contenedor para rutas protegidas */}
                      <Route element={<ProtectedRoute> <Outlet /> </ProtectedRoute>}>
                        {/* Rutas protegidas individuales */}
                        {/* The Outlet inside ProtectedRoute will render these child routes */}
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="quotes" element={<QuotesPage />} />
                        <Route path="invoices" element={<InvoicesPage />} />
                        <Route path="document/:id" element={<DocumentDetailPage />} />
                        <Route path="create/:type" element={<CreateDocumentPage />} />
                        <Route path="edit/:id" element={<CreateDocumentPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="customers" element={<CustomersPage />} />
                        <Route path="export" element={<ExportPage />} />
                        {/* NotFound should be outside or also handled by ProtectedRoute if it's a protected 404 */}
                        {/* For a public 404, it should be outside this group */}
                      </Route>
                      
                      {/* Public NotFound Route - if a user types a non-existent path and is not necessarily going through protected routes */}
                      <Route path="*" element={<NotFound />} /> 
                    </Routes>
                  </Suspense>
                </main>
              </div>
            </div>
            <Toaster position={isMobile ? "bottom-center" : "top-right"} />
            <InstallPWA />
          </Router>
        </DocumentProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
}

export default App;
