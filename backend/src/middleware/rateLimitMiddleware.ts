import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';

// Simple in-memory store for rate limiting
// In production, use Redis or another distributed cache
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
    blocked: boolean;
    blockExpires?: number;
  };
}

const store: RateLimitStore = {};

/**
 * Generates a unique key for rate limiting based on IP and optional user ID
 */
const generateRateLimitKey = (req: Request, keyPrefix: string): string => {
  // Use client IP as base identifier
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  
  // If authenticated, include user ID in the key for more precise tracking
  const userId = req.user?.id || '';
  
  // Create a hash to avoid storing raw IPs in memory
  return createHash('sha256')
    .update(`${keyPrefix}:${ip}:${userId}`)
    .digest('hex');
};

/**
 * Cleanup function to remove expired entries
 * This should be called periodically in a production environment
 */
export const cleanupExpiredRateLimits = (): void => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    // Remove expired rate limit entries
    if (store[key].resetTime < now) {
      delete store[key];
    }
    // Remove expired blocks
    else if (store[key].blocked && store[key].blockExpires && store[key].blockExpires < now) {
      store[key].blocked = false;
      delete store[key].blockExpires;
    }
  });
};

// Set up periodic cleanup every 10 minutes
setInterval(cleanupExpiredRateLimits, 10 * 60 * 1000);

/**
 * Rate limiting middleware with progressive penalties
 * 
 * @param options Rate limiting options
 * @returns Express middleware function
 */
export const rateLimit = (options: {
  windowMs?: number;       // Time window in milliseconds
  max?: number;            // Maximum requests in time window
  keyPrefix?: string;      // Prefix for rate limit keys
  message?: string;        // Error message
  statusCode?: number;     // HTTP status code for rate limit errors
  blockDuration?: number;  // Duration to block after exceeding maxAttempts
  maxAttempts?: number;    // Number of attempts before blocking
  headers?: boolean;       // Whether to include rate limit headers
}) => {
  const {
    windowMs = 60 * 1000,         // Default: 1 minute
    max = 60,                     // Default: 60 requests per minute
    keyPrefix = 'rl',             // Default key prefix
    message = 'Too many requests, please try again later',
    statusCode = 429,             // Too Many Requests
    blockDuration = 15 * 60 * 1000, // Default block: 15 minutes
    maxAttempts = 5,              // Block after 5 consecutive violations
    headers = true
  } = options;

  // Return the middleware function
  return (req: Request, res: Response, next: NextFunction) => {
    // Generate a unique key for this request
    const key = generateRateLimitKey(req, keyPrefix);
    const now = Date.now();
    
    // Initialize or reset if window has passed
    if (!store[key] || store[key].resetTime <= now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
        blocked: false
      };
    }

    // Check if this IP/user is blocked
    if (store[key].blocked) {
      // Calculate remaining time if available
      const remainingMs = store[key].blockExpires 
        ? store[key].blockExpires - now 
        : blockDuration;
      const remainingMins = Math.ceil(remainingMs / 60000);
      
      // Set headers if enabled
      if (headers) {
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', Math.ceil(store[key].resetTime / 1000));
        res.setHeader('Retry-After', Math.ceil(remainingMs / 1000));
      }
      
      // Return block message with remaining time
      return res.status(statusCode).json({
        error: 'Rate limit exceeded',
        message: `Access temporarily blocked. Try again in ${remainingMins} minute${remainingMins !== 1 ? 's' : ''}.`
      });
    }
    
    // Increment the counter
    store[key].count += 1;
    
    // Check if limit is exceeded
    if (store[key].count > max) {
      // Track consecutive violations
      store[key].count = max + 1; // Keep it at max+1 to avoid integer overflow
      
      // Check if we should block this IP/user
      if (store[key].count >= max + maxAttempts) {
        store[key].blocked = true;
        store[key].blockExpires = now + blockDuration;
      }
      
      // Set headers if enabled
      if (headers) {
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', Math.ceil(store[key].resetTime / 1000));
        res.setHeader('Retry-After', Math.ceil((store[key].resetTime - now) / 1000));
      }
      
      return res.status(statusCode).json({
        error: 'Rate limit exceeded',
        message,
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000)
      });
    }
    
    // Set headers if enabled
    if (headers) {
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - store[key].count));
      res.setHeader('X-RateLimit-Reset', Math.ceil(store[key].resetTime / 1000));
    }
    
    next();
  };
};

/**
 * Pre-configured rate limiters for common scenarios
 */
export const rateLimiters = {
  // General API rate limiter (60 requests per minute)
  api: rateLimit({ 
    keyPrefix: 'api',
    windowMs: 60 * 1000,
    max: 60
  }),
  
  // Authentication endpoints (5 attempts per minute)
  auth: rateLimit({
    keyPrefix: 'auth',
    windowMs: 60 * 1000,
    max: 5,
    message: 'Too many authentication attempts, please try again later'
  }),
  
  // Password reset (3 attempts per hour)
  passwordReset: rateLimit({
    keyPrefix: 'pwd',
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: 'Too many password reset attempts, please try again later'
  }),
  
  // Document creation (10 per minute)
  documentCreation: rateLimit({
    keyPrefix: 'doc',
    windowMs: 60 * 1000,
    max: 10,
    message: 'Creating too many documents, please slow down'
  })
};