import { useState, useEffect, useCallback, useRef } from "react";
import { useDocuments } from "@/context/document/document-context";
import { PaymentMethod } from "@/types";
import { toast } from "sonner";
import * as api from "@/services/api";
import { useAuth } from "@/context/auth";
import { enableRealtimeForTable, disableRealtimeForTable } from "@/services/api/realtime";
import { ApiError, ErrorType } from "@/services/api/utils";

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

  // Helper para formatear métodos de pago desde la respuesta de Supabase
  const formatPaymentMethodFromDB = useCallback((data: any): PaymentMethod => {
    const details = data.details || {};
    return {
      id: data.id,
      bank: details.bank || '',
      accountHolder: details.accountHolder || '',
      accountNumber: details.accountNumber || '',
      accountType: details.accountType || '',
      isYappy: details.isYappy || false,
      yappyLogo: details.yappyLogo || '',
      yappyPhone: details.yappyPhone || ''
    };
  }, []);
  
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
      
      // Usar nuestro sistema de manejo de errores mejorado
      if (error instanceof ApiError) {
        switch(error.type) {
          case ErrorType.NETWORK:
            toast.error("Error de conexión al cargar métodos de pago");
            break;
          case ErrorType.PERMISSION:
            toast.error("No tienes permisos para acceder a los métodos de pago");
            break;
          default:
            toast.error("Error al cargar métodos de pago");
        }
      } else {
        toast.error("Error al cargar métodos de pago");
      }
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
  
  // Set up real-time subscription for payment methods using our improved realtime utility
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.currentUser?.id) return;
    
    console.log("Setting up real-time subscription for payment methods");
    
    // Usar nuestro helper mejorado para suscripciones realtime
    const enableSubscription = async () => {
      await enableRealtimeForTable('payment_methods', (payload) => {
        console.log("Payment method change detected:", payload);
        
        // Procesar el cambio en base al tipo de evento
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        if (eventType === 'INSERT') {
          // Si es un método creado por este mismo usuario, actualizar la lista
          if (newRecord && newRecord.user_id === authState.currentUser?.id) {
            setPaymentMethods(prev => {
              // Verificar que no exista ya (para evitar duplicados)
              const exists = prev.some(method => method.id === newRecord.id);
              if (!exists) {
                const formattedMethod = formatPaymentMethodFromDB(newRecord);
                const newMethods = [...prev, formattedMethod];
                updatePaymentMethodsInDocuments(newMethods);
                return newMethods;
              }
              return prev;
            });
          }
        } 
        else if (eventType === 'UPDATE') {
          // Actualizar el método existente
          if (newRecord && oldRecord && newRecord.user_id === authState.currentUser?.id) {
            setPaymentMethods(prev => {
              const updatedMethods = prev.map(method => 
                method.id === oldRecord.id 
                  ? formatPaymentMethodFromDB(newRecord) 
                  : method
              );
              updatePaymentMethodsInDocuments(updatedMethods);
              return updatedMethods;
            });
          }
        }
        else if (eventType === 'DELETE') {
          // Eliminar el método de la lista
          if (oldRecord) {
            setPaymentMethods(prev => {
              const filteredMethods = prev.filter(method => method.id !== oldRecord.id);
              updatePaymentMethodsInDocuments(filteredMethods);
              return filteredMethods;
            });
          }
        }
      });
    };
    
    enableSubscription();
    
    return () => {
      console.log("Cleaning up payment methods subscription");
      disableRealtimeForTable('payment_methods');
    };
  }, [authState.isAuthenticated, authState.currentUser?.id, formatPaymentMethodFromDB, updatePaymentMethodsInDocuments]);

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
  
  // Handlers mejorados con manejo de errores
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
        
        method = formatPaymentMethodFromDB(savedMethod);
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
      
      // Usar nuestro sistema de manejo de errores mejorado
      if (error instanceof ApiError) {
        switch(error.type) {
          case ErrorType.NETWORK:
            toast.error("Error de conexión al crear método de pago");
            break;
          case ErrorType.PERMISSION:
            toast.error("No tienes permisos para crear métodos de pago");
            break;
          case ErrorType.DUPLICATE:
            toast.error("Ya existe un método de pago con esta información");
            break;
          case ErrorType.VALIDATION:
            toast.error("Datos inválidos: " + error.message);
            break;
          default:
            toast.error("Error al crear método de pago: " + error.message);
        }
      } else {
        toast.error("Error al agregar método de pago");
      }
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
      
      // Usar nuestro sistema de manejo de errores mejorado
      if (error instanceof ApiError) {
        switch(error.type) {
          case ErrorType.NETWORK:
            toast.error("Error de conexión al configurar Yappy");
            break;
          case ErrorType.PERMISSION:
            toast.error("No tienes permisos para configurar Yappy");
            break;
          default:
            toast.error("Error al configurar Yappy: " + error.message);
        }
      } else {
        toast.error("Error al configurar método Yappy");
      }
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
      
      // Usar nuestro sistema de manejo de errores mejorado
      if (error instanceof ApiError) {
        switch(error.type) {
          case ErrorType.NETWORK:
            toast.error("Error de conexión al eliminar método de pago");
            break;
          case ErrorType.NOT_FOUND:
            toast.error("No se encontró el método de pago");
            break;
          case ErrorType.PERMISSION:
            toast.error("No tienes permisos para eliminar este método de pago");
            break;
          default:
            toast.error("Error al eliminar método de pago: " + error.message);
        }
      } else {
        toast.error("Error al eliminar método de pago");
      }
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
    loadPaymentMethods,
    formatPaymentMethodFromDB // Exponemos el helper de formateo para uso externo
  };
}
