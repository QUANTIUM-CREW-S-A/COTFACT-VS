
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Smartphone } from "lucide-react";
import { toast } from "sonner";
import LogoUpload from "@/components/LogoUpload";

interface YappyPaymentMethodFormProps {
  onAddYappyMethod: (yappyPhone: string, yappyLogo: string) => void;
}

const YappyPaymentMethodForm: React.FC<YappyPaymentMethodFormProps> = ({ onAddYappyMethod }) => {
  const [yappyPhone, setYappyPhone] = useState("");
  const [yappyLogo, setYappyLogo] = useState("/placeholder.svg");
  
  const handleAddYappyMethod = () => {
    // Simple validation
    if (!yappyPhone) {
      toast.error("Por favor ingrese el número de teléfono Yappy");
      return;
    }
    
    onAddYappyMethod(yappyPhone, yappyLogo);
    
    // Reset form
    setYappyPhone("");
    setYappyLogo("/placeholder.svg");
  };
  
  const handleLogoChange = (logoUrl: string) => {
    setYappyLogo(logoUrl);
  };
  
  return (
    <div className="border rounded-md p-4 mt-6">
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        <Smartphone className="h-5 w-5" />
        Agregar Método de Pago Yappy
      </h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="yappyPhone">Número de Yappy</Label>
          <Input 
            id="yappyPhone" 
            value={yappyPhone}
            onChange={(e) => setYappyPhone(e.target.value)}
            placeholder="Ejemplo: +507 6123-4567"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Logo de Yappy</Label>
          <LogoUpload 
            initialLogo={yappyLogo} 
            onLogoChange={handleLogoChange} 
          />
        </div>
      </div>
      
      <Button 
        onClick={handleAddYappyMethod}
        className="mt-4 w-full"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Agregar Método de Pago Yappy
      </Button>
    </div>
  );
};

export default YappyPaymentMethodForm;
