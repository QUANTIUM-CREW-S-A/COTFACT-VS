import { Request } from 'express';
import { createLogger, format, transports } from 'winston';
import { supabaseAdmin } from '../db/connection';

// Define security log levels
type SecurityLogLevel = 'info' | 'warning' | 'error' | 'critical';

// Define security event types
type SecurityEventType = 
  | 'authentication' 
  | 'authorization' 
  | 'data_access' 
  | 'configuration_change' 
  | 'rate_limit' 
  | 'input_validation'
  | 'account_change'
  | 'api_misuse';

// Define structure for security events
interface SecurityEvent {
  timestamp: string;
  level: SecurityLogLevel;
  eventType: SecurityEventType;
  message: string;
  userId?: string;
  username?: string;
  ip?: string;
  userAgent?: string;
  requestPath?: string;
  requestMethod?: string;
  targetResource?: string;
  details?: Record<string, any>;
}

// Create Winston logger for security events
const securityLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  defaultMeta: { service: 'security-service' },
  transports: [
    // Console transport for development
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    }),
    // File transport for production
    new transports.File({ 
      filename: 'logs/security.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

/**
 * Log a security event to both Winston logger and Supabase
 * 
 * @param event Security event details
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    // Log to Winston
    securityLogger.log(event.level, event.message, {
      eventType: event.eventType,
      userId: event.userId,
      ip: event.ip,
      userAgent: event.userAgent,
      requestPath: event.requestPath,
      requestMethod: event.requestMethod,
      targetResource: event.targetResource,
      details: event.details
    });
    
    // Log to Supabase for persistence and analytics
    await supabaseAdmin
      .from('security_logs')
      .insert({
        log_level: event.level,
        event_type: event.eventType,
        message: event.message,
        user_id: event.userId,
        username: event.username,
        ip_address: event.ip,
        user_agent: event.userAgent,
        request_path: event.requestPath,
        request_method: event.requestMethod,
        target_resource: event.targetResource,
        details: event.details,
        created_at: event.timestamp
      });
  } catch (error) {
    // If Supabase logging fails, still keep Winston log and report error
    console.error('Failed to log security event to database:', error);
    securityLogger.error('Failed to log security event to database', {
      originalEvent: event,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Extract request data for security logging
 * 
 * @param req Express request object
 * @returns Object with request data
 */
export function extractRequestData(req: Request): {
  ip: string;
  userAgent: string;
  path: string;
  method: string;
} {
  return {
    ip: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
    path: req.path,
    method: req.method
  };
}

/**
 * Helper function to log authentication events
 * 
 * @param req Express request object
 * @param success Whether authentication was successful
 * @param userId User ID if available
 * @param username Username if available
 * @param details Additional details
 */
export async function logAuthEvent(
  req: Request,
  success: boolean,
  userId?: string,
  username?: string,
  details?: Record<string, any>
): Promise<void> {
  const { ip, userAgent, path, method } = extractRequestData(req);
  const level: SecurityLogLevel = success ? 'info' : 'warning';
  
  // Count failed attempts for the same IP/username
  if (!success && username) {
    const { count } = await supabaseAdmin
      .from('security_logs')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'authentication')
      .eq('log_level', 'warning')
      .eq('ip_address', ip)
      .eq('username', username)
      .gt('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()); // Last 30 minutes
    
    // If multiple failed attempts, increase severity
    if (count && count >= 5) {
      await logSecurityEvent({
        timestamp: new Date().toISOString(),
        level: 'critical',
        eventType: 'authentication',
        message: `Potential brute force attack: ${count} failed login attempts for user ${username}`,
        userId,
        username,
        ip,
        userAgent,
        requestPath: path,
        requestMethod: method,
        details: {
          ...details,
          failedAttempts: count
        }
      });
      return;
    }
  }
  
  await logSecurityEvent({
    timestamp: new Date().toISOString(),
    level,
    eventType: 'authentication',
    message: success 
      ? `Successful authentication for user ${username || userId}` 
      : `Failed authentication attempt${username ? ` for user ${username}` : ''}`,
    userId,
    username,
    ip,
    userAgent,
    requestPath: path,
    requestMethod: method,
    details
  });
}

/**
 * Helper function to log authorization events
 * 
 * @param req Express request object
 * @param success Whether authorization was successful
 * @param resource Resource being accessed
 * @param details Additional details
 */
export async function logAuthorizationEvent(
  req: Request,
  success: boolean,
  resource?: string,
  details?: Record<string, any>
): Promise<void> {
  const { ip, userAgent, path, method } = extractRequestData(req);
  const level: SecurityLogLevel = success ? 'info' : 'warning';
  const userId = req.user?.id;
  
  await logSecurityEvent({
    timestamp: new Date().toISOString(),
    level,
    eventType: 'authorization',
    message: success 
      ? `Successful authorization for ${resource || path}` 
      : `Failed authorization attempt for ${resource || path}`,
    userId,
    username: req.user?.email,
    ip,
    userAgent,
    requestPath: path,
    requestMethod: method,
    targetResource: resource,
    details: {
      ...details,
      userRole: req.userRole
    }
  });
}