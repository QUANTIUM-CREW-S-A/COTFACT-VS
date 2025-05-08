import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { sanitizeHtml } from '../utils/sanitizer';

/**
 * Generic validation middleware using zod schemas
 * @param schema Zod schema to validate against
 * @returns Express middleware function
 */
export const validateInput = (schema: z.ZodType<any, any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body against the schema
      const validationResult = schema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Invalid input',
          details: validationResult.error.errors
        });
      }
      
      // Replace the request body with the validated data
      req.body = validationResult.data;
      next();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Validation error';
      return res.status(400).json({ error: errorMessage });
    }
  };
};

/**
 * Middleware to sanitize string fields in request body
 * Helps prevent XSS attacks
 */
export const sanitizeInputs = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
      // Create a deep copy to avoid modifying the original object properties
      const sanitized = JSON.parse(JSON.stringify(req.body));
      
      // Recursively sanitize string values
      const sanitizeObject = (obj: any): any => {
        if (!obj) return obj;
        
        if (typeof obj === 'string') {
          // Sanitize string values to prevent XSS
          return sanitizeHtml(obj);
        }
        
        if (Array.isArray(obj)) {
          return obj.map(item => sanitizeObject(item));
        }
        
        if (typeof obj === 'object') {
          Object.keys(obj).forEach(key => {
            obj[key] = sanitizeObject(obj[key]);
          });
        }
        
        return obj;
      };
      
      req.body = sanitizeObject(sanitized);
    }
    
    next();
  };
};

/**
 * Middleware to validate and sanitize URL parameters
 * @param paramName The name of the parameter to validate
 * @param pattern Regular expression pattern to validate against
 */
export const validateParam = (paramName: string, pattern: RegExp) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const param = req.params[paramName];
    
    if (!param) {
      return res.status(400).json({ 
        error: 'Missing required parameter',
        param: paramName
      });
    }
    
    if (!pattern.test(param)) {
      return res.status(400).json({ 
        error: 'Invalid parameter format',
        param: paramName
      });
    }
    
    next();
  };
};

// Common validation patterns
export const VALIDATION_PATTERNS = {
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  SAFE_STRING: /^[a-zA-Z0-9\s\-_.,:;!?()[\]{}@#$%^&*+=|~<>/\\]+$/
};