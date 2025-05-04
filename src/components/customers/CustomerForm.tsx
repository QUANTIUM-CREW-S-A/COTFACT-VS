import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Customer } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Building2, User, MapPin, Phone, Mail, Info, AlertCircle, Tag, Briefcase } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface CustomerFormProps {
  customer: Omit<Customer, 'id'> | Customer;
  setCustomer: (customer: any) => void;
  type: "add" | "edit";
}

// Lista de tipos de cliente más específicos
const customerSubTypes = {
  person: [
    { value: "individual", label: "Cliente Individual" },
    { value: "professional", label: "Profesional Independiente" },
    { value: "student", label: "Estudiante" },
    { value: "other", label: "Otro" }
  ],
  business: [
    { value: "company", label: "Empresa" },
    { value: "government", label: "Entidad Gubernamental" },
    { value: "nonprofit", label: "Sin Fines de Lucro" },
    { value: "other", label: "Otro" }
  ]
};

// Prefijos telefónicos comunes para Panamá y alrededores
const phonePrefixes = [
  { value: "+507", label: "Panamá (+507)" },
  { value: "+506", label: "Costa Rica (+506)" },
  { value: "+503", label: "El Salvador (+503)" },
  { value: "+504", label: "Honduras (+504)" },
  { value: "+502", label: "Guatemala (+502)" },
  { value: "+505", label: "Nicaragua (+505)" },
  { value: "+1", label: "Estados Unidos/Canadá (+1)" },
  { value: "+57", label: "Colombia (+57)" },
  { value: "+58", label: "Venezuela (+58)" },
  { value: "+593", label: "Ecuador (+593)" },
];

// Tipo de interfaz para la referencia
export interface CustomerFormRef {
  validateForm: () => boolean;
}

export const CustomerForm = forwardRef<CustomerFormRef, CustomerFormProps>(({
  customer,
  setCustomer,
  type
}, ref) => {
  // Estado para manejar validaciones
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Estado para prefijo telefónico
  const [phonePrefix, setPhonePrefix] = useState<string>("+507");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  
  // Estado para subtipos de cliente
  const [subType, setSubType] = useState<string>("");
  
  // Exponer la función de validación al componente padre mediante la referencia
  useImperativeHandle(ref, () => ({
    validateForm: () => {
      return validateForm();
    }
  }));
  
  // Inicializar datos al cargar el componente
  useEffect(() => {
    // Extraer prefijo y número si ya existe un teléfono
    if (customer.phone) {
      const phonePattern = /^(\+\d{1,4})\s*(.*)$/;
      const match = customer.phone.match(phonePattern);
      if (match) {
        setPhonePrefix(match[1]);
        setPhoneNumber(match[2]);
      } else {
        setPhoneNumber(customer.phone);
      }
    }
    
    // Inicializar subtipo si existe en metadata
    if (customer.metadata && typeof customer.metadata === 'object' && customer.metadata.subType) {
      setSubType(customer.metadata.subType as string);
    } else if (customer.type === 'business') {
      setSubType('company');
    } else {
      setSubType('individual');
    }
  }, [customer.id]); // Solo al cambiar de cliente
  
  // Validación del formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validar nombre
    if (!customer.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }
    
    // Validar empresa para clientes de tipo business
    if (customer.type === "business" && !customer.company.trim()) {
      newErrors.company = "El nombre de la empresa es obligatorio";
    }
    
    // Validar teléfono
    if (!phoneNumber.trim()) {
      newErrors.phone = "El teléfono es obligatorio";
    } else if (!/^\d[\d\s-]{5,15}$/.test(phoneNumber.trim())) {
      newErrors.phone = "Formato de teléfono inválido";
    }
    
    // Validar email si está presente
    if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      newErrors.email = "Formato de correo electrónico inválido";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Actualizar teléfono completo cuando cambie prefijo o número
  useEffect(() => {
    const formattedPhone = `${phonePrefix} ${phoneNumber}`.trim();
    if (formattedPhone !== customer.phone) {
      setCustomer({...customer, phone: formattedPhone});
    }
  }, [phonePrefix, phoneNumber]);
  
  // Actualizar subtipo cuando cambie
  useEffect(() => {
    if (subType) {
      const updatedMetadata = {
        ...(typeof customer.metadata === 'object' ? customer.metadata : {}),
        subType
      };
      setCustomer({...customer, metadata: updatedMetadata});
    }
  }, [subType]);
  
  return (
    <Card className="border rounded-lg shadow-sm overflow-hidden animate-in fade-in-50 duration-300">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Encabezado y tipo de cliente */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-blue-600 mb-2">
              {customer.type === "business" ? 
                <Building2 className="h-5 w-5" /> : 
                <User className="h-5 w-5" />
              }
              <h3 className="text-lg font-medium">Información del Cliente</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Selección de tipo de cliente */}
              <div className="space-y-2">
                <Label htmlFor={`${type}CustomerType`} className="font-medium flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  Tipo de Cliente <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={customer.type} 
                  onValueChange={(value: "person" | "business") => {
                    const newSubType = value === "business" ? "company" : "individual";
                    setSubType(newSubType);
                    
                    const updatedMetadata = {
                      ...(typeof customer.metadata === 'object' ? customer.metadata : {}),
                      subType: newSubType
                    };
                    
                    setCustomer({
                      ...customer, 
                      type: value, 
                      metadata: updatedMetadata
                    });
                  }}
                >
                  <SelectTrigger id={`${type}CustomerType`} className={cn("w-full", errors.type ? "border-red-300 focus-visible:ring-red-300" : "")}>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="person">Persona Natural</SelectItem>
                    <SelectItem value="business">Empresa / Organización</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subtipo de cliente */}
              <div className="space-y-2">
                <Label htmlFor={`${type}CustomerSubType`} className="font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  Clasificación
                </Label>
                <Select value={subType} onValueChange={setSubType}>
                  <SelectTrigger id={`${type}CustomerSubType`} className="w-full">
                    <SelectValue placeholder="Seleccionar clasificación" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerSubTypes[customer.type].map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          {/* Datos principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda - Información principal */}
            <div className="space-y-4">
              {/* Nombre */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${type}Name`} className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    Nombre {customer.type === "business" ? "de Contacto" : ""} <span className="text-red-500">*</span>
                  </Label>
                  {errors.name && (
                    <div className="text-xs font-medium text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.name}
                    </div>
                  )}
                </div>
                <Input
                  id={`${type}Name`}
                  value={customer.name}
                  onChange={(e) => setCustomer({...customer, name: e.target.value})}
                  className={cn("w-full", errors.name ? "border-red-300 focus-visible:ring-red-300" : "")}
                  placeholder={customer.type === "business" ? "Nombre de la persona de contacto" : "Nombre completo"}
                />
              </div>
              
              {/* Campo de empresa */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${type}Company`} className="font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    {customer.type === "business" ? "Nombre de la Empresa" : "Empresa (Opcional)"}
                    {customer.type === "business" && <span className="text-red-500">*</span>}
                  </Label>
                  {errors.company && (
                    <div className="text-xs font-medium text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.company}
                    </div>
                  )}
                </div>
                <Input
                  id={`${type}Company`}
                  value={customer.company}
                  onChange={(e) => setCustomer({...customer, company: e.target.value})}
                  className={cn("w-full", errors.company ? "border-red-300 focus-visible:ring-red-300" : "")}
                  placeholder={customer.type === "business" ? "Nombre legal de la empresa" : "Empresa donde trabaja (opcional)"}
                />
              </div>

              {/* Teléfono con prefijo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${type}Phone`} className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    Teléfono <span className="text-red-500">*</span>
                  </Label>
                  {errors.phone && (
                    <div className="text-xs font-medium text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.phone}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Select 
                    value={phonePrefix} 
                    onValueChange={setPhonePrefix}
                  >
                    <SelectTrigger id={`${type}PhonePrefix`} className="w-[120px]">
                      <SelectValue placeholder="Prefijo" />
                    </SelectTrigger>
                    <SelectContent>
                      {phonePrefixes.map(prefix => (
                        <SelectItem key={prefix.value} value={prefix.value}>{prefix.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id={`${type}Phone`}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={cn(
                      "flex-1",
                      errors.phone ? "border-red-300 focus-visible:ring-red-300" : ""
                    )}
                    placeholder="Número de teléfono"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Ejemplo: +507 6123-4567
                </p>
              </div>
              
              {/* Email */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${type}Email`} className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    Correo Electrónico
                  </Label>
                  {errors.email && (
                    <div className="text-xs font-medium text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.email}
                    </div>
                  )}
                </div>
                <Input
                  id={`${type}Email`}
                  type="email"
                  value={customer.email || ''}
                  onChange={(e) => setCustomer({...customer, email: e.target.value})}
                  className={cn("w-full", errors.email ? "border-red-300 focus-visible:ring-red-300" : "")}
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>
            
            {/* Columna derecha - Dirección y notas */}
            <div className="space-y-4">
              {/* Ubicación */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${type}Location`} className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    Dirección
                  </Label>
                  {errors.location && (
                    <div className="text-xs font-medium text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.location}
                    </div>
                  )}
                </div>
                <Textarea
                  id={`${type}Location`}
                  value={customer.location}
                  onChange={(e) => setCustomer({...customer, location: e.target.value})}
                  placeholder="Dirección completa"
                  className={cn(
                    "resize-none h-[114px]",
                    errors.location ? "border-red-300 focus-visible:ring-red-300" : ""
                  )}
                />
              </div>
              
              {/* Notas adicionales */}
              <div className="space-y-2">
                <Label htmlFor={`${type}Notes`} className="font-medium flex items-center gap-2">
                  <Info className="h-4 w-4 text-gray-500" />
                  Notas (Opcional)
                </Label>
                <Textarea
                  id={`${type}Notes`}
                  value={(customer.metadata?.notes as string) || ''}
                  onChange={(e) => {
                    const updatedMetadata = {
                      ...(typeof customer.metadata === 'object' ? customer.metadata : {}),
                      notes: e.target.value
                    };
                    setCustomer({...customer, metadata: updatedMetadata});
                  }}
                  placeholder="Información adicional sobre el cliente"
                  className="resize-none h-[144px]"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
