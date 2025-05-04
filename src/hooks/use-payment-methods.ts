import { useState, useEffect, useCallback, useRef } from "react";
import { useDocuments } from "@/context/document/document-context";
import { PaymentMethod } from "@/types";
import { toast } from "sonner";
import * as api from "@/services/api";
import { useAuth } from "@/context/auth";
import { supabase } from "@/integrations/supabase/client";
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Definir tipos para los eventos de Supabase
interface PaymentMethodRecord {
  id: string;
  details: {
    bank: string;
    accountHolder: string;
    accountNumber: string;
    accountType: string;
    isYappy: boolean;
    yappyLogo: string;
    yappyPhone: string;
  };
  [key: string]: unknown; // Para otros campos que puedan existir
}

export function usePaymentMethods() {
  const { documents, setDocuments } = useDocuments();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { authState } = useAuth();
  
  // Referencias para el control de carga y actualización
  const hasLoadedData = useRef(false);
  const updateTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Función para actualizar los métodos de pago en documentos
  const updatePaymentMethodsInDocuments = useCallback((updatedMethods: PaymentMethod[]) => {
    const updatedDocuments = documents.map(doc => ({
      ...doc,
      paymentMethods: updatedMethods
    }));
    
    setDocuments(updatedDocuments);
  }, [documents, setDocuments]);
  
  // Cargar métodos de pago desde Supabase (con control para evitar cargas innecesarias)
  const loadPaymentMethods = useCallback(async (forceReload = false) => {
    // No cargar si ya se cargaron los datos y no se fuerza la recarga
    if (!forceReload && hasLoadedData.current) return;
    if (!authState.isAuthenticated || !authState.currentUser?.id) return;
    
    setIsLoading(true);
    try {
      const methods = await api.getPaymentMethods();
      if (methods && methods.length > 0) {
        setPaymentMethods(methods);
        updatePaymentMethodsInDocuments(methods);
        console.log("Payment methods loaded successfully:", methods);
      } else {
        console.log("No payment methods found in database");
      }
      // Marcar que los datos se cargaron exitosamente
      hasLoadedData.current = true;
    } catch (error) {
      console.error("Error al cargar métodos de pago:", error);
      toast.error("Error al cargar métodos de pago");
    } finally {
      setIsLoading(false);
    }
  }, [authState.isAuthenticated, authState.currentUser?.id, updatePaymentMethodsInDocuments]);
  
  // Versión con debounce para las actualizaciones
  const debouncedReload = useCallback(() => {
    // Cancelar timeout anterior si existe
    if (updateTimeout.current) {
      clearTimeout(updateTimeout.current);
    }
    
    // Crear nuevo timeout con 300ms de espera
    updateTimeout.current = setTimeout(() => {
      loadPaymentMethods(true);
    }, 300);
  }, [loadPaymentMethods]);
  
  // Actualizar método de pago desde evento de tiempo real
  const handleRealtimeUpdate = useCallback((payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
    console.log("Payment method change detected:", payload);
    
    // En lugar de recargar todos los datos, actualizar solo lo que cambió
    const { eventType } = payload;
    
    if (eventType === 'INSERT') {
      // Convertir formato de supabase al formato de la aplicación
      // Cast type to access the 'new' property that exists in INSERT events
      const newRecord = (payload as any).new as PaymentMethodRecord; 
      const details = newRecord.details;
      
      if (!details) {
        console.error("Error: Datos de método de pago incompletos");
        return;
      }
      
      const formattedMethod: PaymentMethod = {
        id: newRecord.id,
        bank: details?.bank || '',
        accountHolder: details?.accountHolder || '',
        accountNumber: details?.accountNumber || '',
        accountType: details?.accountType || '',
        isYappy: details?.isYappy || false,
        yappyLogo: details?.yappyLogo || '',
        yappyPhone: details?.yappyPhone || ''
      };
      
      setPaymentMethods(prev => {
        const newMethods = [...prev, formattedMethod];
        updatePaymentMethodsInDocuments(newMethods);
        return newMethods;
      });
    } 
    else if (eventType === 'DELETE') {
      // Cast type to access the 'old' property that exists in DELETE events
      const oldRecord = (payload as any).old as PaymentMethodRecord;
      const deletedId = oldRecord.id;
      
      setPaymentMethods(prev => {
        const newMethods = prev.filter(method => method.id !== deletedId);
        updatePaymentMethodsInDocuments(newMethods);
        return newMethods;
      });
    }
    else if (eventType === 'UPDATE') {
      // Usar versión con debounce para evitar múltiples recargas
      debouncedReload();
    }
  }, [debouncedReload, updatePaymentMethodsInDocuments]);
  
  // Set up real-time subscription for payment methods
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.currentUser?.id) return;
    
    console.log("Setting up real-time subscription for payment methods");
    
    const paymentMethodsChannel = supabase
      .channel('payment-methods-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'payment_methods',
        filter: `user_id=eq.${authState.currentUser.id}`
      }, handleRealtimeUpdate)
      .subscribe();
    
    return () => {
      console.log("Cleaning up payment methods subscription");
      supabase.removeChannel(paymentMethodsChannel);
    };
  }, [authState.isAuthenticated, authState.currentUser?.id, handleRealtimeUpdate]);

  // Load payment methods on init - just once when authenticated
  useEffect(() => {
    if (authState.isAuthenticated && !hasLoadedData.current) {
      loadPaymentMethods();
    } else if (documents.length > 0 && !hasLoadedData.current) {
      // Si no está autenticado pero hay documentos, obtener métodos de pago desde ahí
      setPaymentMethods(documents[0].paymentMethods || []);
      hasLoadedData.current = true;
    }
  }, [authState.isAuthenticated, documents, loadPaymentMethods]);
  
  // Handlers sin cambios
  const handleAddMethod = async (newMethodData: Omit<PaymentMethod, "id">) => {
    try {
      // Ensure we have a user_id for the payment method
      const userId = authState.currentUser?.id;
      
      if (!userId && authState.isAuthenticated) {
        console.error("Error: Usuario autenticado pero sin ID");
        toast.error("Error al obtener información de usuario");
        return;
      }
      
      let method: PaymentMethod;
      
      if (authState.isAuthenticated) {
        // Guardar en Supabase si está autenticado
        // Para llamadas a la API, necesitamos pasar un user_id válido para operaciones en la base de datos
        const apiData = {
          ...newMethodData
        };
        
        // Añadimos user_id solo para la llamada a la API, no como parte del objeto PaymentMethod
        const savedMethod = await api.createPaymentMethod({
          ...apiData,
          user_id: userId
        });
        
        method = savedMethod;
      } else {
        // Modo local si no está autenticado
        method = {
          id: Date.now().toString(),
          ...newMethodData
        };
      }
      
      const updatedMethods = [...paymentMethods, method];
      setPaymentMethods(updatedMethods);
      updatePaymentMethodsInDocuments(updatedMethods);
      
      toast.success("Método de pago agregado y aplicado a todos los documentos");
    } catch (error) {
      console.error("Error al agregar método de pago:", error);
      toast.error("Error al agregar método de pago");
    }
  };
  
  const handleAddYappyMethod = async (yappyPhone: string, yappyLogo: string) => {
    const existingYappyIndex = paymentMethods.findIndex(method => method.isYappy);
    
    const yappyMethod: PaymentMethod = {
      id: existingYappyIndex >= 0 ? paymentMethods[existingYappyIndex].id : Date.now().toString(),
      bank: "Yappy",
      accountHolder: "Yappy",
      accountNumber: yappyPhone,
      accountType: "Mobile",
      isYappy: true,
      yappyPhone: yappyPhone,
      yappyLogo: yappyLogo
    };
    
    let updatedPaymentMethods: PaymentMethod[];
    
    try {
      if (existingYappyIndex >= 0) {
        if (authState.isAuthenticated && authState.currentUser) {
          // Actualizar en Supabase si está autenticado
          // Solo pasamos las propiedades del método de pago sin user_id para la actualización
          await api.updatePaymentMethod(yappyMethod.id, yappyMethod);
        }
        
        updatedPaymentMethods = [
          ...paymentMethods.slice(0, existingYappyIndex),
          yappyMethod,
          ...paymentMethods.slice(existingYappyIndex + 1)
        ];
      } else {
        if (authState.isAuthenticated && authState.currentUser) {
          // Crear en Supabase si está autenticado
          // Para la creación separamos el objeto para la API y para la interfaz
          const apiData = {
            ...yappyMethod
          };
          
          const savedMethod = await api.createPaymentMethod({
            ...apiData,
            user_id: authState.currentUser.id
          });
          
          yappyMethod.id = savedMethod.id;
        }
        
        updatedPaymentMethods = [...paymentMethods, yappyMethod];
      }
      
      setPaymentMethods(updatedPaymentMethods);
      updatePaymentMethodsInDocuments(updatedPaymentMethods);
      toast.success("Método de pago Yappy agregado y aplicado a todos los documentos");
    } catch (error) {
      console.error("Error con método Yappy:", error);
      toast.error("Error al configurar método Yappy");
    }
  };
  
  const handleDeleteMethod = async (id: string) => {
    try {
      if (authState.isAuthenticated) {
        // Eliminar de Supabase si está autenticado
        await api.deletePaymentMethod(id);
      }
      
      const updatedPaymentMethods = paymentMethods.filter(method => method.id !== id);
      setPaymentMethods(updatedPaymentMethods);
      updatePaymentMethodsInDocuments(updatedPaymentMethods);
      setMethodToDelete(null);
      toast.success("Método de pago eliminado de todos los documentos");
    } catch (error) {
      console.error("Error al eliminar método de pago:", error);
      toast.error("Error al eliminar método de pago");
    }
  };
  
  return {
    paymentMethods,
    methodToDelete,
    setMethodToDelete,
    handleAddMethod,
    handleAddYappyMethod,
    handleDeleteMethod,
    isLoading,
    loadPaymentMethods // Exponemos esta función para permitir cargas manuales cuando sea necesario
  };
}
