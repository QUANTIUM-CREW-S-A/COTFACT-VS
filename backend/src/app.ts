import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { registerRoutes } from './routes/index';
import { connectToDatabase } from './db/connection';
import { sanitizeInputs } from './middleware/validationMiddleware';
import { rateLimiters } from './middleware/rateLimitMiddleware';
import { securityHeaders, requestTimeout, apiUsageTracking, logUnauthorizedAccessMiddleware } from './middleware/securityMiddleware';
import path from 'path';
import os from 'os'; // Importamos el módulo os para obtener interfaces de red

// Cargar variables de entorno
dotenv.config();

const app = express();
const initialPort = process.env.PORT ? parseInt(process.env.PORT) : 3001;
let port = initialPort;

// Obtener la dirección IP del servidor
const getLocalIpAddress = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      // Saltar direcciones internal y non-ipv4
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1'; // Fallback a IP local si no se encuentra una
};

const HOST_IP = process.env.HOST_IP || getLocalIpAddress();

// Security enhancements
// Apply helmet for basic security headers
app.use(helmet());

// Apply custom security headers
app.use(securityHeaders());

// Add request timeout to prevent hanging connections
app.use(requestTimeout(30000)); // 30 seconds timeout

// Configuración CORS mejorada para asegurar conexión con el frontend
const corsOptions = {
  origin: true, // Permitir cualquier origen (o puedes configurar dominios específicos)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Accept', 
    'Origin', 
    'X-Requested-With',
    'X-HTTP-Method-Override',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Headers',
    'Cache-Control'
  ],
  exposedHeaders: ['Content-Length', 'X-RateLimit-Reset', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Aplicar CORS a nivel de aplicación
app.use(cors(corsOptions));

// Permitir específicamente OPTIONS para preflight
app.options('*', cors(corsOptions));

// Middleware adicional para asegurar headers CORS en todas las respuestas
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  next();
});

// Parse JSON and apply input sanitization
app.use(express.json());
app.use(sanitizeInputs());

// Apply general rate limiting to all routes
app.use(rateLimiters.api);

// Apply specific rate limiting to authentication routes
app.use('/api/auth', rateLimiters.auth);
app.use('/api/auth/password/reset-request', rateLimiters.passwordReset);

// API usage tracking
app.use(apiUsageTracking());

// Ensure logs directory exists
const logDir = path.join(__dirname, '..', 'logs');
try {
  require('fs').mkdirSync(logDir, { recursive: true });
} catch (error) {
  console.warn(`Could not create logs directory: ${error}`);
}

// Endpoint de health check para verificar si el servidor está activo
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Servidor API funcionando correctamente',
    timestamp: new Date().toISOString(),
    host: HOST_IP 
  });
});

// Endpoint adicional para diagnóstico de conexión
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API Health check',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    host: HOST_IP
  });
});

// Endpoint para pruebas de API simple
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API está respondiendo correctamente',
    timestamp: new Date().toISOString(),
    host: HOST_IP
  });
});

// Registrar rutas
registerRoutes(app);

// Error handling middleware
app.use(logUnauthorizedAccessMiddleware());

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `The requested resource '${req.path}' was not found on this server`
  });
});

// Global error handler with proper TypeScript types
app.use((err: Error & { statusCode?: number }, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  console.error(`Error ${statusCode}: ${err.message}`);
  
  // Don't leak error details in production
  const errorResponse = process.env.NODE_ENV === 'production'
    ? { error: 'Internal Server Error' }
    : { error: err.message, stack: err.stack };
  
  res.status(statusCode).json(errorResponse);
});

// Function to try starting server on a given port
const tryListenOnPort = (attemptPort: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const server = app.listen(attemptPort, HOST_IP)
      .on('listening', () => {
        console.log(`Servidor corriendo en http://${HOST_IP}:${attemptPort}`);
        resolve(attemptPort);
      })
      .on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Puerto ${attemptPort} ya está en uso, intentando otro puerto...`);
          server.close();
          // Try next port
          resolve(tryListenOnPort(attemptPort + 1));
        } else {
          reject(err);
        }
      });
  });
};

// Punto de entrada de la aplicación
const startServer = async () => {
  try {
    // Intentar conectar a la base de datos
    const dbConnected = await connectToDatabase();
    
    if (!dbConnected) {
      console.error('No se pudo conectar a la base de datos. Servidor no iniciado.');
      process.exit(1);
    }
    
    // Start the server with automatic port retry logic
    port = await tryListenOnPort(initialPort);
    
    console.log(`Backend disponible en la dirección IP: ${HOST_IP}:${port}`);
    console.log('Para conexiones desde otros dispositivos, usa esta IP en lugar de localhost');
    
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();

export default app;