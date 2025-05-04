
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

const AccessDenied: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <ShieldCheck className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Acceso Restringido</h2>
          <p className="text-muted-foreground text-center max-w-md">
            No tienes permisos para acceder a la administración de usuarios.
            Esta sección está disponible solo para administradores.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessDenied;
