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
    
    // Use on-finished module pattern to avoid issues with response handling
    const originalEnd = res.end;
    let responseSize = 0;
    
    // Override the end method to track response size - with improved safety handling
    res.end = function(this: Response, chunk?: any, encodingOrCb?: any, callback?: any): Response {
      // Only track chunk size if it exists
      if (chunk) {
        try {
          // Safely calculate size based on chunk type
          if (Buffer.isBuffer(chunk)) {
            responseSize += chunk.length;
          } else if (typeof chunk === 'string') {
            // Lista de codificaciones válidas para validar
            const validEncodings: BufferEncoding[] = ['utf8', 'ascii', 'utf16le', 'ucs2', 'base64', 'latin1', 'binary', 'hex'];
            // Determinar la codificación final de forma segura
            const encoding: BufferEncoding = typeof encodingOrCb === 'string' && validEncodings.includes(encodingOrCb as BufferEncoding)
              ? encodingOrCb as BufferEncoding
              : 'utf8';
              
            responseSize += Buffer.byteLength(chunk, encoding);
          }
          // For other types, we'll skip size calculation
        } catch (err) {
          // Silent catch to prevent response failures
          console.error('Error calculating response size:', err);
        }
      }
      
      // Calculate response time
      const hrtime = process.hrtime(startTime);
      const responseTimeMs = hrtime[0] * 1000 + hrtime[1] / 1000000;
      
      // Skip logging for static resources and healthcheck
      if (!req.path.match(/\.(js|css|html|svg|png|jpg|jpeg|gif|ico)$/i) && 
          !req.path.includes('/health')) {
        const logData = {
          path: req.path,
          method: req.method,
          statusCode: res.statusCode,
          responseTimeMs: Math.round(responseTimeMs),
          responseSize: responseSize,
          userId: req.user?.id || 'anonymous'
        };
        
        // Log in development, could send to monitoring service in production
        if (process.env.NODE_ENV !== 'production') {
          console.log('[API Usage]', logData);
        }
      }
      
      // Call the original end method with all arguments
      return originalEnd.apply(this, arguments as any);
    };
    
    next();
  };
};