import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { AuthState } from "../types";
import { toast } from "sonner";

// Tipo de actividad que se puede registrar
export type ActivityType = 
  | 'login'
  | 'logout'
  | 'password_change'
  | 'password_reset'
  | 'failed_login'
  | 'account_locked'
  | 'account_unlocked'
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'settings_changed'
  | 'export_data'
  | 'other';

export type ActivitySeverity = 
  | 'info'
  | 'warning'
  | 'critical';

export interface ActivityLogEntry {
  id?: string;
  user_id: string;
  username?: string;
  activity_type: ActivityType;
  description: string;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
  severity: ActivitySeverity;
  details?: any;
}

interface UseActivityLogProps {
  authState: AuthState;
}

/**
 * Hook para manejar el registro de actividades de usuarios
 */
export const useActivityLog = ({ authState }: UseActivityLogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Registra una nueva actividad en el sistema
   */
  const logActivity = useCallback(async (
    activityType: ActivityType,
    description: string,
    severity: ActivitySeverity = 'info',
    details?: any
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Obtener información del usuario actual
      const userId = authState.currentUser?.id || 'anonymous';
      const username = authState.currentUser?.username || 'anonymous';
      
      // Obtener información del cliente
      const userAgent = navigator.userAgent;
      
      // Crear la entrada de registro
      const activityEntry: ActivityLogEntry = {
        user_id: userId,
        username: username,
        activity_type: activityType,
        description,
        ip_address: 'client-side', // No podemos obtener IP real desde el cliente
        user_agent: userAgent,
        created_at: new Date().toISOString(),
        severity,
        details: details ? JSON.stringify(details) : null
      };
      
      // Guardar en la base de datos
      const { error } = await supabase
        .from('activity_logs')
        .insert(activityEntry);
      
      if (error) {
        console.error("Error registrando actividad:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error en el registro de actividad:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [authState.currentUser]);

  /**
   * Obtiene los registros de actividad para un usuario específico o todos si es admin
   */
  const getActivityLogs = useCallback(async (
    limit = 100, 
    userId?: string,
    activityType?: ActivityType,
    fromDate?: string,
    toDate?: string
  ) => {
    try {
      setIsLoading(true);
      
      // Verificar permisos - solo admins pueden ver logs de otros usuarios
      const isAdmin = authState.currentUser?.role === 'admin' || authState.currentUser?.role === 'root';
      const targetUserId = (isAdmin && userId) ? userId : authState.currentUser?.id;
      
      if (!targetUserId) {
        throw new Error("Usuario no autenticado");
      }
      
      // Construir la consulta base
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      // Filtrar por usuario si no es admin o si se especifica un usuario siendo admin
      if (!isAdmin || (isAdmin && userId)) {
        query = query.eq('user_id', targetUserId);
      }
      
      // Filtros adicionales
      if (activityType) {
        query = query.eq('activity_type', activityType);
      }
      
      if (fromDate) {
        query = query.gte('created_at', fromDate);
      }
      
      if (toDate) {
        query = query.lte('created_at', toDate);
      }
      
      // Ejecutar la consulta
      const { data, error } = await query;
      
      if (error) {
        console.error("Error obteniendo registros de actividad:", error);
        toast.error("Error al cargar el registro de actividades");
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Error en getActivityLogs:", error);
      toast.error("Error al obtener registros de actividad");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [authState.currentUser]);

  /**
   * Elimina registros de actividad antiguos (solo para administradores)
   */
  const clearOldActivityLogs = useCallback(async (daysToKeep = 90): Promise<boolean> => {
    try {
      // Verificar si es administrador
      if (authState.currentUser?.role !== 'admin' && authState.currentUser?.role !== 'root') {
        toast.error("No tienes permisos para eliminar registros");
        return false;
      }
      
      setIsLoading(true);
      
      // Calcular la fecha límite
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      const cutoffDateStr = cutoffDate.toISOString();
      
      // Eliminar registros anteriores a la fecha límite
      const { error } = await supabase
        .from('activity_logs')
        .delete()
        .lt('created_at', cutoffDateStr);
      
      if (error) {
        console.error("Error eliminando registros antiguos:", error);
        toast.error("Error al eliminar registros antiguos");
        return false;
      }
      
      toast.success(`Registros anteriores a ${daysToKeep} días eliminados`);
      return true;
    } catch (error) {
      console.error("Error en clearOldActivityLogs:", error);
      toast.error("Error al limpiar registros antiguos");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [authState.currentUser]);

  return {
    logActivity,
    getActivityLogs,
    clearOldActivityLogs,
    isLoading
  };
};