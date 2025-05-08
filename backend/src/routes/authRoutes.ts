import { Router } from 'express';
import { changePassword } from '../controllers/authController';

const router = Router();

// Endpoint para cambio de contraseña
router.post('/change-password', changePassword);

export default router;
