import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDocuments } from '@/hooks/use-documents-context';
import { 
  FileText, FileCheck, DollarSign, 
  BarChart2, Calendar, TrendingUp, CheckCircle, Clock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import LoadingScreen from '@/components/LoadingScreen';
import { useLoading } from '@/context/loading/LoadingContext';

const DashboardPage: React.FC = () => {
  const { documents = [], loading = false } = useDocuments() || {};
  const [isLoaded, setIsLoaded] = useState(false);
  const { startLoading, stopLoading } = useLoading();
  const loadingStartedRef = useRef(false);
  const sourceIdRef = useRef("dashboard-page-" + Date.now());

  // Función para formatear moneda
  const formatCurrency = (value: number = 0) => {
    return new Intl.NumberFormat('es-PA', { 
      style: 'currency', 
      currency: 'PAB',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Efecto para manejar el estado de carga - separado de la lógica de documentos
  useEffect(() => {
    // Iniciar la carga solo la primera vez o si cambia el estado de carga
    if ((loading && !loadingStartedRef.current) || (!loadingStartedRef.current && !isLoaded)) {
      loadingStartedRef.current = true;
      startLoading("Cargando dashboard", sourceIdRef.current);
    }
    
    // Detenemos la carga cuando los documentos estén cargados y la animación esté lista
    if (!loading && isLoaded && loadingStartedRef.current) {
      stopLoading(sourceIdRef.current);
      loadingStartedRef.current = false;
    }
    
    // Limpieza al desmontar
    return () => {
      if (loadingStartedRef.current) {
        stopLoading(sourceIdRef.current);
        loadingStartedRef.current = false;
      }
    };
  }, [loading, isLoaded, startLoading, stopLoading]);

  // Efecto separado solo para manejar la animación y transición visual
  useEffect(() => {
    // Siempre configuramos un timeout para asegurar que isLoaded eventualmente sea true
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Datos para los gráficos y estadísticas
  const dashboardData = useMemo(() => {
    try {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      const monthStart = new Date(currentYear, currentMonth, 1);
      
      // Filtrar documentos del mes actual - con comprobaciones de seguridad
      const currentMonthDocs = Array.isArray(documents) 
        ? documents.filter(doc => doc && doc.date && new Date(doc.date) >= monthStart)
        : [];
      
      // Estadísticas con valores por defecto para evitar errores
      const totalQuotes = currentMonthDocs.filter(doc => doc.type === 'quote').length || 0;
      const approvedQuotes = currentMonthDocs.filter(doc => doc.type === 'quote' && doc.status === 'approved').length || 0;
      const pendingQuotes = currentMonthDocs.filter(doc => doc.type === 'quote' && doc.status === 'pending').length || 0;
      const totalInvoices = currentMonthDocs.filter(doc => doc.type === 'invoice').length || 0;
      
      // Calcular ingresos totales del mes actual a partir de documentos reales
      const totalRevenue = currentMonthDocs
        .filter(doc => doc.type === 'invoice')
        .reduce((sum, doc) => sum + (doc.total || 0), 0);
        
      // Clientes únicos
      const uniqueCustomers = new Set(
        currentMonthDocs
          .filter(doc => doc.customer && doc.customer.id)
          .map(doc => doc.customer.id)
      ).size;

      // Generar datos de ingresos por mes utilizando datos reales si existen
      // o mostrar los meses sin datos cuando no hay documentos
      const monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
      
      // Agrupar ingresos por mes (usando datos reales)
      const revenueByMonth: { [key: number]: number } = {};
      
      if (Array.isArray(documents)) {
        documents.forEach(doc => {
          if (doc && doc.date && doc.type === 'invoice' && doc.total) {
            const docDate = new Date(doc.date);
            const month = docDate.getMonth();
            const year = docDate.getFullYear();
            
            // Solo consideramos documentos del año actual
            if (year === currentYear) {
              if (!revenueByMonth[month]) {
                revenueByMonth[month] = 0;
              }
              revenueByMonth[month] += doc.total;
            }
          }
        });
      }
      
      // Crear datos del gráfico para todos los meses hasta el actual
      const monthlyRevenueData = [];
      for (let i = 0; i <= currentMonth; i++) {
        monthlyRevenueData.push({
          name: monthNames[i],
          ingresos: revenueByMonth[i] || 0
        });
      }
      
      // Datos para gráfico de pie
      const pieChartData = [
        { name: 'Pendientes', value: pendingQuotes || 0, color: '#818cf8' },
        { name: 'Aprobadas', value: approvedQuotes || 0, color: '#34d399' },
        { name: 'Facturas', value: totalInvoices || 0, color: '#f472b6' },
      ].filter(item => item.value > 0); // Solo mostrar segmentos con valor
      
      // Si no hay datos, agregar un placeholder
      if (pieChartData.length === 0) {
        pieChartData.push({ name: 'Sin datos', value: 1, color: '#e5e7eb' });
      }
      
      // Ordenar documentos recientes por fecha con comprobación de seguridad
      const recentDocuments = Array.isArray(documents) ? [...documents]
        .filter(doc => doc && doc.date) 
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5) : [];

      return {
        totalQuotes,
        approvedQuotes,
        pendingQuotes,
        totalInvoices,
        totalRevenue,
        uniqueCustomers,
        monthlyRevenueData,
        pieChartData,
        recentDocuments,
        // Flag para indicar si hay datos reales
        hasRealData: totalQuotes > 0 || totalInvoices > 0
      };
    } catch (error) {
      console.error("Error calculating dashboard data:", error);
      // Devolver datos predeterminados en caso de error
      return {
        totalQuotes: 0,
        approvedQuotes: 0,
        pendingQuotes: 0,
        totalInvoices: 0,
        totalRevenue: 0,
        uniqueCustomers: 0,
        monthlyRevenueData: [],
        pieChartData: [{ name: 'Sin datos', value: 1, color: '#e5e7eb' }],
        recentDocuments: [],
        hasRealData: false
      };
    }
  }, [documents]);

  // Animaciones para las tarjetas
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    },
    hover: { 
      y: -5,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 }
    }
  };

  // CAMBIO: En lugar de retornar null, mostramos un contenedor vacío mientras carga
  // para evitar problemas de desmontaje/montaje
  if (loading && !isLoaded) {
    return <div className="container mx-auto px-4 md:px-6 py-4 max-w-7xl"></div>;
  }

  // Renderizamos el panel con todos los datos
  return (
    <main className="container mx-auto px-4 md:px-6 py-4 max-w-7xl">
      <div className="space-y-8 px-1 py-4">
        {/* Encabezado con título */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <motion.h2 
            className="text-3xl font-bold tracking-tight"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Panel de control
            </span>
          </motion.h2>
          <motion.div
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Última actualización: {new Date().toLocaleDateString()}
          </motion.div>
        </div>

        {/* Tarjetas de estadísticas */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} whileHover="hover">
            <Card className="overflow-hidden border shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-md font-medium">Cotizaciones</CardTitle>
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <FileText size={18} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalQuotes}</div>
                <p className="text-xs text-muted-foreground">
                  Este mes
                </p>
              </CardContent>
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-blue-600" />
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover="hover">
            <Card className="overflow-hidden border shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-md font-medium">Aprobadas</CardTitle>
                  <div className="p-2 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle size={18} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.approvedQuotes}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.approvedQuotes > 0 && dashboardData.totalQuotes > 0 
                    ? `${Math.round((dashboardData.approvedQuotes / dashboardData.totalQuotes) * 100)}% del total`
                    : 'Sin datos'}
                </p>
              </CardContent>
              <div className="h-1 w-full bg-gradient-to-r from-green-500 to-green-600" />
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover="hover">
            <Card className="overflow-hidden border shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-md font-medium">Facturas</CardTitle>
                  <div className="p-2 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                    <FileCheck size={18} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalInvoices}</div>
                <p className="text-xs text-muted-foreground">
                  Este mes
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
                <div className="text-2xl font-bold">{formatCurrency(dashboardData.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  Facturado este mes
                </p>
              </CardContent>
              <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-cyan-600" />
            </Card>
          </motion.div>
        </motion.div>

        {/* Gráficos */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {/* Gráfico de ingresos por mes */}
          <Card className="border shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <BarChart2 size={18} className="text-blue-500" />
                  <span>Ingresos por Mes</span>
                </CardTitle>
              </div>
              <CardDescription>
                Distribución de ingresos mensuales
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData.monthlyRevenueData}
                    margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis 
                      fontSize={12} 
                      tickFormatter={(value) => {
                        if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                        return value;
                      }}
                    />
                    <RechartsTooltip 
                      formatter={(value: number) => [`${formatCurrency(value)}`, 'Ingresos']}
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        border: "1px solid #e5e7eb",
                        fontSize: "12px"
                      }}
                    />
                    <Bar 
                      dataKey="ingresos" 
                      name="Ingresos" 
                      fill="#38bdf8" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {!dashboardData.hasRealData && (
                <p className="text-xs text-center text-muted-foreground mt-4">
                  No hay datos de ingresos disponibles. Los ingresos se mostrarán aquí cuando cree facturas.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Gráfico circular */}
          <Card className="border shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <TrendingUp size={18} className="text-blue-500" />
                  <span>Distribución de Documentos</span>
                </CardTitle>
              </div>
              <CardDescription>
                Estado actual de cotizaciones y facturas
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                      strokeWidth={2}
                      stroke="#fff"
                    >
                      {dashboardData.pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value, name) => [value, name]}
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        border: "1px solid #e5e7eb",
                        fontSize: "12px"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {!dashboardData.hasRealData && (
                <p className="text-xs text-center text-muted-foreground mt-4">
                  No hay documentos creados. La distribución se mostrará cuando cree cotizaciones y facturas.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Documentos recientes */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="flex items-center">
            <Calendar size={18} className="mr-2 text-blue-500" />
            <h3 className="text-lg font-medium">Documentos Recientes</h3>
          </div>
          
          <Card className="border shadow-md">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {!dashboardData.recentDocuments || dashboardData.recentDocuments.length === 0 ? (
                  <div className="py-6 text-center text-muted-foreground">
                    No hay documentos recientes
                  </div>
                ) : (
                  dashboardData.recentDocuments.map((doc, index) => (
                    <motion.div 
                      key={doc.id || index} 
                      className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0, 
                        transition: { delay: 0.1 * index + 0.8 } 
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div 
                          className={`p-2 rounded-lg shrink-0 ${
                            doc.type === 'quote' 
                              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                              : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                          }`}
                        >
                          {doc.type === 'quote' 
                            ? <FileText size={16} /> 
                            : <FileCheck size={16} />
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{doc.documentNumber || `#${index + 1}`}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {doc.customer?.name || 'Cliente'} - {doc.date ? new Date(doc.date).toLocaleDateString() : 'Sin fecha'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(doc.total || 0)}</p>
                          <span 
                            className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                              doc.status === 'approved' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}
                          >
                            {doc.status === 'approved' ? 'Aprobado' : 'Pendiente'}
                          </span>
                        </div>
                        <div>
                          {doc.status === 'pending' ? (
                            <Clock size={16} className="text-amber-500" />
                          ) : (
                            <CheckCircle size={16} className="text-green-500" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
};

export default DashboardPage;
