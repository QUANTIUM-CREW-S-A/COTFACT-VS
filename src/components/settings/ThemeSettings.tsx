import React from "react";
import { useTheme } from "@/context/theme/ThemeProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Sun, Moon, Monitor } from "lucide-react";

const ThemeSettings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-blue-500" />
          Configuración de Apariencia
        </CardTitle>
        <CardDescription>
          Personaliza la apariencia de la aplicación según tus preferencias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 text-sm font-medium">Selecciona un tema:</h3>
            <RadioGroup 
              defaultValue={theme} 
              value={theme}
              onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem 
                  value="light" 
                  id="light" 
                  className="peer sr-only" 
                />
                <Label 
                  htmlFor="light" 
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Sun className="mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">Modo Claro</span>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem 
                  value="dark" 
                  id="dark" 
                  className="peer sr-only" 
                />
                <Label 
                  htmlFor="dark" 
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Moon className="mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">Modo Oscuro</span>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem 
                  value="system" 
                  id="system" 
                  className="peer sr-only" 
                />
                <Label 
                  htmlFor="system" 
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Monitor className="mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">Sistema</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeSettings;