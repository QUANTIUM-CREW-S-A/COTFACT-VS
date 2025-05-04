import { useState, useEffect, useCallback } from 'react';
import { Customer, Document } from '@/types';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import * as api from '@/services/api';
import { supabase } from '@/lib/supabase';

export function useCustomerOperations(
  customers: Customer[],
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>,
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>
) {
  const { authState } = useAuth();
  
  // Set up real-time subscription for customers
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.currentUser?.id) return;
    
    console.log("Setting up real-time subscription for customers");
    
    const customersChannel = supabase
      .channel('customers-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'customers',
        filter: `user_id=eq.${authState.currentUser.id}`
      }, (payload) => {
        console.log("Customer change detected:", payload);
        
        // Reload customers data when changes occur
        api.getCustomers()
          .then(data => {
            if (data && Array.isArray(data)) {
              // Format customers from Supabase response
              const formattedCustomers: Customer[] = data.map(customer => ({
                id: customer.id,
                name: customer.name,
                company: typeof customer.address === 'object' ? ((customer.address as any)?.company || '') : '',
                location: typeof customer.address === 'object' ? ((customer.address as any)?.location || '') : '',
                phone: customer.phone || '',
                email: customer.email || '',
                type: 'business' // Default value for UI
              }));
              
              setCustomers(formattedCustomers);
              console.log("Customers updated from real-time event");
            }
          })
          .catch(error => console.error("Error getting customers after real-time event:", error));
      })
      .subscribe();
      
    return () => {
      console.log("Cleaning up customers subscription");
      supabase.removeChannel(customersChannel);
    };
  }, [authState.isAuthenticated, authState.currentUser?.id, setCustomers]);
  
  // Customer management functions
  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    try {
      // Asegurarse de que tengamos un usuario autenticado
      if (!authState.isAuthenticated || !authState.currentUser?.id) {
        toast.error('Necesitas iniciar sesión para realizar esta acción');
        return null;
      }
      
      // Verificar que el ID de usuario sea un UUID válido
      const userId = authState.currentUser.id;
      
      // Log para depuración
      console.log("User ID para crear cliente:", userId);
      
      if (!userId || userId === 'anonymous' || userId.includes('-') === false) {
        toast.error('Error en la autenticación. Por favor, intente iniciar sesión nuevamente.');
        console.error("Invalid user ID format:", userId);
        return null;
      }
      
      // Preparar el objeto para la API de Supabase
      const customerWithUserId = {
        user_id: userId,
        name: customer.name,
        address: { 
          company: customer.company || '',
          location: customer.location || '' 
        },
        phone: customer.phone || '',
        email: customer.email || ''
      };
      
      console.log("Enviando cliente a Supabase:", customerWithUserId);
      
      const savedCustomer = await api.createCustomer(customerWithUserId);
      
      // Convert Supabase response to Customer type
      const customerFormatted: Customer = {
        id: savedCustomer.id,
        name: savedCustomer.name,
        company: typeof savedCustomer.address === 'object' ? (savedCustomer.address as any).company || '' : '',
        location: typeof savedCustomer.address === 'object' ? (savedCustomer.address as any).location || '' : '',
        phone: savedCustomer.phone || '',
        email: savedCustomer.email || '',
        type: 'business' // Fijamos un valor predeterminado para la UI
      };
      
      // Update local state immediately for a responsive UI
      setCustomers(prev => [customerFormatted, ...prev]);
      toast.success('Cliente agregado exitosamente');
      return customerFormatted;
    } catch (error) {
      console.error('Error al agregar cliente:', error);
      toast.error('Error al agregar cliente');
      return null;
    }
  };

  const updateCustomer = async (id: string, updatedCustomer: Customer) => {
    try {
      // Verificar autenticación
      if (!authState.isAuthenticated || !authState.currentUser?.id) {
        toast.error('Necesitas iniciar sesión para realizar esta acción');
        return null;
      }
      
      // Verificar formato del ID de usuario
      const userId = authState.currentUser.id;
      
      if (!userId || userId === 'anonymous' || userId.includes('-') === false) {
        toast.error('Error en la autenticación. Por favor, intente iniciar sesión nuevamente.');
        console.error("Invalid user ID format for update:", userId);
        return null;
      }
      
      // Preparar el objeto para actualizar en Supabase
      const customerForDB = {
        user_id: userId,
        name: updatedCustomer.name,
        address: {
          company: updatedCustomer.company || '',
          location: updatedCustomer.location || ''
        },
        phone: updatedCustomer.phone || '',
        email: updatedCustomer.email || ''
        // Eliminamos el campo type ya que no existe en la tabla
      };
      
      console.log("Actualizando cliente en Supabase:", id, customerForDB);
      
      const data = await api.updateCustomer(id, customerForDB);
      
      // Convert Supabase response to Customer type
      const customerFormatted: Customer = {
        id: data.id,
        name: data.name,
        company: typeof data.address === 'object' ? (data.address as any).company || '' : '',
        location: typeof data.address === 'object' ? (data.address as any).location || '' : '',
        phone: data.phone || '',
        email: data.email || '',
        type: 'business' // Valor predeterminado para UI
      };
      
      setCustomers(prev => prev.map(customer => customer.id === id ? customerFormatted : customer));
      
      // También actualizar cualquier documento que referencie a este cliente
      setDocuments(prev => prev.map(doc => {
        if (doc.customer.id === id) {
          return { ...doc, customer: customerFormatted };
        }
        return doc;
      }));
      
      toast.success('Cliente actualizado exitosamente');
      return customerFormatted;
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      toast.error('Error al actualizar cliente');
      return null;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      if (!authState.isAuthenticated) {
        toast.error('Necesitas iniciar sesión para realizar esta acción');
        return;
      }
      
      await api.deleteCustomer(id);
      setCustomers(prev => prev.filter(customer => customer.id !== id));
      toast.success('Cliente eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      toast.error('Error al eliminar cliente');
    }
  };

  return {
    addCustomer,
    updateCustomer,
    deleteCustomer
  };
}
