import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { useDocuments } from "@/context/document/document-context";
import { useSettingsOperations } from "@/hooks/use-settings-operations";

const TermsAndConditionsSettings: React.FC = () => {
  const { companyInfo, setCompanyInfo, templatePreferences, setTemplatePreferences } = useDocuments();
  const { updateTemplatePreferences } = useSettingsOperations(
    companyInfo,
    setCompanyInfo,
    templatePreferences,
    setTemplatePreferences
  );
  
  // Get terms from the template preferences or use default
  const [terms, setTerms] = useState<string[]>(
    templatePreferences.termsAndConditions || [
      "El cliente deberá pagar el 50% al inicio del proyecto y el 50% restante a la entrega.",
      "Los precios están sujetos a cambio sin previo aviso.",
      "Esta cotización es válida por 30 días desde su emisión."
    ]
  );
  
  const [newTerm, setNewTerm] = useState("");
  
  // Update template preferences when terms change
  useEffect(() => {
    // Only update if terms are different from current template preferences
    if (JSON.stringify(terms) !== JSON.stringify(templatePreferences.termsAndConditions)) {
      updateTemplatePreferences({ termsAndConditions: terms });
    }
  }, [terms, templatePreferences.termsAndConditions, updateTemplatePreferences]);
  
  const handleAddTerm = () => {
    if (!newTerm.trim()) {
      toast.error("Por favor ingrese un término o condición");
      return;
    }
    
    const updatedTerms = [...terms, newTerm];
    setTerms(updatedTerms);
    setNewTerm("");
    toast.success("Término agregado");
  };
  
  const handleDeleteTerm = (index: number) => {
    const updatedTerms = [...terms];
    updatedTerms.splice(index, 1);
    setTerms(updatedTerms);
    toast.success("Término eliminado");
  };
  
  const moveTerm = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) || 
      (direction === "down" && index === terms.length - 1)
    ) {
      return;
    }
    
    const newIndex = direction === "up" ? index - 1 : index + 1;
    const updatedTerms = [...terms];
    const term = updatedTerms[index];
    
    updatedTerms.splice(index, 1);
    updatedTerms.splice(newIndex, 0, term);
    
    setTerms(updatedTerms);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Términos y Condiciones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* List of existing terms */}
          <div className="space-y-2">
            {terms.map((term, index) => (
              <div 
                key={index} 
                className="flex items-start p-3 border rounded-md group"
              >
                <div className="flex-1">
                  <p>{term}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveTerm(index, "up")}
                    disabled={index === 0}
                  >
                    <ArrowUpDown className="h-4 w-4 rotate-90" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveTerm(index, "down")}
                    disabled={index === terms.length - 1}
                  >
                    <ArrowUpDown className="h-4 w-4 -rotate-90" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                    onClick={() => handleDeleteTerm(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Form to add new term */}
          <div className="border rounded-md p-4">
            <h3 className="text-lg font-medium mb-4">Agregar Nuevo Término o Condición</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="newTerm">Término o condición</label>
                <Textarea 
                  id="newTerm" 
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  rows={3}
                />
              </div>
              <Button 
                onClick={handleAddTerm}
                className="w-full"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Término
              </Button>
            </div>
          </div>
          
          <div className="p-4 border rounded-md bg-yellow-50">
            <p className="text-sm text-yellow-800">
              Los términos y condiciones se mostrarán en todas las cotizaciones y facturas. Ordénalos según su importancia.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TermsAndConditionsSettings;
