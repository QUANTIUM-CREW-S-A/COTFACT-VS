// Crear un archivo de índice para registrar todas las rutas de la aplicación

import { Express } from 'express';
import documentRoutes from './documentRoutes';
import authRoutes from './authRoutes';

export function registerRoutes(app: Express) {
  app.use('/documents', documentRoutes);
  app.use('/auth', authRoutes); // Nueva ruta para autenticación
  // Agregar más rutas aquí
}