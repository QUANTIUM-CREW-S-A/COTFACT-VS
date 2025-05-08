import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../db/connection';

/**
 * Authentication middleware for Express routes
 * Verifies JWT token and adds user data to the request object
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify JWT token using Supabase
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Add user data to request object for later use
    req.user = data.user;
    next();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
    return res.status(401).json({ error: errorMessage });
  }
};

/**
 * Role-based authorization middleware
 * Verifies if the user has one of the allowed roles
 * @param roles List of roles allowed to access the endpoint
 */
export const authorizeRoles = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    try {
      // Fetch the user's profile to get their role
      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .single();
        
      if (error || !profile) {
        return res.status(403).json({ error: 'Permission denied' });
      }
      
      if (!roles.includes(profile.role)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          message: `This operation requires one of these roles: ${roles.join(', ')}`
        });
      }
      
      // Store user role in request for easier access
      req.userRole = profile.role;
      next();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authorization failed';
      return res.status(500).json({ error: errorMessage });
    }
  };
};

/**
 * Resource ownership middleware
 * Verifies if the user is the owner of the requested resource or has admin rights
 * @param resourceType Type of resource to check ownership for
 * @param paramName Name of the URL parameter containing the resource ID
 */
export const verifyOwnership = (resourceType: string, paramName = 'id') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const resourceId = req.params[paramName];
    if (!resourceId) {
      return res.status(400).json({ error: `${paramName} parameter is required` });
    }
    
    try {
      // Check if user has admin role (can access any resource)
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .single();
      
      // Admin and root users can access any resource
      if (profile?.role === 'admin' || profile?.role === 'root') {
        return next();
      }
      
      // For regular users, check resource ownership
      const { data, error } = await supabaseAdmin
        .from(resourceType)
        .select('user_id')
        .eq('id', resourceId)
        .single();
      
      if (error || !data) {
        return res.status(404).json({ error: 'Resource not found' });
      }
      
      if (data.user_id !== req.user.id) {
        return res.status(403).json({ error: 'You do not have permission to access this resource' });
      }
      
      next();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ownership verification failed';
      return res.status(500).json({ error: errorMessage });
    }
  };
};

// Type definitions to extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: any;
      userRole?: string;
    }
  }
}