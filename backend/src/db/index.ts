/*
 * Configuración de la conexión a la base de datos PostgreSQL.
 * Utiliza variables de entorno para los parámetros de conexión.
 * Exporta métodos para realizar consultas y el pool de conexiones para operaciones avanzadas.
 */
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'viang_app',
  password: process.env.PGPASSWORD || '3Jenox099ng@@',
  port: parseInt(process.env.PGPORT || '5432'),
});

export default {
  query: (text: string, params?: any[]) => pool.query(text, params),
  client: pool  // Exportando el pool como client para permitir conexiones directas
};