/*
 * Componente principal de la aplicación React.
 * - Define la estructura de rutas y navegación usando React Router.
 * - Aplica los contextos globales de tema, documentos y autenticación.
 * - Incluye protección de rutas para requerir autenticación.
 * - Renderiza la barra lateral, notificaciones y el instalador PWA.
 */
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "sonner";

// Pages
import QuotesPage from "./pages/QuotesPage";
import InvoicesPage from "./pages/InvoicesPage";
import DashboardPage from "./pages/DashboardPage";
import DocumentDetailPage from "./pages/DocumentDetailPage";
import CreateDocumentPage from "./pages/CreateDocumentPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import CustomersPage from "./pages/CustomersPage";
import ExportPage from "./pages/ExportPage";
import NotFound from "./pages/NotFound";
import ForcePasswordChangePage from "./pages/ForcePasswordChangePage";

// Components
import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";
import InstallPWA from "./components/InstallPWA";
import LoadingScreen from "./components/LoadingScreen";
import GlobalLoadingScreen from "./components/GlobalLoadingScreen";
import EmergencyRecovery from "./components/EmergencyRecovery";
import LoadingDiagnostics from "./components/LoadingDiagnostics";
import { useIsMobile } from "./hooks/use-mobile";
import { useAuth } from "./context/auth";
import { DocumentProvider } from "./context/document/DocumentContext";
import { ThemeProvider } from "./context/theme/ThemeProvider";
import { LoadingProvider, useLoading } from "./context/loading/LoadingContext";
import { useState, useEffect } from "react";

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { authState } = useAuth();
  const { startLoading, stopLoading, isLoading: isGlobalLoading } = useLoading(); // Use global loading state

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
