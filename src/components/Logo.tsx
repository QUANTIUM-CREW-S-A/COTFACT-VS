import React, { useMemo } from 'react';
import { useTheme } from "@/context/theme/ThemeProvider";
import { cn } from "@/lib/utils";

/*
 * Componente Logo optimizado.
 * - Usa imágenes PNG según el tema actual (claro/oscuro)
 * - Ofrece múltiples variantes: completo, solo icono, y variaciones de color.
 * - Optimizado para ajustarse a navbars, footers y cualquier contexto UI.
 * - Implementa aspectos de accesibilidad recomendados.
 */

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xl' | '2xl' | '3xl' | 'super' | 'mega' | 'ultra' | 'giant' | 'enormous';
  className?: string;
  navbar?: boolean; // Indica si el logo se usará en una barra de navegación
  variant?: 'original' | 'dark' | 'iconOnly' | 'minimalist'; // Variante del logo
  showBackground?: boolean; // Si debe mostrar el rectángulo de fondo
  aria?: string; // Texto para accesibilidad
  animated?: boolean; // Si debe tener animaciones al aparecer
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  className, 
  navbar = false,
  variant: propVariant,
  showBackground = true,
  aria = "COTFACT-VS Logo",
  animated = false
}) => {
  const { isDarkMode } = useTheme();
  
  // Determinamos la variante óptima basada en el contexto
  const variant = useMemo(() => {
    if (propVariant) return propVariant;
    
    if (isDarkMode) {
      return navbar ? 'iconOnly' : 'dark';
    }
    
    return navbar && window.innerWidth < 640 ? 'iconOnly' : 'original';
  }, [propVariant, isDarkMode, navbar]);
  
  // Seleccionamos la imagen según el tema y variante
  const logoSrc = useMemo(() => {
    if (isDarkMode) {
      return '/lovable-uploads/cotfact-logo-light.png'; // Cambiado: logo claro para tema oscuro
    } else {
      return '/lovable-uploads/cotfact-logo-dark.png'; // Cambiado: logo oscuro para tema claro
    }
  }, [isDarkMode]);

  // Seleccionamos la imagen para el icono (recortada para mostrar solo el icono)
  const iconLogoSrc = useMemo(() => {
    // Usamos la misma imagen pero aplicaremos CSS para recortarla
    return isDarkMode 
      ? '/lovable-uploads/cotfact-logo-light.png' // Cambiado: logo claro para tema oscuro
      : '/lovable-uploads/cotfact-logo-dark.png'; // Cambiado: logo oscuro para tema claro
  }, [isDarkMode]);
  
  // Mapea el tamaño a clases tailwind para altura y ancho máximo
  const sizeClasses = {
    'small': navbar ? 'h-6' : 'h-8', // Reducido para navbar
    'medium': navbar ? 'h-7' : 'h-10', // Reducido para navbar
    'large': navbar ? 'h-9' : 'h-16',
    'xl': 'h-24',
    '2xl': 'h-32',
    '3xl': 'h-40',
    'super': 'h-56',
    'mega': 'h-72',
    'ultra': 'h-96',
    'giant': 'h-[30rem]',
    'enormous': 'h-[40rem]'
  };
  
  // Clase para animación condicional
  const animationClass = animated ? 'transition-all duration-500 ease-in-out' : '';
  
  // Renderizamos la versión iconOnly (solo el icono)
  if (variant === 'iconOnly') {
    return (
      <div className={cn(
        "flex items-center justify-center",
        navbar && "h-8 w-8",
        className
      )}>
        <div 
          className={cn(
            navbar ? "h-full w-full" : sizeClasses[size],
            "overflow-hidden relative flex-shrink-0 rounded-md", // Añadido rounded-md para bordes redondeados
            animationClass
          )}
          style={{
            aspectRatio: "1/1"
          }}
        >
          <img 
            src={iconLogoSrc} 
            alt={aria} 
            className="object-cover absolute left-0 h-auto w-full max-w-none"
            style={{
              objectPosition: "0% 50%", // Ajustado para enfocar el icono correctamente
              transform: "scale(2.5)", // Aumentado el scale para enfocar más en el icono
              transformOrigin: "10% 50%" // Ajustado el origen de la transformación
            }}
          />
        </div>
      </div>
    );
  }
  
  // Renderizamos el logo completo con ajustes para navbar
  return (
    <div className={cn(
      "flex items-center justify-center",
      navbar && "h-10",
      className
    )}>
      <img 
        src={logoSrc} 
        alt={aria} 
        className={cn(
          navbar ? "h-6 max-h-full" : sizeClasses[size], // Altura ajustada para navbar
          "flex-shrink-0",
          animationClass
        )}
        style={{
          maxWidth: "100%",
          height: "auto",
          objectFit: "contain",
          marginLeft: navbar ? "-10px" : "0", // Ajuste del margen izquierdo para navbar
          marginRight: navbar ? "10px" : "0" // Ajuste del margen derecho para navbar
        }}
      />
    </div>
  );
};

export default Logo;
