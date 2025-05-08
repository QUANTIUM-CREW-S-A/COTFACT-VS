import { Request, Response, NextFunction } from 'express';
import { logAuthorizationEvent } from '../utils/securityLogger';

/**
 * Middleware to add security headers to responses
 */
export const securityHeaders = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Content Security Policy - Prevent XSS attacks
    // Customize this based on your application's needs
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; object-src 'none'; img-src 'self' data:; font-src 'self' data:;"
    );
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Enable XSS filter in browser
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Enforce HTTPS (only in production)
    if (process.env.NODE_ENV === 'production') {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }
    
    // Disable browser caching for sensitive routes
    const sensitiveRoutes = ['/api/auth', '/api/users', '/api/documents'];
    const basePath = req.path.split('/').slice(0, 3).join('/');
    
    if (sensitiveRoutes.includes(basePath)) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
    }
    
    next();
  };
};

/**
 * Middleware to log unauthorized access attempts
 */
export const logUnauthorizedAccessMiddleware = () => {
  return (err: any, req: Request, res: Response, next: NextFunction) => {
    // Only log authentication/authorization errors
    if (err && (err.status === 401 || err.status === 403)) {
      // Log the unauthorized access attempt
      logAuthorizationEvent(
        req,
        false, // unsuccessful
        req.path,
        {
          errorMessage: err.message,
          errorStatus: err.status,
          errorName: err.name
        }
      ).catch(error => console.error('Failed to log unauthorized access:', error));
    }
    
    next(err);
  };
};

/**
 * Add a request timeout to prevent hanging connections
 * @param ms Timeout in milliseconds
 */
export const requestTimeout = (ms: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip timeout for file uploads and downloads
    const skipPaths = ['/api/uploads', '/api/downloads'];
    if (skipPaths.some(path => req.path.startsWith(path))) {
      return next();
    }
    
    res.setTimeout(ms, () => {
      res.status(408).json({ 
        error: 'Request Timeout',
        message: 'The request has timed out.'
      });
    });
    
    next();
  };
};

/**
 * Track API usage and resource consumption
 */
export const apiUsageTracking = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Track start time
    const startTime = process.hrtime();
    
    // Track response size
    const originalEnd = res.end;
    let responseSize = 0;
    
    res.end = function(chunk?: any, ...args: any[]) {
      if (chunk) {
        const size = chunk instanceof Buffer ? chunk.length : Buffer.byteLength(chunk);
        responseSize += size;
      }
      
      // Calculate response time
      const hrtime = process.hrtime(startTime);
      const responseTimeMs = hrtime[0] * 1000 + hrtime[1] / 1000000;
      
      // Log API usage (only for non-static resources)
      if (!req.path.match(/\.(js|css|html|svg|png|jpg|jpeg|gif|ico)$/i)) {
        const logData = {
          path: req.path,
          method: req.method,
          statusCode: res.statusCode,
          responseTimeMs: Math.round(responseTimeMs),
          responseSize: responseSize,
          userId: req.user?.id || 'anonymous'
        };
        
        // Normally would log to a database or analytics system
        // For now, just log to console in development
        if (process.env.NODE_ENV !== 'production') {
          console.log('[API Usage]', logData);
        }
      }
      
      return originalEnd.apply(res, [chunk, ...args]);
    };
    
    next();
  };
};