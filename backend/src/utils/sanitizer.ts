/**
 * HTML sanitizer utility functions 
 * Prevents XSS attacks by sanitizing user-provided content
 */

/**
 * Simple HTML sanitization function that removes potentially dangerous tags and attributes
 * For production, consider using a robust library like DOMPurify or sanitize-html
 * 
 * @param input String to sanitize
 * @returns Sanitized string
 */
export function sanitizeHtml(input: string): string {
  if (!input) return input;
  
  // Replace common HTML entities
  let sanitized = input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;')
    .replace(/\$/g, '&#36;');
  
  // Remove potential script execution patterns
  sanitized = sanitized
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:/gi, '');
    
  return sanitized;
}

/**
 * Sanitizes an object's string properties recursively
 * 
 * @param obj Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject(obj: any): any {
  if (!obj) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeHtml(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const result: Record<string, any> = {};
    Object.keys(obj).forEach(key => {
      result[key] = sanitizeObject(obj[key]);
    });
    return result;
  }
  
  return obj;
}