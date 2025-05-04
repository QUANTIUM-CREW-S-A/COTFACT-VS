
import { useState, useEffect } from 'react';

// Hook para gestionar el almacenamiento en localStorage
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Estado para almacenar nuestro valor
  // Pasa una función a useState para que solo se ejecute una vez
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      // Obtener del localStorage por clave
      const item = window.localStorage.getItem(key);
      // Parsear el JSON almacenado o devolver initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Si hay un error, también devolvemos initialValue
      console.error('Error reading localStorage key', key, error);
      return initialValue;
    }
  });

  // Función para actualizar localStorage y el estado
  const setValue = (value: T) => {
    try {
      // Permitir que value sea una función para que tengamos la misma API que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Guardar el estado
      setStoredValue(valueToStore);
      
      // Guardar en localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // Un error más detallado aquí podría ser útil
      console.error('Error setting localStorage key', key, error);
    }
  };

  // Suscribirse a cambios en el localStorage (por ejemplo, si otro componente cambia el mismo valor)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
          setStoredValue(JSON.parse(event.newValue));
        } catch (e) {
          console.error('Error parsing localStorage value', e);
        }
      }
    };

    // Escuchar cambios en el almacenamiento
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
    return undefined;
  }, [key]);

  return [storedValue, setValue];
}
