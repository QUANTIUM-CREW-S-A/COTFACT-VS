// Crear un controlador para manejar las operaciones relacionadas con documentos

import { Request, Response } from 'express';
import { DocumentRepository, DocumentError } from '../infrastructure/database/DocumentRepository';

const documentRepository = new DocumentRepository();

export async function createDocumentHandler(req: Request, res: Response) {
  try {
    const document = await documentRepository.create(req.body);
    res.status(201).json(document);
  } catch (error) {
    handleDocumentError(error, res, 'Error al crear documento');
  }
}

export async function updateDocumentHandler(req: Request, res: Response) {
  try {
    const document = await documentRepository.update(req.params.id, req.body);
    if (!document) {
      res.status(404).json({ error: 'Documento no encontrado' });
      return;
    }
    res.status(200).json(document);
  } catch (error) {
    handleDocumentError(error, res, 'Error al actualizar documento');
  }
}

export async function deleteDocumentHandler(req: Request, res: Response) {
  try {
    await documentRepository.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    handleDocumentError(error, res, 'Error al eliminar documento');
  }
}

export async function getDocumentHandler(req: Request, res: Response) {
  try {
    const document = await documentRepository.findById(req.params.id);
    if (!document) {
      res.status(404).json({ error: 'Documento no encontrado' });
      return;
    }
    res.status(200).json(document);
  } catch (error) {
    handleDocumentError(error, res, 'Error al obtener documento');
  }
}

export async function getAllDocumentsHandler(req: Request, res: Response) {
  try {
    const documents = await documentRepository.findAll();
    res.status(200).json(documents);
  } catch (error) {
    handleDocumentError(error, res, 'Error al obtener documentos');
  }
}

export async function getDocumentCountHandler(req: Request, res: Response) {
  try {
    const count = await documentRepository.getDocumentCount();
    res.status(200).json({ count });
  } catch (error) {
    handleDocumentError(error, res, 'Error al contar documentos');
  }
}

/**
 * Utility function to handle document errors consistently
 */
function handleDocumentError(error: unknown, res: Response, defaultMessage: string) {
  console.error(defaultMessage, error);
  
  if (error instanceof DocumentError) {
    // Use the HTTP status from the DocumentError if available, otherwise 500
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