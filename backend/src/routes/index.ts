// Crear un archivo de índice para registrar todas las rutas de la aplicación

import { Express } from 'express';
import documentRoutes from './documentRoutes';

export function registerRoutes(app: Express) {
  app.use('/documents', documentRoutes);
  // Agregar más rutas aquí
}