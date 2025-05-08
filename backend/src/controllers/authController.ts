import { Request, Response } from 'express';
import { supabaseAdmin } from '../db/connection';

// Cambia la contraseña y actualiza los flags en el perfil del usuario
export const changePassword = async (req: Request, res: Response) => {
  const { userId, newPassword } = req.body;
  if (!userId || !newPassword) {
    return res.status(400).json({ error: 'userId y newPassword son requeridos' });
  }

  try {
    // Cambiar la contraseña usando Supabase Admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });
    if (updateError) {
      return res.status(500).json({ error: 'Error actualizando contraseña', details: updateError.message });
    }

    // Actualizar flags en la tabla de perfiles (ajusta el nombre de la tabla si es necesario)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ password_changed: true, must_change_password: false })
      .eq('id', userId);
    if (profileError) {
      return res.status(500).json({ error: 'Contraseña cambiada, pero error actualizando perfil', details: profileError.message });
    }

    return res.status(200).json({ message: 'Contraseña cambiada correctamente' });
  } catch (err) {
    return res.status(500).json({ error: 'Error inesperado', details: err.message });
  }
};
