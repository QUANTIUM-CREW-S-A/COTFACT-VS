import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { checkConnectionStatus, checkServerConnection, checkDatabaseConnection } from '@/services/api/connectivity';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  ArrowRight, 
  Check, 
  Cloud, 
  CloudOff, 
  Database, 
  Loader2, 
  PlusCircle, 
  RefreshCw, 
  Server, 
  Trash2, 
  Wifi, 
  WifiOff 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ConnectionDiagnostic = () => {
  const [activeTab, setActiveTab] = useState("status");
  const [apiUrls, setApiUrls] = useState<string[]>([
    'http://localhost:3001',
    'http://127.0.0.1:3001', 
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3002'
  ]);
  const [endpoints, setEndpoints] = useState<string[]>([
    '/health',
    '/',
    '/api/health',
    '/api/status',
    '/status'
  ]);
  const [newUrl, setNewUrl] = useState('');
  const [newEndpoint, setNewEndpoint] = useState('');
  const [results, setResults] = useState<{ url: string; endpoint?: string; status: string; message: string; headers?: any }[]>([]);
  const [loading, setLoading] = useState<{ all: boolean; db: boolean; api: boolean }>({
    all: false,
    db: false,
    api: false
  });
  const [connectionInfo, setConnectionInfo] = useState<{
    database: { connected: boolean; status: string };
    server: { connected: boolean; url: string; status: string };
    overall: string;
  }>({
    database: { connected: false, status: 'Sin verificar' },
    server: { connected: false, url: '', status: 'Sin verificar' },
    overall: 'Sin verificar'
  });

  // Verificar las conexiones al montar el componente
  useEffect(() => {
    checkAllConnections();
  }, []);

  /**
   * Función mejorada para probar la conexión a un endpoint específico
   */
  const testConnection = async (url: string, endpoint: string = '/health') => {
    try {
      console.log(`Probando conexión a ${url}${endpoint}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const fullUrl = `${url}${endpoint}`;
      
      const response = await fetch(fullUrl, {
        signal: controller.signal,
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store'
        },
        credentials: 'omit',
        cache: 'no-store',
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      
      let data;
      let headers = {};
      
      // Extraer headers
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      
      try {
        data = await response.json();
      } catch(e) {
        data = { error: 'No se pudo parsear la respuesta como JSON' };
      }
      
      return {
        url,
        endpoint,
        status: response.ok ? 'success' : 'error',
        message: `${response.status} ${response.statusText} - ${JSON.stringify(data)}`,
        headers
      };
    } catch (error) {
      console.error(`Error conectando a ${url}${endpoint}:`, error);
      
      // Información de diagnóstico mejorada
      let diagnosticInfo = '';
      
      if (error.name === 'AbortError') {
        diagnosticInfo = 'La conexión excedió el tiempo de espera (5 segundos)';
      } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        diagnosticInfo = `
          Error de red: El servidor podría estar caído o no responder.
          * Si el servidor está en el mismo equipo, verifica que esté iniciado.
          * Posibles causas: firewall, CORS, o servidor no disponible.
        `;
      }
      
      return {
        url,
        endpoint,
        status: 'error',
        message: `${error instanceof Error ? error.message : String(error)} ${diagnosticInfo}`,
      };
    }
  };

  /**
   * Probar todas las combinaciones de URL y endpoints
   */
  const testAllConnections = async () => {
    setResults([]);
    setLoading(prev => ({ ...prev, all: true }));
    
    const allResults = [];
    
    // Probar todas las combinaciones de URLs y endpoints
    for (const url of apiUrls) {
      for (const endpoint of endpoints) {
        const result = await testConnection(url, endpoint);
        allResults.push(result);
        setResults(prev => [...prev, result]);
        
        // Si encontramos una conexión exitosa, no necesitamos seguir probando
        if (result.status === 'success') {
          setConnectionInfo(prev => ({
            ...prev,
            server: { 
              connected: true, 
              url, 
              status: 'Conectado' 
            },
            overall: prev.database.connected ? 'Completamente conectado' : 'Conexión parcial'
          }));
          break;
        }
      }
    }
    
    setLoading(prev => ({ ...prev, all: false }));
    return allResults;
  };

  const checkDbConnection = async () => {
    setLoading(prev => ({ ...prev, db: true }));
    try {
      const dbStatus = await checkDatabaseConnection();
      setConnectionInfo(prev => ({
        ...prev,
        database: { 
          connected: dbStatus.connected, 
          status: dbStatus.connected ? 'Conectada' : 'Desconectada' 
        },
        overall: dbStatus.connected && prev.server.connected
          ? 'Completamente conectado'
          : !dbStatus.connected && !prev.server.connected
            ? 'Sin conexión'
            : 'Conexión parcial'
      }));
    } catch (error) {
      console.error('Error verificando la conexión a la base de datos:', error);
      setConnectionInfo(prev => ({
        ...prev,
        database: { connected: false, status: 'Error al conectar' },
        overall: prev.server.connected ? 'Conexión parcial' : 'Sin conexión'
      }));
    } finally {
      setLoading(prev => ({ ...prev, db: false }));
    }
  };
  
  const checkApiConnection = async () => {
    setLoading(prev => ({ ...prev, api: true }));
    try {
      const serverStatus = await checkServerConnection(apiUrls);
      setConnectionInfo(prev => ({
        ...prev,
        server: { 
          connected: serverStatus.connected, 
          url: serverStatus.url,
          status: serverStatus.connected ? 'Conectado' : 'Desconectado' 
        },
        overall: serverStatus.connected && prev.database.connected
          ? 'Completamente conectado'
          : !serverStatus.connected && !prev.database.connected
            ? 'Sin conexión'
            : 'Conexión parcial'
      }));
    } catch (error) {
      console.error('Error verificando la conexión al servidor API:', error);
      setConnectionInfo(prev => ({
        ...prev,
        server: { connected: false, url: '', status: 'Error al conectar' },
        overall: prev.database.connected ? 'Conexión parcial' : 'Sin conexión'
      }));
    } finally {
      setLoading(prev => ({ ...prev, api: false }));
    }
  };
  
  const checkAllConnections = async () => {
    setLoading({ all: true, db: true, api: true });
    try {
      const status = await checkConnectionStatus();
      
      setConnectionInfo({
        database: { 
          connected: status.database.connected, 
          status: status.database.connected ? 'Conectada' : 'Desconectada' 
        },
        server: { 
          connected: status.server.connected, 
          url: status.server.url,
          status: status.server.connected ? 'Conectado' : 'Desconectado' 
        },
        overall: status.mode === 'online' 
          ? 'Completamente conectado'
          : status.mode === 'offline' 
            ? 'Sin conexión'
            : 'Conexión parcial'
      });
    } catch (error) {
      console.error('Error verificando conexiones:', error);
      setConnectionInfo({
        database: { connected: false, status: 'Error al conectar' },
        server: { connected: false, url: '', status: 'Error al conectar' },
        overall: 'Error al verificar conexiones'
      });
    } finally {
      setLoading({ all: false, db: false, api: false });
    }
  };

  const addNewUrl = () => {
    if (newUrl && !apiUrls.includes(newUrl)) {
      // Validar formato básico de URL
      try {
        new URL(newUrl);
        setApiUrls(prev => [...prev, newUrl]);
        setNewUrl('');
      } catch (e) {
        // Si no es una URL válida, añadir http:// por defecto
        const urlWithProtocol = `http://${newUrl}`;
        try {
          new URL(urlWithProtocol);
          setApiUrls(prev => [...prev, urlWithProtocol]);
          setNewUrl('');
        } catch (e) {
          // Si sigue sin ser válida, simplemente no hacer nada
        }
      }
    }
  };
  
  const removeUrl = (urlToRemove: string) => {
    setApiUrls(prev => prev.filter(url => url !== urlToRemove));
  };
  
  const addNewEndpoint = () => {
    if (newEndpoint && !endpoints.includes(newEndpoint)) {
      // Asegurarse de que el endpoint comience con /
      const formattedEndpoint = newEndpoint.startsWith('/') 
        ? newEndpoint 
        : `/${newEndpoint}`;
      
      setEndpoints(prev => [...prev, formattedEndpoint]);
      setNewEndpoint('');
    }
  };
  
  const removeEndpoint = (endpointToRemove: string) => {
    setEndpoints(prev => prev.filter(endpoint => endpoint !== endpointToRemove));
  };

  // Componente para visualizar el estado general de conexión con una animación
  const ConnectionStatusIndicator = () => {
    const getStatusIcon = () => {
      if (loading.all) {
        return <Loader2 className="h-10 w-10 animate-spin text-blue-500" />;
      } else if (connectionInfo.database.connected && connectionInfo.server.connected) {
        return <Cloud className="h-10 w-10 text-green-500" />;
      } else if (!connectionInfo.database.connected && !connectionInfo.server.connected) {
        return <CloudOff className="h-10 w-10 text-red-500" />;
      } else {
        return <AlertCircle className="h-10 w-10 text-amber-500" />;
      }
    };

    // Clase de color para el círculo según el estado
    const getStatusCircleClass = () => {
      if (loading.all) {
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20";
      } else if (connectionInfo.database.connected && connectionInfo.server.connected) {
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20";
      } else if (!connectionInfo.database.connected && !connectionInfo.server.connected) {
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20";
      } else {
        return "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20";
      }
    };

    return (
      <div className="flex flex-col items-center justify-center py-6">
        <div className={`rounded-full p-6 border-2 ${getStatusCircleClass()} flex items-center justify-center mb-4 shadow-sm`}>
          {getStatusIcon()}
        </div>
        <h3 className="text-xl font-semibold mb-1">{connectionInfo.overall}</h3>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          {connectionInfo.overall === 'Completamente conectado'
            ? 'La aplicación está conectada a todos los servicios. Todas las funcionalidades están disponibles.'
            : connectionInfo.overall === 'Sin conexión'
              ? 'No hay conexión a los servicios. La aplicación está funcionando en modo local.'
              : 'Hay conexión parcial a los servicios. Algunas funcionalidades pueden estar limitadas.'}
        </p>
      </div>
    );
  };

  return (
    <Card className="w-full border-2 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Wifi className="h-5 w-5 text-primary" />
          Diagnóstico de Conexión
        </CardTitle>
        <CardDescription>
          Verifica y monitorea el estado de conexión con los servicios de la aplicación
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-6">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="status" className="flex gap-2">
              <Cloud className="h-4 w-4" />
              <span>Estado de Conexión</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex gap-2">
              <Server className="h-4 w-4" />
              <span>Diagnóstico Avanzado</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <CardContent>
          <TabsContent value="status" className="space-y-6 mt-0">
            {/* Vista general de estado */}
            <ConnectionStatusIndicator />
            
            <div className="grid gap-4 md:grid-cols-2">
              {/* Estado de Base de datos */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" /> 
                    Base de datos
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <Badge 
                        variant={connectionInfo.database.connected ? "outline" : "secondary"} 
                        className={`${connectionInfo.database.connected ? 'bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:bg-red-900/30 dark:text-red-400'}`}
                      >
                        {loading.db ? (
                          <span className="flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Verificando...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            {connectionInfo.database.connected ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <WifiOff className="h-3 w-3" />
                            )}
                            {connectionInfo.database.status}
                          </span>
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {connectionInfo.database.connected 
                        ? 'La aplicación puede almacenar y sincronizar datos en la nube' 
                        : 'La aplicación está utilizando almacenamiento local'}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={checkDbConnection}
                      disabled={loading.db}
                      className="self-end"
                    >
                      {loading.db && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
                      Verificar conexión
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Estado de API */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Server className="h-4 w-4 text-primary" /> 
                    Servidor API
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <Badge 
                        variant={connectionInfo.server.connected ? "outline" : "secondary"} 
                        className={`${connectionInfo.server.connected ? 'bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:bg-red-900/30 dark:text-red-400'}`}
                      >
                        {loading.api ? (
                          <span className="flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Verificando...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            {connectionInfo.server.connected ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <WifiOff className="h-3 w-3" />
                            )}
                            {connectionInfo.server.status}
                          </span>
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {connectionInfo.server.connected 
                        ? `Conectado a: ${connectionInfo.server.url || 'API'}` 
                        : 'No se pudo conectar al servidor API'}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={checkApiConnection}
                      disabled={loading.api}
                      className="self-end"
                    >
                      {loading.api && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
                      Verificar conexión
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center mt-2">
              <Button 
                onClick={checkAllConnections} 
                variant="default"
                disabled={loading.all}
                className="gap-2"
              >
                {loading.all ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Verificar todas las conexiones
              </Button>
            </div>
            
            <Alert variant="default" className="bg-card mt-6">
              <AlertTitle className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Información importante
              </AlertTitle>
              <AlertDescription>
                <p>Si está trabajando en modo local, todos los datos se guardarán en su navegador y se sincronizarán cuando se restaure la conexión.</p>
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="advanced" className="mt-0">
            <div className="space-y-6">
              {/* Configuración de URLs */}
              <div className="bg-muted/50 p-4 rounded-lg border border-border shadow-sm">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  Configuración de pruebas API
                </h3>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Gestión de URLs */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <ArrowRight className="h-3.5 w-3.5 text-primary" />
                      URLs del servidor
                    </h4>
                    <div className="flex space-x-2">
                      <Input
                        value={newUrl}
                        onChange={e => setNewUrl(e.target.value)}
                        placeholder="http://localhost:3001"
                        className="flex-1"
                      />
                      <Button onClick={addNewUrl} size="icon" variant="outline">
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                      {apiUrls.map((url, index) => (
                        <div 
                          key={index} 
                          className="group flex items-center justify-between p-2 rounded border border-border bg-background"
                        >
                          <span className="text-sm font-mono text-muted-foreground truncate">{url}</span>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => removeUrl(url)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Gestión de Endpoints */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <ArrowRight className="h-3.5 w-3.5 text-primary" />
                      Endpoints a probar
                    </h4>
                    <div className="flex space-x-2">
                      <Input
                        value={newEndpoint}
                        onChange={e => setNewEndpoint(e.target.value)}
                        placeholder="/health o /api/status"
                        className="flex-1"
                      />
                      <Button onClick={addNewEndpoint} size="icon" variant="outline">
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                      {endpoints.map((endpoint, index) => (
                        <div 
                          key={index} 
                          className="group flex items-center justify-between p-2 rounded border border-border bg-background"
                        >
                          <span className="text-sm font-mono text-muted-foreground">{endpoint}</span>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => removeEndpoint(endpoint)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={testAllConnections} 
                    disabled={loading.all || apiUrls.length === 0 || endpoints.length === 0}
                    className="gap-2"
                  >
                    {loading.all ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Server className="h-4 w-4" />
                    )}
                    Probar conexiones
                  </Button>
                </div>
              </div>
              
              {/* Resultados de pruebas */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  Resultados de pruebas
                </h3>

                {results.length === 0 ? (
                  <div className="text-center p-8 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
                    <p className="text-muted-foreground">No hay resultados aún. Ejecute pruebas para ver los resultados.</p>
                  </div>
                ) : (
                  <div className="border rounded-lg shadow-sm overflow-hidden">
                    <div className="max-h-80 overflow-y-auto">
                      <div className="divide-y border-b">
                        {results.map((result, index) => (
                          <div 
                            key={index} 
                            className={`p-3 ${
                              result.status === 'success' 
                                ? 'bg-green-50 dark:bg-green-900/10' 
                                : 'bg-red-50 dark:bg-red-900/10'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div className="mt-1">
                                {result.status === 'success' ? (
                                  <Check className="h-5 w-5 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-5 w-5 text-red-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-medium">
                                    {result.url}{result.endpoint}
                                  </h4>
                                  <Badge 
                                    variant="outline" 
                                    className={result.status === 'success' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                    }
                                  >
                                    {result.status === 'success' ? 'Éxito' : 'Error'}
                                  </Badge>
                                </div>
                                <p className="text-xs font-mono mt-1 bg-background/80 p-2 rounded border overflow-x-auto max-w-full whitespace-pre-wrap">
                                  {result.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-muted/30 p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {results.filter(r => r.status === 'success').length} éxitos, {results.filter(r => r.status === 'error').length} errores
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setResults([])}
                        >
                          Limpiar resultados
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <Alert variant="default" className="bg-card">
                <AlertTitle className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Diagnóstico de errores
                </AlertTitle>
                <AlertDescription className="space-y-2">
                  <p><strong>Failed to fetch</strong>: Generalmente indica un problema de CORS o que el servidor no está respondiendo.</p>
                  <p><strong>NetworkError</strong>: Verifica que el servidor esté iniciado y sea accesible desde esta máquina.</p>
                  <p><strong>Conexión rechazada</strong>: El servidor puede estar bloqueando conexiones entrantes. Revisa la configuración del firewall.</p>
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>

      <CardFooter>
        <div className="w-full flex justify-between items-center text-xs text-muted-foreground">
          <span>Última verificación: {new Date().toLocaleTimeString()}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs px-2 gap-1" 
            onClick={checkAllConnections}
          >
            <RefreshCw className="h-3 w-3" />
            Actualizar
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ConnectionDiagnostic;