import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Theme, ThemeContextValue } from "./types";
import { useLocalStorage } from "@/hooks/use-local-storage";

// Crear el contexto
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Hook para usar el contexto
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme debe ser usado dentro de un ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Usar localStorage para recordar preferencia de tema
  const [storedTheme, setStoredTheme] = useLocalStorage<Theme>("theme", "system");
  const [theme, setThemeState] = useState<Theme>(storedTheme);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Función para actualizar el tema
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setStoredTheme(newTheme);
  };

  // Función para alternar entre temas
  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Efecto para detectar preferencia del sistema y aplicar tema
  useEffect(() => {
    const updateTheme = () => {
      const root = window.document.documentElement;
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      
      // Determinar si se debe usar modo oscuro
      const shouldUseDark = 
        theme === "dark" || 
        (theme === "system" && systemPrefersDark);
      
      // Actualizar clase en elemento raíz para activar temas CSS
      if (shouldUseDark) {
        root.classList.add("dark");
        setIsDarkMode(true);
      } else {
        root.classList.remove("dark");
        setIsDarkMode(false);
      }
    };

    updateTheme();

    // Escuchar cambios en preferencias del sistema
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        updateTheme();
      }
    };
    
    // Agregar listener para cambios en preferencia del sistema
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      // Fallback para navegadores más antiguos
      mediaQuery.addListener(handleChange);
    }

    return () => {
      // Limpiar listener
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        // Fallback para navegadores más antiguos
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [theme]);

  // Proporcionar el contexto
  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};