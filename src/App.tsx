/*
 * Componente principal de la aplicación React.
 * - Define la estructura de rutas y navegación usando React Router.
 * - Aplica los contextos globales de tema, documentos y autenticación.
 * - Incluye protección de rutas para requerir autenticación.
 * - Renderiza la barra lateral, notificaciones y el instalador PWA.
 */
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
  const { startLoading, stopLoading } = useLoading();
  
  useEffect(() => {
    if (authState.isLoading) {
      startLoading("Iniciando sesión", "auth");
    } else {
      stopLoading("auth");
    }
  }, [authState.isLoading, startLoading, stopLoading]);

  // Solo redirigir si no está autenticado y no está cargando
  if (!authState.isAuthenticated && !authState.isLoading) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  const isMobile = useIsMobile();
  const { authState } = useAuth();
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
                  authState.isAuthenticated ? 
                    <Navigate to="/dashboard" replace /> : 
                    <LoginPage />
                } />
                
                <Route path="/*" element={
                  <ProtectedRoute>
                    <div className="flex h-screen w-full overflow-hidden">
                      <Sidebar />
                      <div className="flex-1 overflow-auto flex flex-col">
                        <TopNavbar mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen} />
                        <div className="mx-auto w-full max-w-full px-3 sm:px-5 md:px-8 lg:px-10 xl:px-12 py-4 flex-1">
                          <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/quotes" element={<QuotesPage />} />
                            <Route path="/invoices" element={<InvoicesPage />} />
                            <Route path="/document/:id" element={<DocumentDetailPage />} />
                            <Route path="/create/:type" element={<CreateDocumentPage />} />
                            <Route path="/edit/:id" element={<CreateDocumentPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="/customers" element={<CustomersPage />} />
                            <Route path="/export" element={<ExportPage />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </div>
                      </div>
                    </div>
                  </ProtectedRoute>
                } />
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
