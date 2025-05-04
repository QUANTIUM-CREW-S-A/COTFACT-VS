import React from 'react';
import { useWindowSize } from "@/hooks/use-window-size";
import { Copyright } from 'lucide-react';

const LoginFooter: React.FC = () => {
  const { width } = useWindowSize();
  const isDesktop = width >= 768;

  return (
    <div className="mt-6 text-sm text-gray-500 text-center">
      <p>Sistema de gestión de documentos</p>
      {isDesktop && (
        <p className="mt-2 text-xs flex items-center justify-center gap-1">
          <Copyright className="h-4 w-4" />
          {new Date().getFullYear()} Quantium Crew S.A. Todos los derechos reservados.
        </p>
      )}
    </div>
  );
};

export default LoginFooter;
