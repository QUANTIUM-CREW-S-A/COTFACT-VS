import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Document } from '@/types';
import { 
  FileText, FileCheck, DollarSign, 
  Users, BarChart2, Calendar,
  TrendingUp, CheckCircle, Clock
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader,
  CardTitle 
} from "@/components/ui/card";

// Este componente implementa el dashboard moderno con animaciones y gráficos mejorados
const ModernDashboard: React.FC<{ documents: Document[] }> = ({ documents = [] }) => {
  // Datos para los gráficos y estadísticas
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const monthStart = new Date(currentYear, currentMonth, 1);
  
  // Filtrar documentos del mes actual
  const currentMonthDocs = documents.filter(doc => new Date(doc.date) >= monthStart);
  
  // Estadísticas
  const totalQuotes = currentMonthDocs.filter(doc => doc.type === 'quote').length;
  const approvedQuotes = currentMonthDocs.filter(doc => doc.type === 'quote' && doc.status === 'approved').length;
  const pendingQuotes = currentMonthDocs.filter(doc => doc.type === 'quote' && doc.status === 'pending').length;
  const totalInvoices = currentMonthDocs.filter(doc => doc.type === 'invoice').length;
  
  const totalRevenue = currentMonthDocs
    .filter(doc => doc.type === 'invoice')
    .reduce((sum, doc) => sum + doc.total, 0);
    
  // Clientes únicos
  const uniqueCustomers = new Set(currentMonthDocs.map(doc => doc.customer?.id)).size;
    
  // Datos para gráfico de área
  const areaChartData = [
    { name: 'ENE', quotes: 4, invoices: 2 },
    { name: 'FEB', quotes: 6, invoices: 3 },
    { name: 'MAR', quotes: 5, invoices: 4 },
    { name: 'ABR', quotes: totalQuotes, invoices: totalInvoices },
  ];
  
  // Datos para gráfico de pie
  const pieChartData = [
    { name: 'Pendientes', value: pendingQuotes || 2, color: '#818cf8' },
    { name: 'Aprobadas', value: approvedQuotes || 3, color: '#34d399' },
    { name: 'Facturas', value: totalInvoices || 4, color: '#f472b6' },
  ];
  
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PA', { 
      style: 'currency', 
      currency: 'PAB',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Ordenar documentos recientes por fecha
  const recentDocuments = [...documents]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 px-1 py-4">
      {/* Encabezado con título */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <motion.h2 
          className="text-3xl font-bold tracking-tight"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="bg-gradient-to-r from-primary to-indigo-600 dark:from-primary dark:to-indigo-400 bg-clip-text text-transparent">
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
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-background to-blue-50/5 dark:from-background dark:to-blue-950/10 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-md font-medium">Cotizaciones</CardTitle>
                <div className="p-2 rounded-full bg-blue-100/80 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <FileText size={18} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQuotes}</div>
              <p className="text-xs text-muted-foreground">
                Este mes
              </p>
            </CardContent>
            <div className="h-1 w-full bg-gradient-to-r from-blue-500/80 to-blue-600/80" />
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover="hover">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-background to-green-50/5 dark:from-background dark:to-green-950/10 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-md font-medium">Aprobadas</CardTitle>
                <div className="p-2 rounded-full bg-green-100/80 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle size={18} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedQuotes}</div>
              <p className="text-xs text-muted-foreground">
                {approvedQuotes > 0 && totalQuotes > 0 
                  ? `${Math.round((approvedQuotes / totalQuotes) * 100)}% del total`
                  : 'Sin datos'}
              </p>
            </CardContent>
            <div className="h-1 w-full bg-gradient-to-r from-green-500/80 to-green-600/80" />
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover="hover">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-background to-purple-50/5 dark:from-background dark:to-purple-950/10 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-md font-medium">Facturas</CardTitle>
                <div className="p-2 rounded-full bg-purple-100/80 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <FileCheck size={18} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInvoices}</div>
              <p className="text-xs text-muted-foreground">
                Este mes
              </p>
            </CardContent>
            <div className="h-1 w-full bg-gradient-to-r from-purple-500/80 to-purple-600/80" />
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover="hover">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-background to-cyan-50/5 dark:from-background dark:to-cyan-950/10 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-md font-medium">Ingresos</CardTitle>
                <div className="p-2 rounded-full bg-cyan-100/80 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400">
                  <DollarSign size={18} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue || 5250)}</div>
              <p className="text-xs text-muted-foreground">
                Facturado este mes
              </p>
            </CardContent>
            <div className="h-1 w-full bg-gradient-to-r from-cyan-500/80 to-cyan-600/80" />
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
        {/* Gráfico de área */}
        <Card className="border shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <BarChart2 size={18} className="text-primary" />
                <span>Evolución de Documentos</span>
              </CardTitle>
            </div>
            <CardDescription>
              Comparativa de cotizaciones y facturas
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={areaChartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorQuotes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.15}/>
                    </linearGradient>
                    <linearGradient id="colorInvoices" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f472b6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f472b6" stopOpacity={0.15}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                  <XAxis dataKey="name" fontSize={12} stroke="var(--muted-foreground)" />
                  <YAxis fontSize={12} stroke="var(--muted-foreground)" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      borderRadius: "8px",
                      boxShadow: "var(--shadow)",
                      border: "1px solid var(--border)",
                      fontSize: "12px",
                      color: "var(--foreground)"
                    }}
                  />
                  <Area type="monotone" dataKey="quotes" name="Cotizaciones" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorQuotes)" />
                  <Area type="monotone" dataKey="invoices" name="Facturas" stroke="#f472b6" fillOpacity={1} fill="url(#colorInvoices)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico circular */}
        <Card className="border shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <TrendingUp size={18} className="text-primary" />
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
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={2}
                    stroke="var(--background)"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value, name]}
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      borderRadius: "8px",
                      boxShadow: "var(--shadow)",
                      border: "1px solid var(--border)",
                      fontSize: "12px",
                      color: "var(--foreground)"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
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
          <Calendar size={18} className="mr-2 text-primary" />
          <h3 className="text-lg font-medium">Documentos Recientes</h3>
        </div>
        
        <Card className="border shadow-md">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentDocuments.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground">
                  No hay documentos recientes
                </div>
              ) : (
                recentDocuments.map((doc, index) => (
                  <motion.div 
                    key={doc.id} 
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      transition: { delay: 0.1 * index + 0.8 } 
                    }}
                    whileHover={{ backgroundColor: "var(--muted)" }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className={`p-2 rounded-lg shrink-0 ${
                          doc.type === 'quote' 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-purple-500/10 text-purple-500 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}
                      >
                        {doc.type === 'quote' 
                          ? <FileText size={16} /> 
                          : <FileCheck size={16} />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{doc.documentNumber}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {doc.customer?.name || 'Cliente'} - {new Date(doc.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(doc.total)}</p>
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
  );
};

export default ModernDashboard;