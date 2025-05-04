// Crear un controlador para manejar las operaciones relacionadas con documentos

import { Request, Response } from 'express';
import { DocumentRepository } from '../infrastructure/database/DocumentRepository';

const documentRepository = new DocumentRepository();

export async function createDocumentHandler(req: Request, res: Response) {
  try {
    const document = await documentRepository.create(req.body);
    res.status(201).json(document);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
}

export async function updateDocumentHandler(req: Request, res: Response) {
  try {
    const document = await documentRepository.update(req.params.id, req.body);
    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }
    res.status(200).json(document);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
}

export async function deleteDocumentHandler(req: Request, res: Response) {
  try {
    await documentRepository.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
}

export async function getDocumentHandler(req: Request, res: Response) {
  try {
    const document = await documentRepository.findById(req.params.id);
    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }
    res.status(200).json(document);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
}

export async function getAllDocumentsHandler(req: Request, res: Response) {
  try {
    const documents = await documentRepository.findAll();
    res.status(200).json(documents);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
}