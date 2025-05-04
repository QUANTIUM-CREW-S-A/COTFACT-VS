// Implementar el repositorio para manejar la persistencia de documentos con Supabase

import { Document } from '../../domain/Document';
import { supabaseAdmin } from '../../db/connection';

export class DocumentRepository {
  private readonly TABLE_NAME = 'documents';

  async create(document: Document): Promise<Document> {
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
      console.error('Error creando documento en Supabase:', error);
      throw new Error(`Error al crear documento: ${error.message}`);
    }

    return data as Document;
  }

  async update(id: string, data: Partial<Document>): Promise<Document | null> {
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
      console.error('Error actualizando documento en Supabase:', error);
      throw new Error(`Error al actualizar documento: ${error.message}`);
    }

    return updatedDoc as Document;
  }

  async delete(id: string): Promise<void> {
    // Eliminamos el documento de Supabase
    const { error } = await supabaseAdmin
      .from(this.TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando documento en Supabase:', error);
      throw new Error(`Error al eliminar documento: ${error.message}`);
    }
  }

  async findById(id: string): Promise<Document | null> {
    // Buscamos el documento por ID en Supabase
    const { data, error } = await supabaseAdmin
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error buscando documento en Supabase:', error);
      return null;
    }

    return data as Document;
  }

  async findAll(): Promise<Document[]> {
    // Obtener todos los documentos de Supabase
    const { data, error } = await supabaseAdmin
      .from(this.TABLE_NAME)
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error obteniendo documentos de Supabase:', error);
      throw new Error(`Error al obtener documentos: ${error.message}`);
    }

    return data as Document[];
  }
}