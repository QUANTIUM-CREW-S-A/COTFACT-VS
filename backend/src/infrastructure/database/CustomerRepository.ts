// Implementación del repositorio para manejar la persistencia de clientes con Supabase

import { Customer } from '../../domain/Customer';
import { supabaseAdmin } from '../../db/connection';
import { PostgrestError } from '@supabase/supabase-js';

// Custom error class para operaciones con clientes
export class CustomerError extends Error {
  code?: string;
  details?: string;
  hint?: string;
  httpStatus?: number;

  constructor(message: string, pgError?: PostgrestError) {
    super(message);
    this.name = 'CustomerError';
    
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

export class CustomerRepository {
  private readonly TABLE_NAME = 'customers';

  async create(customer: Customer): Promise<Customer> {
    try {
      // Asegurar que createdAt y updatedAt estén establecidos
      if (!customer.createdAt) customer.createdAt = new Date();
      if (!customer.updatedAt) customer.updatedAt = new Date();

      // Insertar el cliente en Supabase
      const { data, error } = await supabaseAdmin
        .from(this.TABLE_NAME)
        .insert([customer])
        .select()
        .single();

      if (error) {
        throw new CustomerError(`Error al crear cliente: ${error.message}`, error);
      }

      return data as Customer;
    } catch (error) {
      // Relanzar CustomerError o encapsular otros errores
      if (error instanceof CustomerError) {
        throw error;
      }
      
      const message = error instanceof Error ? error.message : 'Error desconocido al crear cliente';
      console.error('Error creando cliente:', message);
      throw new CustomerError(message);
    }
  }

  async update(id: string, data: Partial<Customer>): Promise<Customer | null> {
    try {
      // Actualizar la fecha de modificación
      data.updatedAt = new Date();

      // Actualizar el cliente en Supabase
      const { data: updatedCustomer, error } = await supabaseAdmin
        .from(this.TABLE_NAME)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new CustomerError(`Cliente con id ${id} no encontrado`, error);
        }
        throw new CustomerError(`Error al actualizar cliente: ${error.message}`, error);
      }

      return updatedCustomer as Customer;
    } catch (error) {
      // Relanzar CustomerError o encapsular otros errores
      if (error instanceof CustomerError) {
        throw error;
      }
      
      const message = error instanceof Error ? error.message : 'Error desconocido al actualizar cliente';
      console.error('Error actualizando cliente:', message);
      throw new CustomerError(message);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Verificar si el cliente existe primero
      const { data: existingCustomer, error: findError } = await supabaseAdmin
        .from(this.TABLE_NAME)
        .select('id')
        .eq('id', id)
        .single();
        
      if (findError) {
        if (findError.code === 'PGRST116') {
          throw new CustomerError(`Cliente con id ${id} no encontrado`, findError);
        }
        throw new CustomerError(`Error al buscar cliente: ${findError.message}`, findError);
      }
      
      if (!existingCustomer) {
        throw new CustomerError(`Cliente con id ${id} no encontrado`);
      }

      // Eliminar el cliente de Supabase
      const { error } = await supabaseAdmin
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) {
        throw new CustomerError(`Error al eliminar cliente: ${error.message}`, error);
      }
    } catch (error) {
      // Relanzar CustomerError o encapsular otros errores
      if (error instanceof CustomerError) {
        throw error;
      }
      
      const message = error instanceof Error ? error.message : 'Error desconocido al eliminar cliente';
      console.error('Error eliminando cliente:', message);
      throw new CustomerError(message);
    }
  }

  async findById(id: string): Promise<Customer | null> {
    try {
      // Buscar el cliente por ID en Supabase
      const { data, error } = await supabaseAdmin
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No cliente found, return null
        }
        throw new CustomerError(`Error al buscar cliente: ${error.message}`, error);
      }

      return data as Customer;
    } catch (error) {
      // Relanzar CustomerError o encapsular otros errores
      if (error instanceof CustomerError) {
        throw error;
      }
      
      const message = error instanceof Error ? error.message : 'Error desconocido al buscar cliente';
      console.error('Error buscando cliente:', message);
      throw new CustomerError(message);
    }
  }

  async findAll(): Promise<Customer[]> {
    try {
      // Obtener todos los clientes de Supabase
      const { data, error } = await supabaseAdmin
        .from(this.TABLE_NAME)
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        throw new CustomerError(`Error al obtener clientes: ${error.message}`, error);
      }

      return data as Customer[];
    } catch (error) {
      // Relanzar CustomerError o encapsular otros errores
      if (error instanceof CustomerError) {
        throw error;
      }
      
      const message = error instanceof Error ? error.message : 'Error desconocido al obtener clientes';
      console.error('Error obteniendo clientes:', message);
      throw new CustomerError(message);
    }
  }
  
  async findByUserId(userId: string): Promise<Customer[]> {
    try {
      // Obtener todos los clientes de un usuario específico
      const { data, error } = await supabaseAdmin
        .from(this.TABLE_NAME)
        .select('*')
        .eq('user_id', userId)
        .order('createdAt', { ascending: false });

      if (error) {
        throw new CustomerError(`Error al obtener clientes del usuario: ${error.message}`, error);
      }

      return data as Customer[];
    } catch (error) {
      // Relanzar CustomerError o encapsular otros errores
      if (error instanceof CustomerError) {
        throw error;
      }
      
      const message = error instanceof Error ? error.message : 'Error desconocido al obtener clientes del usuario';
      console.error('Error obteniendo clientes del usuario:', message);
      throw new CustomerError(message);
    }
  }
  
  async getCustomerCount(): Promise<number> {
    try {
      const { count, error } = await supabaseAdmin
        .from(this.TABLE_NAME)
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw new CustomerError(`Error al contar clientes: ${error.message}`, error);
      }

      return count || 0;
    } catch (error) {
      // Relanzar CustomerError o encapsular otros errores
      if (error instanceof CustomerError) {
        throw error;
      }
      
      const message = error instanceof Error ? error.message : 'Error desconocido al contar clientes';
      console.error('Error contando clientes:', message);
      throw new CustomerError(message);
    }
  }
}