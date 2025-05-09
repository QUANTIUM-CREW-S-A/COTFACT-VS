// Crear un archivo de índice para registrar todas las rutas de la aplicación

import { Express } from 'express';
import documentRoutes from './documentRoutes';
import authRoutes from './authRoutes';
import customerRoutes from './customerRoutes';

export function registerRoutes(app: Express) {
  app.use('/documents', documentRoutes);
  app.use('/auth', authRoutes); // Ruta para autenticación
  app.use('/customers', customerRoutes); // Nuevas rutas para clientes
  // Agregar más rutas aquí
}