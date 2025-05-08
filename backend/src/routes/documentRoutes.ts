// Configurar las rutas relacionadas con documentos

import { Router } from 'express';
import * as documentController from '../controllers/documentController';
import { authMiddleware, authorizeRoles, verifyOwnership } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/public/count', documentController.getDocumentCountHandler);

// Protected routes - require authentication
router.use(authMiddleware);

// Read operations
router.get('/', documentController.getAllDocumentsHandler);
router.get('/:id', verifyOwnership('documents'), documentController.getDocumentHandler);

// Write operations - require admin or root role
router.post('/', authorizeRoles(['root', 'admin']), documentController.createDocumentHandler);
router.put('/:id', authorizeRoles(['root', 'admin']), documentController.updateDocumentHandler);
router.delete('/:id', authorizeRoles(['root', 'admin']), documentController.deleteDocumentHandler);

export default router;