import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { registerRoutes } from './routes/index';
import { connectToDatabase } from './db/connection';

// Cargar variables de entorno
dotenv.config();

const app = express();
const initialPort = process.env.PORT ? parseInt(process.env.PORT) : 3001;
let port = initialPort;

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

app.use(express.json());

// Endpoint de health check para verificar si el servidor está activo
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Servidor API funcionando correctamente',
    timestamp: new Date().toISOString() 
  });
});

// Endpoint adicional para diagnóstico de conexión
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API Health check',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Endpoint para pruebas de API simple
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API está respondiendo correctamente',
    timestamp: new Date().toISOString()
  });
});

// Registrar rutas
registerRoutes(app);

// Function to try starting server on a given port
const tryListenOnPort = (attemptPort: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const server = app.listen(attemptPort)
      .on('listening', () => {
        console.log(`Servidor corriendo en http://localhost:${attemptPort}`);
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
    
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();

export default app;