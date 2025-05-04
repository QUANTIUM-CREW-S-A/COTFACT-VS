import React from "react";
import { Customer } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, User, Building2, MapPin, Phone, Mail, Info, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CustomerCardProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

// Mapa de tipos de cliente para mostrar etiquetas más descriptivas
const customerSubTypeLabels: Record<string, { label: string, color: string }> = {
  // Personas
  individual: { label: "Cliente Individual", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  professional: { label: "Profesional", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
  student: { label: "Estudiante", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  // Empresas
  company: { label: "Empresa", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300" },
  government: { label: "Entidad Gubernamental", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
  nonprofit: { label: "Sin Fines de Lucro", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300" },
  // Genéricos
  other: { label: "Otro", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300" }
};

export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onEdit,
  onDelete
}) => {
  const subType = customer.metadata?.subType || (customer.type === 'business' ? 'company' : 'individual');
  const subTypeInfo = customerSubTypeLabels[subType] || customerSubTypeLabels.other;
  const hasNotes = customer.metadata?.notes && customer.metadata.notes.trim() !== '';

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex justify-between items-start p-4 border-b">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {customer.type === 'person' ? (
                <User className="h-4 w-4 text-blue-500" />
              ) : (
                <Building2 className="h-4 w-4 text-amber-500" />
              )}
              <div className="font-medium">{customer.name}</div>
            </div>
            <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              {customer.company !== "N/A" && customer.company ? customer.company : "-"}
            </div>
            <div className="mt-2">
              <Badge className={`text-xs font-normal ${subTypeInfo.color}`}>
                <Tag className="h-3 w-3 mr-1" />
                {subTypeInfo.label}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="p-4 space-y-2">
          <div className="text-sm flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
            <span className="text-gray-700">{customer.location || 'No especificada'}</span>
          </div>
          
          <div className="text-sm flex items-center gap-1">
            <Phone className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
            <span className="text-gray-700">{customer.phone}</span>
          </div>
          
          {customer.email && (
            <div className="text-sm flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
              <span className="text-gray-700 break-all">{customer.email}</span>
            </div>
          )}
          
          {hasNotes && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-sm flex items-center gap-1 cursor-help text-blue-600">
                    <Info className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="underline">Ver notas</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px] text-sm bg-blue-50 border-blue-200">
                  {customer.metadata!.notes}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="grid grid-cols-2 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-10 rounded-none border-r hover:bg-blue-50 dark:hover:bg-blue-900/20"
            onClick={() => onEdit(customer)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-10 rounded-none text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20" 
            onClick={() => onDelete(customer.id!)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
