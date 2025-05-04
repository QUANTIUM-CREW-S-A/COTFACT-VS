// Configurar las rutas relacionadas con documentos

import { Router } from 'express';
import {
  createDocumentHandler,
  updateDocumentHandler,
  deleteDocumentHandler,
  getDocumentHandler,
  getAllDocumentsHandler
} from '../controllers/documentController';

const router = Router();

router.post('/', createDocumentHandler);
router.get('/', getAllDocumentsHandler);
router.get('/:id', getDocumentHandler);
router.put('/:id', updateDocumentHandler);
router.delete('/:id', deleteDocumentHandler);

export default router;