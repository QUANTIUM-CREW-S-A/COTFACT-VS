import React, { useState } from 'react';
import { runDiagnostics } from '@/utils/systemTests';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

type DiagnosticStatus = 'idle' | 'running' | 'success' | 'error';
type DiagnosticResults = {
  database: boolean;
  httpMethods: boolean;
  session: boolean;
  customers: boolean;
  settings: boolean;
  export: boolean;
  general: boolean;
};

const ConnectionDiagnostic: React.FC = () => {
  const [status, setStatus] = useState<DiagnosticStatus>('idle');
  const [results, setResults] = useState<DiagnosticResults | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const runTests = async () => {
    setStatus('running');
    setLogs([]);
    setResults(null);

    // Capturar logs para mostrar en la interfaz
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    try {
      // Override console.log to capture logs
      console.log = (...args) => {
        originalConsoleLog(...args);
        setLogs(prev => [...prev, args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ')]);
      };

      console.error = (...args) => {
        originalConsoleError(...args);
        setLogs(prev => [...prev, `ERROR: ${args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ')}`]);
      };

      console.warn = (...args) => {
        originalConsoleWarn(...args);
        setLogs(prev => [...prev, `ADVERTENCIA: ${args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ')}`]);
      };

      // Ejecutar diagnósticos
      await runDiagnostics();
      
      // Extraer resultados de los logs
      const newResults = {
        database: !logs.some(log => log.includes('Error al verificar la conexión a la base de datos')),
        httpMethods: !logs.some(log => log.includes('Error al verificar los métodos HTTP')),
        session: !logs.some(log => log.includes('Error al verificar la sesión de usuario')),
        customers: !logs.some(log => log.includes('Error al verificar la sección de clientes')),
        settings: !logs.some(log => log.includes('Error al verificar la sección de configuración')),
        export: !logs.some(log => log.includes('Error al verificar la funcionalidad de exportación')),
        general: !logs.some(log => log.includes('Error crítico durante el diagnóstico'))
      };
      
      setResults(newResults);
      setStatus(Object.values(newResults).every(Boolean) ? 'success' : 'error');

    } catch (error) {
      console.error('Error ejecutando pruebas:', error);
      setStatus('error');
    } finally {
      // Restaurar las funciones originales de consola
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status === 'success' && <CheckCircle2 className="text-green-500" />}
          {status === 'error' && <XCircle className="text-red-500" />}
          {status === 'running' && <Loader2 className="animate-spin text-blue-500" />}
          {status === 'idle' && <AlertTriangle className="text-amber-500" />}
          Diagnóstico del Sistema
        </CardTitle>
        <CardDescription>
          Ejecute este diagnóstico para verificar todas las funcionalidades del sistema
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {status === 'idle' && (
          <div className="text-center py-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Este diagnóstico verificará la conexión a la base de datos, métodos HTTP, 
              sesión de usuario, y el funcionamiento de todas las áreas de la aplicación.
            </p>
          </div>
        )}
        
        {status === 'running' && (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="animate-spin h-10 w-10 text-blue-500 mb-4" />
            <p>Ejecutando pruebas del sistema...</p>
          </div>
        )}
        
        {status === 'success' && results && (
          <div className="space-y-3">
            <h3 className="text-green-600 font-medium text-lg">✅ Sistema funcionando correctamente</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" /> 
                Conexión a la base de datos
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" /> 
                Métodos HTTP (GET, POST, PUT, DELETE)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" /> 
                Sesión de usuario persistente
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" /> 
                Acceso al área de clientes
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" /> 
                Acceso a la configuración
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" /> 
                Funcionalidad de exportación
              </li>
            </ul>
          </div>
        )}
        
        {status === 'error' && results && (
          <div className="space-y-3">
            <h3 className="text-red-600 font-medium text-lg">⚠️ Se han detectado problemas</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                {results.database ? 
                  <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
                  <XCircle className="h-5 w-5 text-red-500" />} 
                Conexión a la base de datos
              </li>
              <li className="flex items-center gap-2">
                {results.httpMethods ? 
                  <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
                  <XCircle className="h-5 w-5 text-red-500" />} 
                Métodos HTTP (GET, POST, PUT, DELETE)
              </li>
              <li className="flex items-center gap-2">
                {results.session ? 
                  <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
                  <XCircle className="h-5 w-5 text-red-500" />} 
                Sesión de usuario persistente
              </li>
              <li className="flex items-center gap-2">
                {results.customers ? 
                  <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
                  <XCircle className="h-5 w-5 text-red-500" />} 
                Acceso al área de clientes
              </li>
              <li className="flex items-center gap-2">
                {results.settings ? 
                  <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
                  <XCircle className="h-5 w-5 text-red-500" />} 
                Acceso a la configuración
              </li>
              <li className="flex items-center gap-2">
                {results.export ? 
                  <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
                  <XCircle className="h-5 w-5 text-red-500" />} 
                Funcionalidad de exportación
              </li>
            </ul>
          </div>
        )}
        
        {/* Log viewer */}
        {logs.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Registro de diagnóstico</h4>
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-blue-600 hover:underline"
              >
                {isExpanded ? 'Ocultar detalles' : 'Mostrar detalles'}
              </button>
            </div>
            
            {isExpanded && (
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-xs overflow-auto max-h-64">
                {logs.map((log, i) => (
                  <div key={i} className={`${
                    log.startsWith('ERROR') 
                      ? 'text-red-500' 
                      : log.startsWith('ADVERTENCIA')
                        ? 'text-amber-500'
                        : log.includes('✅')
                          ? 'text-green-500'
                          : ''
                  }`}>
                    {log}
                  </div>
                ))}
              </pre>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Recargar página
        </Button>
        <Button onClick={runTests} disabled={status === 'running'}>
          {status === 'running' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {status === 'idle' && 'Ejecutar diagnóstico'}
          {status === 'success' && 'Ejecutar nuevamente'}
          {status === 'error' && 'Reintentar'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConnectionDiagnostic;