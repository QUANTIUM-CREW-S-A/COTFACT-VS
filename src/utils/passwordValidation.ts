/**
 * Utilidad para validación de contraseñas
 * Proporciona validaciones robustas como alternativa a "Leaked Password Protection" 
 * que solo está disponible en planes pagos de Supabase
 */

// Tipos de validación
export type PasswordValidationResult = {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number; // 0-100
};

// Lista de contraseñas comunes y vulnerables
const commonPasswords = [
  'password', '123456', '12345678', '1234', 'qwerty', 
  'admin', 'welcome', 'password1', 'abc123', 'letmein',
  'monkey', '111111', 'sunshine', '123123', 'admin123'
];

// Patrones secuenciales comunes
const sequentialPatterns = [
  '1234', '2345', '3456', '4567', '5678', '6789', '7890',
  'abcd', 'bcde', 'cdef', 'defg', 'efgh', 'fghi', 'ghij',
  'qwer', 'wert', 'erty', 'rtyu', 'tyui', 'yuio', 'uiop'
];

// Caracteres repetidos
const hasRepeatingChars = (password: string): boolean => {
  return /(.)\1\1/.test(password); // Tres o más caracteres iguales seguidos
};

// Verificar si contiene secuencias comunes
const hasSequentialPattern = (password: string): boolean => {
  const lowerPass = password.toLowerCase();
  return sequentialPatterns.some(pattern => lowerPass.includes(pattern));
};

// Verificar si es una contraseña común
const isCommonPassword = (password: string): boolean => {
  const lowerPass = password.toLowerCase();
  return commonPasswords.some(common => lowerPass === common || lowerPass.includes(common));
};

/**
 * Validación completa de contraseña
 * @param password Contraseña a validar
 * @returns ResultadoValidación con estado, errores y puntuación
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Longitud mínima
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  } else {
    score += 20; // Puntos base por longitud mínima
    
    // Puntos adicionales por longitud
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;
  }

  // Complejidad: mayúsculas
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe incluir al menos una letra mayúscula');
  } else {
    score += 10;
  }

  // Complejidad: minúsculas
  if (!/[a-z]/.test(password)) {
    errors.push('Debe incluir al menos una letra minúscula');
  } else {
    score += 10;
  }

  // Complejidad: números
  if (!/\d/.test(password)) {
    errors.push('Debe incluir al menos un número');
  } else {
    score += 10;
  }

  // Complejidad: caracteres especiales
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Debe incluir al menos un carácter especial');
  } else {
    score += 15;
  }

  // Verificar patrones de seguridad
  if (isCommonPassword(password)) {
    errors.push('La contraseña es muy común y fácil de adivinar');
    score = Math.max(score - 30, 0);
  }

  if (hasSequentialPattern(password)) {
    errors.push('Evita secuencias comunes como "1234" o "qwerty"');
    score = Math.max(score - 20, 0);
  }

  if (hasRepeatingChars(password)) {
    errors.push('Evita caracteres repetidos como "111" o "aaa"');
    score = Math.max(score - 15, 0);
  }

  // Determinar nivel de fortaleza
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak';
  if (score >= 80) {
    strength = 'very-strong';
  } else if (score >= 60) {
    strength = 'strong';
  } else if (score >= 40) {
    strength = 'medium';
  }

  return {
    valid: errors.length === 0,
    errors,
    strength,
    score
  };
}

/**
 * Versión simplificada que solo retorna si la contraseña es válida
 * @param password Contraseña a validar
 * @returns true si la contraseña cumple requisitos mínimos
 */
export function isPasswordValid(password: string): boolean {
  // Requisitos mínimos:
  // - Al menos 8 caracteres
  // - Al menos una mayúscula
  // - Al menos una minúscula
  // - Al menos un número
  // - No debe ser una contraseña común
  
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/\d/.test(password)) return false;
  if (isCommonPassword(password)) return false;
  
  return true;
}

/**
 * Genera retroalimentación amigable sobre la fortaleza de la contraseña
 * @param validation Resultado de la validación
 * @returns String con mensaje de retroalimentación
 */
export function getPasswordFeedback(validation: PasswordValidationResult): string {
  if (validation.valid) {
    switch (validation.strength) {
      case 'very-strong':
        return '¡Excelente! Tu contraseña es muy segura.';
      case 'strong':
        return 'Buena contraseña. Bastante segura.';
      case 'medium':
        return 'Contraseña aceptable. Podría ser más segura.';
      default:
        return 'Contraseña válida, pero considera fortalecerla.';
    }
  } else {
    return 'Por favor corrige los problemas de seguridad de la contraseña.';
  }
}