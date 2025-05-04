
import React, { useState } from "react";
import { useAuth } from "@/context/auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Lock } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Debe confirmar la contraseña"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

const PasswordChangeSection: React.FC = () => {
  const { authState, updateUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: PasswordFormValues) => {
    // Reset states
    setError(null);
    setSuccess(null);

    if (!authState.currentUser) {
      setError("No hay usuario autenticado");
      return;
    }

    // Verify current password
    if (values.currentPassword !== authState.currentUser.password) {
      setError("La contraseña actual es incorrecta");
      return;
    }

    // Update the password
    const success = updateUser(authState.currentUser.id, {
      password: values.newPassword
    });

    if (success) {
      setSuccess("Contraseña actualizada con éxito");
      form.reset();
    } else {
      setError("No se pudo actualizar la contraseña. Intenta de nuevo.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-0.5">
        <Label className="text-base">Cambiar Contraseña</Label>
        <p className="text-sm text-muted-foreground">
          Actualiza tu contraseña regularmente para mantener tu cuenta segura.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña Actual</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Ingresa tu contraseña actual" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nueva Contraseña</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Ingresa tu nueva contraseña" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Contraseña</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Confirma tu nueva contraseña" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <div className="rounded-md bg-red-50 p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Lock className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          <Button type="submit">Actualizar Contraseña</Button>
        </form>
      </Form>
    </div>
  );
};

export default PasswordChangeSection;
