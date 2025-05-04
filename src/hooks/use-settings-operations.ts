import { CompanyInfo, TemplatePreferences } from '@/types';
import * as api from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth';

export function useSettingsOperations(
  companyInfo: CompanyInfo,
  setCompanyInfo: React.Dispatch<React.SetStateAction<CompanyInfo>>,
  templatePreferences: TemplatePreferences,
  setTemplatePreferences: React.Dispatch<React.SetStateAction<TemplatePreferences>>
) {
  const { authState } = useAuth();

  // Update company info
  const updateCompanyInfo = async (updates: Partial<CompanyInfo>) => {
    if (!authState.currentUser) {
      toast.error('Debe iniciar sesión para guardar cambios');
      return;
    }

    const updatedInfo = { 
      ...companyInfo, 
      ...updates, 
      user_id: authState.currentUser.id 
    };
    
    // Update locally first for immediate UI feedback
    setCompanyInfo(updatedInfo);
    
    try {
      await api.updateCompanyInfo(updatedInfo);
      toast.success('Información de la empresa actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar información de la empresa:', error);
      toast.error('Error al actualizar información de la empresa');
    }
  };

  // Update template preferences
  const updateTemplatePreferences = async (updates: Partial<TemplatePreferences>, showNotification: boolean = true) => {
    if (!authState.currentUser) {
      toast.error('Debe iniciar sesión para guardar cambios');
      return;
    }

    const updatedPreferences = { 
      ...templatePreferences, 
      ...updates, 
      user_id: authState.currentUser.id 
    };
    
    // Update locally first for immediate UI feedback
    setTemplatePreferences(updatedPreferences);
    
    try {
      await api.updateTemplatePreferences(updatedPreferences);
      // Solo mostrar notificación si showNotification es true
      if (showNotification) {
        toast.success('Preferencias de plantilla actualizadas exitosamente');
      }
    } catch (error) {
      console.error('Error al actualizar preferencias de plantilla:', error);
      toast.error('Error al actualizar preferencias de plantilla');
    }
  };

  return {
    updateCompanyInfo,
    updateTemplatePreferences
  };
}
