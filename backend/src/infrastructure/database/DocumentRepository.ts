// Implementar el repositorio para manejar la persistencia de documentos con Supabase

import { Document } from '../../domain/Document';
import { supabaseAdmin } from '../../db/connection';
import { PostgrestError } from '@supabase/supabase-js';

// Custom error class for document operations
export class DocumentError extends Error {
  code?: string;
  details?: string;
  hint?: string;
  httpStatus?: number;

  constructor(message: string, pgError?: PostgrestError) {
    super(message);
    this.name = 'DocumentError';
    
    if (pgError) {
      this.code = pgError.code;
      this.details = pgError.details;
      this.hint = pgError.hint;
      this.httpStatus = pgError.code === '23505' ? 409 : // Conflict for duplicate
                      pgError.code === '23503' ? 400 : // Bad request for invalid reference
                      pgError.code === '42501' ? 403 : // Forbidden for permission issues
                      pgError.code === 'PGRST116' ? 404 : // Not found
                      500; // Default server error
    }
  }
}

export class DocumentRepository {
  private readonly TABLE_NAME = 'documents';

  async create(document: Document): Promise<Document> {
    try {
      // Aseguramos que createdAt y updatedAt estén establecidos
      if (!document.createdAt) document.createdAt = new Date();
      if (!document.updatedAt) document.updatedAt = new Date();

      // Insertamos el documento en Supabase
      const { data, error } = await supabaseAdmin
        .from(this.TABLE_NAME)
        .insert([document])
        .select()
        .single();

      if (error) {
        throw new DocumentError(`Error al crear documento: ${error.message}`, error);
      }

      return data as Document;
    } catch (error) {
      // Rethrow DocumentError or wrap other errors
      if (error instanceof DocumentError) {
        throw error;
      }
      
      const message = error instanceof Error ? error.message : 'Error desconocido al crear documento';
      console.error('Error creando documento:', message);
      throw new DocumentError(message);
    }
  }

  async update(id: string, data: Partial<Document>): Promise<Document | null> {
    try {
      // Actualizamos la fecha de modificación
      data.updatedAt = new Date();

      // Actualizamos el documento en Supabase
      const { data: updatedDoc, error } = await supabaseAdmin
        .from(this.TABLE_NAME)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new DocumentError(`Documento con id ${id} no encontrado`, error);
        }
        throw new DocumentError(`Error al actualizar documento: ${error.message}`, error);
      }

      return updatedDoc as Document;
    } catch (error) {
      // Rethrow DocumentError or wrap other errors
      if (error instanceof DocumentError) {
        throw error;
      }
      
      const message = error instanceof Error ? error.message : 'Error desconocido al actualizar documento';
      console.error('Error actualizando documento:', message);
      throw new DocumentError(message);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Verificar si el documento existe primero
      const { data: existingDoc, error: findError } = await supabaseAdmin
        .from(this.TABLE_NAME)
        .select('id')
        .eq('id', id)
        .single();
        
      if (findError) {
        if (findError.code === 'PGRST116') {
          throw new DocumentError(`Documento con id ${id} no encontrado`, findError);
        }
        throw new DocumentError(`Error al buscar documento: ${findError.message}`, findError);
      }
      
      if (!existingDoc) {
        throw new DocumentError(`Documento con id ${id} no encontrado`);
      }

      // Eliminamos el documento de Supabase
      const { error } = await supabaseAdmin
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) {
        throw new DocumentError(`Error al eliminar documento: ${error.message}`, error);
      }
    } catch (error) {
      // Rethrow DocumentError or wrap other errors
      if (error instanceof DocumentError) {
        throw error;
      }
      
      const message = error instanceof Error ? error.message : 'Error desconocido al eliminar documento';
      console.error('Error eliminando documento:', message);
      throw new DocumentError(message);
    }
  }

  async findById(id: string): Promise<Document | null> {
    try {
      // Buscamos el documento por ID en Supabase
      const { data, error } = await supabaseAdmin
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No documento found, return null
        }
        throw new DocumentError(`Error al buscar documento: ${error.message}`, error);
      }

      return data as Document;
    } catch (error) {
      // Rethrow DocumentError or wrap other errors
      if (error instanceof DocumentError) {
        throw error;
      }
      
      const message = error instanceof Error ? error.message : 'Error desconocido al buscar documento';
      console.error('Error buscando documento:', message);
      throw new DocumentError(message);
    }
  }

  async findAll(): Promise<Document[]> {
    try {
      // Obtener todos los documentos de Supabase
      const { data, error } = await supabaseAdmin
        .from(this.TABLE_NAME)
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        throw new DocumentError(`Error al obtener documentos: ${error.message}`, error);
      }

      return data as Document[];
    } catch (error) {
      // Rethrow DocumentError or wrap other errors
      if (error instanceof DocumentError) {
        throw error;
      }
      
      const message = error instanceof Error ? error.message : 'Error desconocido al obtener documentos';
      console.error('Error obteniendo documentos:', message);
      throw new DocumentError(message);
    }
  }
  
  async getDocumentCount(): Promise<number> {
    try {
      const { count, error } = await supabaseAdmin
        .from(this.TABLE_NAME)
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw new DocumentError(`Error al contar documentos: ${error.message}`, error);
      }

      return count || 0;
    } catch (error) {
      // Rethrow DocumentError or wrap other errors
      if (error instanceof DocumentError) {
        throw error;
      }
      
      const message = error instanceof Error ? error.message : 'Error desconocido al contar documentos';
      console.error('Error contando documentos:', message);
      throw new DocumentError(message);
    }
  }
}