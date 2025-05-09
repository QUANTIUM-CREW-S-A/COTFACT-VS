// Crear un controlador para manejar las operaciones relacionadas con clientes

import { Request, Response } from 'express';
import { CustomerRepository, CustomerError } from '../infrastructure/database/CustomerRepository';

const customerRepository = new CustomerRepository();

export async function createCustomerHandler(req: Request, res: Response) {
  try {
    const customer = await customerRepository.create(req.body);
    res.status(201).json(customer);
  } catch (error) {
    handleCustomerError(error, res, 'Error al crear cliente');
  }
}

export async function updateCustomerHandler(req: Request, res: Response) {
  try {
    const customer = await customerRepository.update(req.params.id, req.body);
    if (!customer) {
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }
    res.status(200).json(customer);
  } catch (error) {
    handleCustomerError(error, res, 'Error al actualizar cliente');
  }
}

export async function deleteCustomerHandler(req: Request, res: Response) {
  try {
    await customerRepository.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    handleCustomerError(error, res, 'Error al eliminar cliente');
  }
}

export async function getCustomerHandler(req: Request, res: Response) {
  try {
    const customer = await customerRepository.findById(req.params.id);
    if (!customer) {
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }
    res.status(200).json(customer);
  } catch (error) {
    handleCustomerError(error, res, 'Error al obtener cliente');
  }
}

export async function getAllCustomersHandler(req: Request, res: Response) {
  try {
    // Verificar si debemos filtrar por user_id
    const userId = req.query.userId as string;
    
    let customers;
    if (userId) {
      customers = await customerRepository.findByUserId(userId);
    } else {
      customers = await customerRepository.findAll();
    }
    
    res.status(200).json(customers);
  } catch (error) {
    handleCustomerError(error, res, 'Error al obtener clientes');
  }
}

export async function getCustomerCountHandler(req: Request, res: Response) {
  try {
    const count = await customerRepository.getCustomerCount();
    res.status(200).json({ count });
  } catch (error) {
    handleCustomerError(error, res, 'Error al contar clientes');
  }
}

/**
 * Función utilidad para manejar errores de clientes de manera consistente
 */
function handleCustomerError(error: unknown, res: Response, defaultMessage: string) {
  console.error(defaultMessage, error);
  
  if (error instanceof CustomerError) {
    // Usar el HTTP status del CustomerError si está disponible, de lo contrario 500
    const status = error.httpStatus || 500;
    res.status(status).json({
      error: error.message,
      code: error.code,
      details: error.details
    });
    return;
  }
  
  const errorMessage = error instanceof Error ? error.message : defaultMessage;
  res.status(500).json({ error: errorMessage });
}