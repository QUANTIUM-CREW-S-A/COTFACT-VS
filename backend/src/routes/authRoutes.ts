import { Router } from 'express';
import { changePassword, requestPasswordReset, getCurrentUser } from '../controllers/authController';
import { authMiddleware, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Public routes (no authentication required)
router.post('/password/reset-request', requestPasswordReset);

// Protected routes (authentication required)
router.use(authMiddleware);
router.get('/me', getCurrentUser);
router.post('/password/change', changePassword);

// Admin-only routes
router.get('/users', authorizeRoles(['root', 'admin']), (req, res) => {
  // This is a placeholder - implement a proper user listing controller method
  res.status(200).json({ message: 'User listing requires implementation' });
});

export default router;
