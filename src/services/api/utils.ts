import { PostgrestError } from '@supabase/supabase-js';

/**
 * Validates if a string is a valid UUID format
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Custom error types for API operations
 */
export enum ErrorType {
  DUPLICATE = 'DUPLICATE',
  REFERENCE = 'REFERENCE',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Custom error class for API operations with type classification
 */
export class ApiError extends Error {
  type: ErrorType;
  details?: any;
  originalError?: any;

  constructor(message: string, type: ErrorType = ErrorType.UNKNOWN, details?: any, originalError?: any) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.details = details;
    this.originalError = originalError;
  }
}

/**
 * Función de utilidad para manejar errores de Supabase de forma estandarizada
 * @param operation Nombre de la operación que falló (para logging)
 * @param error Error original
 * @param entityName Nombre de la entidad (documento, cliente, etc.) para mensajes de error
 */
export const handleSupabaseError = (operation: string, error: unknown, entityName: string = 'elemento'): never => {
  // Verificar si es un error específico de PostgreSQL/Supabase
  if (error && typeof error === 'object' && 'code' in error) {
    const pgError = error as PostgrestError;
    
    // Manejar errores específicos
    if (pgError.code === '23505') { // Unique violation
      console.error(`Error en ${operation} (Duplicado):`, pgError);
      throw new ApiError(
        `Ya existe un ${entityName} con esta información: ${pgError.details || pgError.message}`,
        ErrorType.DUPLICATE,
        pgError.details,
        pgError
      );
    } else if (pgError.code === '23503') { // Foreign key violation
      console.error(`Error en ${operation} (Referencia inválida):`, pgError);
      throw new ApiError(
        `Referencia a un elemento que no existe: ${pgError.details || pgError.message}`,
        ErrorType.REFERENCE,
        pgError.details,
        pgError
      );
    } else if (pgError.code === '42501') { // Permission denied
      console.error(`Error en ${operation} (Permiso denegado):`, pgError);
      throw new ApiError(
        'No tienes permiso para realizar esta operación',
        ErrorType.PERMISSION,
        pgError.details,
        pgError
      );
    } else if (pgError.code === 'PGRST116') { // Not found
      console.error(`Error en ${operation} (No encontrado):`, pgError);
      throw new ApiError(
        `El ${entityName} no fue encontrado`,
        ErrorType.NOT_FOUND,
        pgError.details,
        pgError
      );
    }
  }
  
  // Verificar si es un error de red
  if (error instanceof Error && error.message.includes('network')) {
    console.error(`Error de red en ${operation}:`, error);
    throw new ApiError(
      'Error de conexión. Por favor, verifica tu conexión a internet.',
      ErrorType.NETWORK,
      undefined,
      error
    );
  }
  
  // Error genérico
  console.error(`Error en ${operation}:`, error);
  throw error instanceof Error 
    ? new ApiError(error.message, ErrorType.UNKNOWN, undefined, error)
    : new ApiError(`Error desconocido en ${operation}`, ErrorType.UNKNOWN, undefined, error);
};
