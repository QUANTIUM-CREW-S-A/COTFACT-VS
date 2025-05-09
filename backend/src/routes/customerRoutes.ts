// Configurar las rutas relacionadas con clientes

import { Router } from 'express';
import * as customerController from '../controllers/customerController';
import { authMiddleware, authorizeRoles, verifyOwnership } from '../middleware/authMiddleware';

const router = Router();

// Rutas públicas
router.get('/public/count', customerController.getCustomerCountHandler);

// Rutas protegidas - requieren autenticación
router.use(authMiddleware);

// Operaciones de lectura
router.get('/', customerController.getAllCustomersHandler);
router.get('/:id', verifyOwnership('customers'), customerController.getCustomerHandler);

// Operaciones de escritura - requieren rol de admin o root
router.post('/', authorizeRoles(['root', 'admin']), customerController.createCustomerHandler);
router.put('/:id', authorizeRoles(['root', 'admin']), customerController.updateCustomerHandler);
router.delete('/:id', authorizeRoles(['root', 'admin']), customerController.deleteCustomerHandler);

export default router;