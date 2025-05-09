import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useDocuments } from "@/hooks/use-documents-context";
import { Document, LineItem, Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Plus, Trash2, FileText, Save, ArrowLeft, Eye, User, Building, UserPlus
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import DocumentPreview from "./DocumentPreview";
import { defaultTermsAndConditions, defaultPaymentMethods } from "@/lib/mockData";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

/*
 * Formulario principal para crear y editar documentos (cotizaciones/facturas).
 * - Permite seleccionar o crear clientes, agregar productos/servicios y calcular totales.
 * - Incluye pestañas para formulario y vista previa.
 * - Gestiona la lógica de guardado, edición y validación de datos del documento.
 */
interface DocumentFormProps {
  type: "quote" | "invoice";
  editId?: string;
}

const emptyLineItem: LineItem = {
  id: "",
  description: "",
  quantity: 1,
  unitPrice: 0,
  total: 0,
};

const emptyCustomer: Customer = {
  name: "",
  company: "",
  location: "",
  phone: "",
  type: "person"
};

const DocumentForm: React.FC<DocumentFormProps> = ({ type, editId }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { 
    documents = [], 
    addDocument, 
    updateDocument, 
    getNextDocumentNumber,
    customers = [], // Proporcionar un valor por defecto para evitar errores
    addCustomer
  } = useDocuments() || {}; // Añadir operador OR con objeto vacío para evitar errores de desestructuración

  const [activeTab, setActiveTab] = useState("form");
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [customer, setCustomer] = useState<Customer>(emptyCustomer);
  const [items, setItems] = useState<LineItem[]>([{ ...emptyLineItem, id: uuidv4() }]);
  const [validDays, setValidDays] = useState(15);
  const [tax, setTax] = useState(7); // 7% default tax rate for Panama
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Omit<Customer, 'id'>>(emptyCustomer);

  useEffect(() => {
    if (editId) {
      const docToEdit = documents.find(doc => doc.id === editId);
      if (docToEdit) {
        setEditingDocument(docToEdit);
        setDate(docToEdit.date);
        setCustomer(docToEdit.customer);
        if (docToEdit.customer.id) {
          setSelectedCustomerId(docToEdit.customer.id);
        }
        setItems(docToEdit.items);
        setValidDays(docToEdit.validDays);
        setTax(Math.round((docToEdit.tax / docToEdit.subtotal) * 100));
      }
    }
  }, [editId, documents]);

  useEffect(() => {
    if (selectedCustomerId) {
      const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
      if (selectedCustomer) {
        setCustomer(selectedCustomer);
      }
    } else {
      setCustomer(emptyCustomer);
    }
  }, [selectedCustomerId, customers]);

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTaxAmount = () => {
    const subtotal = calculateSubtotal();
    return subtotal * (tax / 100);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxAmount = calculateTaxAmount();
    return subtotal + taxAmount;
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const updatedItems = [...items];
    
    if (field === 'unitPrice' || field === 'quantity') {
      const price = field === 'unitPrice' ? Number(value) : updatedItems[index].unitPrice;
      const quantity = field === 'quantity' ? Number(value) : updatedItems[index].quantity;
      
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: Number(value),
        total: price * quantity
      };
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };
    }
    
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, { ...emptyLineItem, id: uuidv4() }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const updatedItems = [...items];
      updatedItems.splice(index, 1);
      setItems(updatedItems);
    }
  };

  const handleCustomerChange = (field: keyof Customer, value: string) => {
    setCustomer(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNewCustomerChange = (field: keyof Customer, value: string) => {
    setNewCustomer(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetNewCustomer = () => {
    setNewCustomer({
      name: "",
      company: "",
      location: "",
      phone: "",
      email: "",
      type: "person"
    });
  };

  const handleAddNewCustomer = () => {
    if (!newCustomer.name) {
      toast.error("El nombre del cliente es requerido");
      return;
    }
    
    addCustomer(newCustomer);
    setIsNewCustomerDialogOpen(false);
    
    setTimeout(() => {
      const newlyAddedCustomer = customers.find(c => 
        c.name === newCustomer.name && 
        c.phone === newCustomer.phone
      );
      
      if (newlyAddedCustomer && newlyAddedCustomer.id) {
        setSelectedCustomerId(newlyAddedCustomer.id);
        setCustomer(newlyAddedCustomer);
      }
      
      resetNewCustomer();
    }, 100);
  };

  const handleSubmit = () => {
    if (!customer.name) {
      toast.error("Debe seleccionar o crear un cliente");
      return;
    }

    const subtotal = calculateSubtotal();
    const taxAmount = calculateTaxAmount();
    const total = calculateTotal();
    
    const currentDate = new Date().toISOString();

    const documentData: Omit<Document, 'id'> = {
      documentNumber: editingDocument ? editingDocument.documentNumber : getNextDocumentNumber(type),
      date,
      customer,
      items,
      subtotal,
      tax: taxAmount,
      total,
      status: editingDocument ? editingDocument.status : "pending",
      type,
      validDays,
      termsAndConditions: defaultTermsAndConditions,
      paymentMethods: defaultPaymentMethods,
      createdAt: editingDocument ? editingDocument.createdAt : currentDate,
      updatedAt: currentDate
    };

    try {
      if (editingDocument) {
        updateDocument(editingDocument.id, documentData);
        toast.success(`${type === "quote" ? 'Cotización' : 'Factura'} actualizada exitosamente`);
      } else {
        addDocument(documentData);
        toast.success(`${type === "quote" ? 'Cotización' : 'Factura'} creada exitosamente`);
      }
      navigate(type === "quote" ? "/" : "/invoices");
    } catch (error) {
      console.error('Error al guardar documento:', error);
      toast.error(`Error al ${editingDocument ? 'actualizar' : 'crear'} ${type === "quote" ? 'cotización' : 'factura'}`);
    }
  };

  const previewDocument = () => {
    setActiveTab("preview");
  };

  return (
    <div className={isMobile ? "py-3" : "container mx-auto py-6"}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)} size={isMobile ? "sm" : "default"}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">
            {editingDocument 
              ? `Editar ${type === "quote" ? "Cotización" : "Factura"}` 
              : `Nueva ${type === "quote" ? "Cotización" : "Factura"}`}
          </h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={previewDocument} className="flex-1 sm:flex-auto" size={isMobile ? "sm" : "default"}>
            <Eye className="mr-2 h-4 w-4" />
            Vista previa
          </Button>
          <Button onClick={handleSubmit} className="flex-1 sm:flex-auto" size={isMobile ? "sm" : "default"}>
            <Save className="mr-2 h-4 w-4" />
            Guardar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 w-full justify-start">
          <TabsTrigger value="form" className="flex-1 sm:flex-none">Formulario</TabsTrigger>
          <TabsTrigger value="preview" className="flex-1 sm:flex-none">Vista Previa</TabsTrigger>
        </TabsList>
        
        <TabsContent value="form">
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg">Información del Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="space-y-2">
                  <Label htmlFor="customerSelect">Seleccionar Cliente</Label>
                  <div className="flex gap-2 flex-col sm:flex-row">
                    <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                      <SelectTrigger id="customerSelect" className="w-full">
                        <SelectValue placeholder="Seleccionar cliente existente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">Seleccionar cliente</SelectItem>
                        {customers.map((c) => (
                          <SelectItem key={c.id} value={c.id || ""}>
                            {c.name} {c.company ? `- ${c.company}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() => setIsNewCustomerDialogOpen(true)}
                      className="w-full sm:w-auto"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Nuevo Cliente
                    </Button>
                  </div>
                </div>
                
                {selectedCustomerId ? (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-2">
                      {customer.type === "person" ? (
                        <User className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Building className="h-5 w-5 text-blue-500" />
                      )}
                      <span className="font-medium">{customer.name}</span>
                    </div>
                    {customer.company && (
                      <div>
                        <span className="text-sm text-gray-500">Empresa:</span>
                        <div>{customer.company}</div>
                      </div>
                    )}
                    {customer.location && (
                      <div>
                        <span className="text-sm text-gray-500">Ubicación:</span>
                        <div>{customer.location}</div>
                      </div>
                    )}
                    {customer.phone && (
                      <div>
                        <span className="text-sm text-gray-500">Teléfono:</span>
                        <div>{customer.phone}</div>
                      </div>
                    )}
                    {customer.email && (
                      <div>
                        <span className="text-sm text-gray-500">Email:</span>
                        <div>{customer.email}</div>
                      </div>
                    )}
                    <div className="text-xs text-blue-500 mt-2">
                      <Button variant="link" className="h-auto p-0" onClick={() => setSelectedCustomerId("")}>
                        Cambiar cliente
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 p-4 bg-gray-50 rounded-md text-center">
                    <span className="text-gray-500">Seleccione un cliente existente o cree uno nuevo</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg">Información del Documento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="space-y-2">
                  <Label htmlFor="documentNumber">Número de {type === "quote" ? "Cotización" : "Factura"}</Label>
                  <Input 
                    id="documentNumber" 
                    value={editingDocument ? editingDocument.documentNumber : getNextDocumentNumber(type)}
                    readOnly
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validDays">Días de Validez</Label>
                  <Input 
                    id="validDays" 
                    type="number" 
                    value={validDays}
                    onChange={(e) => setValidDays(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax">Impuesto (%)</Label>
                  <Input 
                    id="tax" 
                    type="number" 
                    value={tax}
                    onChange={(e) => setTax(Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4 sm:mt-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base sm:text-lg">Detalle de Productos/Servicios</CardTitle>
              <Button onClick={addItem} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Agregar
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className={isMobile ? "min-w-[400px] px-4" : ""}>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-1 w-[45%]">Descripción</th>
                        <th className="text-right py-2 px-1 w-[18%]">Precio</th>
                        <th className="text-right py-2 px-1 w-[12%]">Cant.</th>
                        <th className="text-right py-2 px-1 w-[15%]">Total</th>
                        <th className="py-2 px-1 w-[10%]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={item.id} className="border-b">
                          <td className="py-2 px-1">
                            <Input 
                              value={item.description}
                              onChange={(e) => handleItemChange(index, "description", e.target.value)}
                              placeholder="Descripción"
                              className="text-sm"
                            />
                          </td>
                          <td className="py-2 px-1">
                            <Input 
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                              className="text-right text-sm"
                            />
                          </td>
                          <td className="py-2 px-1">
                            <Input 
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                              className="text-right text-sm"
                            />
                          </td>
                          <td className="py-2 px-1 text-right">
                            ${item.total.toFixed(2)}
                          </td>
                          <td className="py-2 px-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeItem(index)}
                              disabled={items.length === 1}
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t">
                        <td colSpan={3} className="text-right py-2 px-1 font-medium">Subtotal:</td>
                        <td className="text-right py-2 px-1">${calculateSubtotal().toFixed(2)}</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="text-right py-2 px-1 font-medium">Impuesto ({tax}%):</td>
                        <td className="text-right py-2 px-1">${calculateTaxAmount().toFixed(2)}</td>
                        <td></td>
                      </tr>
                      <tr className="font-bold">
                        <td colSpan={3} className="text-right py-2 px-1">Total:</td>
                        <td className="text-right py-2 px-1">${calculateTotal().toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview" className="px-0 sm:px-4">
          {activeTab === "preview" && (
            <DocumentPreview
              document={{
                id: editingDocument ? editingDocument.id : "preview",
                documentNumber: editingDocument ? editingDocument.documentNumber : getNextDocumentNumber(type),
                date,
                customer,
                items,
                subtotal: calculateSubtotal(),
                tax: calculateTaxAmount(),
                total: calculateTotal(),
                status: "pending",
                type,
                validDays,
                termsAndConditions: defaultTermsAndConditions,
                paymentMethods: defaultPaymentMethods,
                createdAt: editingDocument ? editingDocument.createdAt : new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }}
            />
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isNewCustomerDialogOpen} onOpenChange={setIsNewCustomerDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
            <DialogDescription>
              Complete la información del cliente a continuación.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="customerType">Tipo de Cliente</Label>
              <Select 
                value={newCustomer.type} 
                onValueChange={(value: "person" | "business") => 
                  handleNewCustomerChange("type", value)
                }
              >
                <SelectTrigger id="customerType">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="person">Persona</SelectItem>
                  <SelectItem value="business">Empresa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="name">Nombre {newCustomer.type === "business" ? "de Contacto" : ""}</Label>
              <Input
                id="name"
                value={newCustomer.name}
                onChange={(e) => handleNewCustomerChange("name", e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="company">
                {newCustomer.type === "business" ? "Nombre de la Empresa" : "Empresa (Opcional)"}
              </Label>
              <Input
                id="company"
                value={newCustomer.company}
                onChange={(e) => handleNewCustomerChange("company", e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={newCustomer.location}
                onChange={(e) => handleNewCustomerChange("location", e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={newCustomer.phone}
                onChange={(e) => handleNewCustomerChange("phone", e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={newCustomer.email}
                onChange={(e) => handleNewCustomerChange("email", e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewCustomerDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddNewCustomer}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentForm;
